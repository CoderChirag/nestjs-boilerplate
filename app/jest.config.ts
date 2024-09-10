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
	collectCoverageFrom: ["src/**/*.(t|j)s"],
	coveragePathIgnorePatterns: [
		".module.ts$",
		"src/main.ts",
		"src/filters",
		"src/dtos",
		"src/constants",
		"src/interceptors",
		"src/utility/configs",
		"src/utility/entities",
		"src/utility/models",
	],
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
