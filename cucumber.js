module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/world.ts', 'src/steps/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress', 'html:reports/cucumber.html'],
    worldParameters: {}
  },
  ts: {
    requireModule: ['ts-node/register'],
    require: ['src/world.ts', 'src/steps/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: ['progress', 'html:reports/cucumber.html'],
    worldParameters: {}
  }
}
