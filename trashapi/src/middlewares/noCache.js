export const noCacheMiddleware = async (req, res, next) => {
  res.set('cache-control', 'no-store');
  next();
};
