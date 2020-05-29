const { Component } = require('@serverless/core')
const {
  deployKnativeServing,
  ensureOpenShiftProject,
  removeOpenShiftProject,
  openShiftBuild
} = require('./openshift')

function generateId() {
  return Math.random()
    .toString(36)
    .substring(6)
}

class Express extends Component {
  async deploy(inputs) {
    console.log(`Deploying Express App...`)

    const appName = this.name

    const defaults = {
      name: this.name,
      namespace: `${appName}-${generateId()}`
    }

    const config = {
      ...defaults,
      ...inputs,
      ...this.state
    }

    // 1. Ensure K8S Namespace
    console.log(`Ensuring OpenShift Project ${config.namespace}`)
    await ensureOpenShiftProject.call(this, config)
    this.state = config

    // 2. Run S2I build config
    console.log('Run OpenShift S2I build')
    const srcDirPath = await this.unzip(inputs.src)
    const buildResult = await openShiftBuild.call(this, {
      ...config,
      projectLocation: srcDirPath
    })
    // Use digest to pin image
    config.imageDigest = buildResult.build.body.status.output.to.imageDigest
    this.state = config

    // 3. Deploy Knative Serving service
    console.log(`Deploying Knative Service ${config.name}`)
    const knative = await deployKnativeServing.call(this, {
      ...config,
      registryAddress: 'image-registry.openshift-image-registry.svc:5000',
      repository: config.namespace + '/' + config.name,
      tag: 'latest', // Remove that as soon 'digest' is supported
      digest: config.imageDigest
    })
    config.serviceUrl = knative.serviceUrl
    this.state = config

    return this.state
  }

  async remove() {
    const config = {
      ...this.state
    }

    // 1. Remove the K8S Namespace
    this.state = {}
    if (typeof config.namespace !== 'undefined') {
      console.log(`Removing Project ${config.namespace}...`)
    }
    await removeOpenShiftProject.call(this, config)

    return {}
  }
}

module.exports = Express
