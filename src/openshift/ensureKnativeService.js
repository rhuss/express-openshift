const KnativeServing = require('@serverless/knative-serving')

async function ensureKnativeService(config) {
  const instance = new KnativeServing()
  instance.credentials = this.credentials
  return instance.deploy(config)
}

module.exports = ensureKnativeService
