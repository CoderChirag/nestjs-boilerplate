export type WithMock<T> = {
	[K in keyof T]: T[K] extends (...args: any) => any
		? T[K] & ReturnType<typeof jest.fn<any, any>>
		: T[K] extends object
			? WithMock<T[K]>
			: T[K];
};
