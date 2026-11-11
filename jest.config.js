const { createDefaultPreset } = require('ts-jest')

const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup-env.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    ...tsJestTransformCfg
  }
}
