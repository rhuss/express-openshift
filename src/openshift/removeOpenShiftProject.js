const openShiftRestClient = require('openshift-rest-client').OpenshiftClient
const openShiftAuth = require('./openShiftAuth')

async function removeOpenShiftProject(inputs) {
  const settings = {
    config: openShiftAuth(this.credentials)
  }
  const client = await openShiftRestClient(settings)
  const project = inputs.namespace
  if (typeof project == 'undefined') {
    console.log('No project to remove')
    return
  }
  try {
    await client.apis['project.openshift.io'].v1.projects(project).delete()
    console.log(`Project ${project} removed`)
    return
  } catch (error) {
    console.log(`Project ${project} could not be removed: ` + error)
  }
}

module.exports = removeOpenShiftProject
