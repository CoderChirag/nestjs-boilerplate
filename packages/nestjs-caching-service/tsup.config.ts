import { defineConfig, type Options } from "tsup";
import { devDependencies } from "./package.json";

const baseConfig: Options = {
	format: ["cjs", "esm"],
	external: [...Object.keys(devDependencies)],
	tsconfig: "tsconfig.json",
};

export default defineConfig((options) => {
	return [
		{
			entry: ["src/index.ts"],
			outDir: "dist",
			...baseConfig,
		},
	];
});
