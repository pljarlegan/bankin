// get Accounts for clientId in config
// need to configure ApiAccess (https://sandbox-business.revolut.com/settings/api)

const config = require("./config"),
  open = require("openurl").open,
  server = require("./server").server,
  getAccessToken = require("./helpers/token").getAccessToken,
  getAccounts = require("./helpers/accounts").getAccounts;

if (undefined === config.clientId) {
  console.log("plz register clientId on config.json"); // eslint-disable-line no-console
  return;
}

if (undefined !== config.code) {
  getAccessToken(config.code)
    .then(() => {
      "use strict";
      return getAccounts(config.accessToken);
    })
    .then((accounts) => {
      "use strict";
      if (!accounts) {
        throw new Error("unable to get accounts");
      }
      console.log({ accounts }); // eslint-disable-line no-console
    })
    .catch((err) => {
      "use strict";

      if (err.response) {
        throw new Error(JSON.stringify({ statusCode: err.response.statusCode, body: err.response.body }, null, 2));
      }
      throw new Error(err);
    });
  return;
}


// need an app code : launch web server && wait for register hook
server.listener = server.app.listen(3000, () => {
  "use strict";
  console.log(`app is listening on port http://127.0.0.1:${server.listener.address().port}`); // eslint-disable-line no-console
});
open(`https://sandbox-business.revolut.com/app-confirm?client_id=${config.clientId}&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code#authorise`);

