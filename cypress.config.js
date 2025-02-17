const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "3nhzw7",
  requestTimeout: 20000,
  viewportWidth: 1000,
  viewportHeight: 700,

  e2e: {
    baseUrl: "https://rahulshettyacademy.com/",
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.defaultCommandTimeout = 10000;

      // modify env var value
      config.env.ENVIRONMENT = "production";

      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
