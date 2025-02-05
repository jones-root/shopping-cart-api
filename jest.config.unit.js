import baseConfig from "./jest.config.js";

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  testRegex: ["\\.unit.spec\\.ts$"],
};

export default config;
