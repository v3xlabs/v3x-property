export const isValidId = (id?: string) => id && /^[\dA-Za-z]+$/.test(id);
