// SAFE INSERT WRAPPER

import { ResultAsync } from "neverthrow";

// -------------------
export enum DbExecutionErrors {
  UnknownError = "UnknownError",
  ErrorWithMessage = "ErrorWithMessage",
}

export type DbExecutionError = {
  type: DbExecutionErrors.UnknownError;
  innerError: unknown;
} | {
  type: DbExecutionErrors.ErrorWithMessage;
  innerError: Error;
};

/**
 * Wraps a promise in a neverthrow ResultAsync and returns a ResultAsync with the result of the promise
 * @param promise - the promise to wrap
 * @returns a ResultAsync with the result of the promise - NEEDS TO BE AWAITED!!!
 */
export function dbSafeExecute<T>(
  promise: PromiseLike<T>,
): ResultAsync<T, DbExecutionError> {
  return ResultAsync.fromPromise(promise, (e) => {
    if (e instanceof Error) {
      return { type: DbExecutionErrors.ErrorWithMessage, innerError: e };
    }

    // TODO: if more specific drizzle errors are known, add them here
    return { type: DbExecutionErrors.UnknownError, innerError: e };
  });
}
