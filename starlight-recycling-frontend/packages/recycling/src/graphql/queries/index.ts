import { USER_INFO_TYPE_DEFS, UserInfoMutations } from '@starlightpro/common';
import { ReactElementRersolvers, REACT_ELEMENT_SCALAR } from './ReactElementScalar';

export const TYPE_DEFS = [REACT_ELEMENT_SCALAR, USER_INFO_TYPE_DEFS];

export const resolvers = {
  ...ReactElementRersolvers,
};

export const mutations = {
  ...UserInfoMutations,
};
