import auth0 from './test-auth0';

export default {
  html: async request =>
    await request()
      .expect('Content-Type', /html/)
      .expect(200),
  ...auth0,
};
