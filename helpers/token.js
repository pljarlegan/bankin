const fs = require("fs").promises,
  request = require("request-promise-native"),
  jwt = require("jsonwebtoken"),
  config = require("../config"),
  aud = "https://revolut.com", // Constant
  payload = {
    iss: config.token.issuer,
    sub: config.clientId,
    aud: aud,
  },

  saveToken = (tokensObj) => {
    "use strict";

    config.accessToken = tokensObj.access_token;
    if (tokensObj.ref) {
      config.refreshToken = tokensObj.refresh_token;
    }
    config.tokenType = tokensObj.token_type;
    config.expiresIn = tokensObj.expires_in;
    return fs.writeFile("./config.json", JSON.stringify(config, null, 2), "utf8")
      .then(() => {
        return tokensObj;
      });
  },
  codeToAccessToken = (code) => {
    "use strict";
    return fs.readFile(config.token.privateKeyName)
      .then((privateKey) => {
        const jwToken = jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn: Math.floor(Date.now() / 1000 + 60) }),
          options = {
            url: `${config.endPoint}/api/1.0/auth/token`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            form: {
              grant_type: "authorization_code", // eslint-disable-line camelcase
              code: code,
              client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer", // eslint-disable-line camelcase
              client_id: config.clientId, // eslint-disable-line camelcase
              client_assertion: jwToken, // eslint-disable-line camelcase
            },
            json: true,
          };
        return request.post(options)
          .then((accessTokenResponse) => {
            return saveToken(accessTokenResponse);
          });
      });
  },
  refreshAccessToken = () => {
    "use strict";
    return fs.readFile(config.token.privateKeyName)
      .then((privateKey) => {
        const jwToken = jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn: Math.floor(Date.now() / 1000 + 60) }),
          options = {
            url: `${config.endPoint}/api/1.0/auth/token`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            form: {
              grant_type: "refresh_token", // eslint-disable-line camelcase
              refresh_token: config.refreshToken, // eslint-disable-line camelcase
              client_id: config.clientId, // eslint-disable-line camelcase
              client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer", // eslint-disable-line camelcase
              client_assertion: jwToken, // eslint-disable-line camelcase
            },
            json: true,
          };
        return request.post(options)
          .then((accessTokenResponse) => {
            return saveToken(accessTokenResponse);
          });
      });
  },
  getAccessToken = (code) => {
    "use strict";

    if (config.accessToken === undefined) {
      return codeToAccessToken(code);
    }
    if (config.expiresIn === 0) {
      console.log("its time to refresh AccessToken"); // eslint-disable-line no-console
      return refreshAccessToken();
    }
    return Promise.resolve({
      access_token: config.access_token, // eslint-disable-line camelcase
      refresh_token: config.refresh_token, // eslint-disable-line camelcase
      token_type: config.token_type, // eslint-disable-line camelcase
      expires_in: config.expires_in, // eslint-disable-line camelcase
    });
  };

module.exports = {
  getAccessToken,
};
