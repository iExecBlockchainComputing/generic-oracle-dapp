const dapp = require('./dapp');

try {
  dapp();
} catch (e) {
  console.error(e);
  process.exit(1);
}
