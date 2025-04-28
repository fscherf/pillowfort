module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  coverageReporters: ["text", "html"],
  coverageDirectory: "./coverage"
};
