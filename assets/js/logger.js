/** Shared console logger so every module's output carries the same prefix. */
const LOG_PREFIX = "[DeskFocus]";

export const log = (message) => console.info(`${LOG_PREFIX} ${message}`);

export const warn = (message, error) => console.warn(`${LOG_PREFIX} ${message}`, error ?? "");
