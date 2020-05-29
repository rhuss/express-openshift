// `deploy`
const deployKnativeServing = require('./ensureKnativeService')
const ensureOpenShiftProject = require('./ensureOpenShiftProject')
const openShiftBuild = require('./openShiftBuild')
// `remove`
const removeOpenShiftProject = require('./removeOpenShiftProject')

module.exports = {
  deployKnativeServing,
  ensureOpenShiftProject,
  removeOpenShiftProject,
  openShiftBuild
}
