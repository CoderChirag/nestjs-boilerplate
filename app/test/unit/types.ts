export type WithMock<T> = {
	[K in keyof T]: T[K] & ReturnType<typeof jest.fn>;
};
