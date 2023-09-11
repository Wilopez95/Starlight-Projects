/**
 *
 * @name getToken
 * @param {express$Request} req the request object
 * @returns {string|null} the JWT or null if not present
 */
const getToken = req => {
  const { authorization } = req.headers;
  const [type, tokenId] = authorization?.split(' ') ?? [];

  if (type?.toLowerCase() === 'bearer') {
    return tokenId;
  }
  return null;
};

export default getToken;
