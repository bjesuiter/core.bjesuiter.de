import { ResultAsync } from "neverthrow";

export enum InsertErrors {
  UnknownError = "UnknownError",
}

export interface InsertError {
  type: InsertErrors;
  innerError: unknown;
}

export function dbSafeInsert<T>(
  promise: PromiseLike<T>,
): ResultAsync<T, InsertError> {
  return ResultAsync.fromPromise(promise, (e) => {
    // TODO: if more specific drizzle insert errors are known, add theme here
    return { type: InsertErrors.UnknownError, innerError: e };
  });
}
