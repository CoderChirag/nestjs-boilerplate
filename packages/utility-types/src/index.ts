export interface Logger {
	log(...args: unknown[]): unknown;
	error(...args: unknown[]): unknown;
}
