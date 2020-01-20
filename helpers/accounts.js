const request = require("request-promise-native"),
  config = require("../config"),
  getAccounts = (accessToken) => {
    "use strict";

    const options = {
      url: `${config.endPoint}/api/1.0/accounts`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: true,
    };
    return request.get(options)
      .then((accountResponse) => {
        return accountResponse;
      });
  };

module.exports = {
  getAccounts,
};
