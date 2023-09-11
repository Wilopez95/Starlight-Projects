class I18nError<T> extends Error {
  constructor(message: T & string) {
    super(message);
    this.name = this.constructor?.name ?? '';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notValidProvidedLanguage = (languages: string[]) => {
  throw new I18nError(`your provided language does not exist in supported languages lists,
  supported languages: ${languages.toString()}`);
};

export const poError = <T extends string>(e: T) => {
  throw new I18nError<T>(e);
};
