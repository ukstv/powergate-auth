export class UnreachableCaseError extends Error {
  constructor(input: never) {
    super(`Invalid case ${input}`);
  }
}
