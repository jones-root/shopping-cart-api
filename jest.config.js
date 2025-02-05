/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  clearMocks: true,
  // TODO Setup coverage
  // collectCoverage: true,
  // coverageDirectory: "coverage/unit",
  // coverageProvider: "v8",
  testTimeout: 1000 * 60 * 1,
  transform: {
    "^.+.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json", useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  extensionsToTreatAsEsm: [".ts"],
};

export default config;
