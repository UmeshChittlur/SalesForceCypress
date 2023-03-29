import { defineConfig } from "cypress";
import * as fs from "fs-extra";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { authEndpoints, orgs } from "./cypress/support/urls";
import { users } from "./cypress/support/users";

device.config({ path: "local.env" })

const timeouts = {
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 20000,
  requestTimeout: 20000,
};

const viewport = {
  viewportHeight: 1250,
  viewportWidth: 1840,
};

const jwtExpirySeconds = (seconds) =>
  Math.floor(Date.now() / 1000 + seconds)

module.exports = defineConfig({
  env: {
    user_name: users.tc.tcuser,
  },

  e2e: {
    baseUrl: orgs.tc,
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalSkipDomainInjection: ["*.salesforce.com", "*.force.com"],
    setupNodeEvents(on, config) {
      on("task", {
        buildjwt() {
          return jwt.sign({
            iss: config.env.CLIENT_ID || process.env.CLIENT_ID,
            sub: config.env.user_name,
            aud: authEndpoints.test,
            exp: jwtExpirySeconds(120),

          },
            config.env.PRIVATE.KEY,
            { algorithm: "RS256" }
          );
        },
      });

      // for local development SAVE RSA cert server.key
      if (!config.env.PRIVATE_KEY)
      config.env.PRIVATE_KEY = fs.readFile("./server.key");

      return config;
    },
  },
  ...timeouts,
  ...viewport,
});
