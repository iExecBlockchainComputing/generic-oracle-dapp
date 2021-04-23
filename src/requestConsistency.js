const nbFileChecker = (nbFile) => {
  switch (nbFile) {
    case '0':
      throw Error('Paramset missing in input files');
    case '1':
      break;
    default:
      throw Error('Several input files detected while expected one');
  }
};

module.exports = {
  nbFileChecker,
};
