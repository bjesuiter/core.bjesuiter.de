// SAFE INSERT WRAPPER

import { ResultAsync } from "neverthrow";

// -------------------
export enum InsertErrors {
  UnknownError = "UnknownError",
  ErrorWithMessage = "ErrorWithMessage",
}

export type InsertError = {
  type: InsertErrors.UnknownError;
  innerError: unknown;
} | {
  type: InsertErrors.ErrorWithMessage;
  innerError: Error;
};

export function dbSafeInsert<T>(
  promise: PromiseLike<T>,
): ResultAsync<T, InsertError> {
  return ResultAsync.fromPromise(promise, (e) => {
    if (e instanceof Error) {
      return { type: InsertErrors.ErrorWithMessage, innerError: e };
    }

    // TODO: if more specific drizzle insert errors are known, add theme here
    return { type: InsertErrors.UnknownError, innerError: e };
  });
}
