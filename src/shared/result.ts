const CODES = ["NOT_FOUND", "OPERATION_FAILED"] as const;
export type ErrorCode = typeof CODES[number];

export const errorCodes = new Proxy({} as Record<ErrorCode, number>, {
  get(_target, property: ErrorCode, _receiver) {
    return CODES.indexOf(property);
  },
});

export class DatabaseError<Code extends ErrorCode> extends Error {
  constructor(cause: Code, message: string) {
    super(message, { cause: errorCodes[cause] });
  }

  toJSON() {
    const { cause, message } = this;
    return { cause: cause as ErrorCode, message };
  }
}

export type Result<Data, Code extends ErrorCode> = Data | DatabaseError<Code>;
