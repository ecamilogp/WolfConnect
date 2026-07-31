export const logger = {
  info: (message: string, meta?: unknown) => console.log(message, meta ?? ''),
  error: (message: string, error: unknown) => console.error(message, error),
};
