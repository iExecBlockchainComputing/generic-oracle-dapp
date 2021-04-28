const dapp = require('./dapp');

dapp().catch((e) => {
  console.error(e);
  process.exit(1);
});
