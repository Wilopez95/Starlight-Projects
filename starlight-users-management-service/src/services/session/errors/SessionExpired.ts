export class SessionExpired extends Error {
  constructor() {
    super('Session Expired');
  }
}
