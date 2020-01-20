# bankin test

## run script
- `yarn` = install dependencies
- [configure your revolut account](https://sandbox-business.revolut.com/settings/api)
- `mv config.sample.json config.json`   
  configure script (from sample config) : add 'clientId'
- `yarn start` = run script 
- look at your console for get accounts results  

## generate keys ...
```shell script
openssl genrsa -out privatekey.pem 1024
openssl req -new -x509 -key privatekey.pem -out publickey.cer -days 1825
```
