module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*.{ts,js}"],
  coverageReporters: ["text", "html"],
  coverageDirectory: "./coverage"
};
