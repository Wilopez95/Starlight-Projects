export const expect = (code, req) =>
  req.expect('Content-Type', /json/).expect(code);

export const body = req => req.then(res => res.body);
