export class InvalidExchangeCode extends Error {
  constructor() {
    super('Invalid exchange code');
  }
}
