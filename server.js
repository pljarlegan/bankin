let express = require("express");
const fs = require("fs").promises,
  config = require("../config"),
  getAccessToken = require("./helpers/token").getAccessToken,
  getAccounts = require("./helpers/accounts").getAccounts;
const app = express(),
  server = { app };
app.use(express.static("public"));

app.get("/", (req, res, next) => { // eslint-disable-line no-unused-vars
  "use strict";
  const code = req.query.code;

  if (!code) {
    // Code is required to obtain access token
    return res.sendFile(`${__dirname }/views/index_noCode.html`);
  }
  config.code = code;
  fs.writeFile("./config.json", JSON.stringify(config, null, 2), "utf8")
    .then(() => {
      getAccessToken(config.code)
        .then(() => {
          server.listener.close();
          return getAccounts(config.accessToken);
        })
        .then((accounts) => {
          if (!accounts) {
            throw new Error("unable to get accounts");
          }
          console.log({ accounts }); // eslint-disable-line no-console
        })
        .catch((err) => {
          if (err.response) {
            throw new Error(JSON.stringify({ statusCode: err.response.statusCode, body: err.response.body }, null, 2));
          }
          throw new Error(err);
        });
    });
  return res.sendFile(`${__dirname }/views/index.html`);

});

module.exports = {
  app,
  server,
};
