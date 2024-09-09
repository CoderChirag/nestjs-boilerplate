module.exports = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: ".",
	verbose: true,
	silent: false,
	testEnvironment: "node",
	testRegex: "test/unit/.*\\.spec\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": "@swc/jest",
	},
	// setupFilesAfterEnv: ["<rootDir>/test/unit/setup-tests.ts"],
	coveragePathIgnorePatterns: [],
	collectCoverage: true,
	collectCoverageFrom: ["**/*.(t|j)s"],
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "coverage",
				outputName: "test-results.xml",
			},
		],
	],
	coverageDirectory: "./coverage",
	coverageReporters: ["json", "html", "lcov", "text", "cobertura"],
};
