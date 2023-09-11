import { IFiltersES, IMatch, IBool } from '../Interfaces/ElasticSearch';

export const mustFilterES = (filters: IFiltersES): IBool => {
  const must: IMatch[] = Object.keys(filters).map(key => {
    return { match: { [key]: filters[key] } };
  });
  return { must };
};
