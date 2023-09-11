export default {
  async html(request) {
    await request()
      .expect('Content-Type', /text/)
      .expect(200);
  },
};
