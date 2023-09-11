import R from 'ramda';
import { findAll as materialFindAll } from './materials.js';
import { findAll as sizeFindAll } from './sizes.js';

/**
 * It returns an array of material names
 * @param query - The query string that the user has entered.
 * @param [params] - The parameters to be passed to the query.
 * @returns An array of material names.
 */
export const getMaterials = async (query, params = {}) => {
  const materials = await materialFindAll(params, query);
  if (!materials?.length) {
    return [];
  }
  return R.map(material => material.name, materials);
};

/**
 * It returns an array of all the sizes in the database
 * @param query - The query string from the request.
 * @param [params] - This is the object that will be passed to the findAll method.
 * @returns An array of size names.
 */
export const getSizes = async (query, params = {}) => {
  const sizes = await sizeFindAll(params, query);
  if (!sizes?.length) {
    return [];
  }
  return R.map(size => size.name, sizes);
};

export default { getMaterials, getSizes };
