module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/lib/", "/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  transformIgnorePatterns: ["node_modules/(?!(@iexec)/)"], //Jest encountered an unexpected token 'export'
};
