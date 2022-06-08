import { Dapp } from './dapp';

new Dapp().start().catch((e) => {
  console.error(e);
  process.exit(1);
});
