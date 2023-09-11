import { UserDetailsFragment, UserDetailsInGridFragment } from '@root/fragments/usersAndRoles';
import { UserManagementMapper } from '@root/types/helpers/UserManagementMapper';

import { BaseGraphqlService, GraphqlVariables } from '../base';

import { IUserCreateInput, IUserQueryResult, IUserUpdateInput } from './types';

export class UserService extends BaseGraphqlService {
  constructor() {
    super('ums');
  }

  getUserById(id: string) {
    return this.graphql<{ user: UserManagementMapper<IUserQueryResult> }>(
      `
        query GetUserById($id: String) {
          user(id: $id) {
            ${UserDetailsFragment}
          }
        }
      `,
      { id },
    );
  }

  getUsers(variables: GraphqlVariables & { query?: string }) {
    return this.graphql<{ listUsers: { data: UserManagementMapper<IUserQueryResult>[] } }>(
      `
        query GetUsers($offset: Int, $limit: Int, $query: String) {
          listUsers(offset: $offset, limit: $limit, query: $query) {
            data {
              ${UserDetailsInGridFragment}
            }
          }
        }
      `,
      variables,
    );
  }

  getSalesRepresentativesByBU(variables: GraphqlVariables & { businessUnitId: number }) {
    return this.graphql<{ getSalesRepresentativesByBU: UserManagementMapper<IUserQueryResult>[] }>(
      `
        query GetSalesRepresentativesByBU($businessUnitId: Int!) {
          getSalesRepresentativesByBU(businessUnitId: $businessUnitId) {
            ${UserDetailsFragment}
          }
        }
      `,
      variables,
    );
  }

  createUser(newUser: UserManagementMapper<IUserCreateInput>) {
    return this.graphql<{ createUser: UserManagementMapper<IUserQueryResult> }>(
      `
        mutation CreateUser($user: UserCreateInput!) {
          createUser(userData: $user) {
            ${UserDetailsFragment}
          }
        }
      `,
      { user: newUser },
    );
  }

  updateUser(id: string, user: UserManagementMapper<IUserUpdateInput>) {
    return this.graphql<{ updateUser: UserManagementMapper<IUserQueryResult> }>(
      `
      mutation UpdateUser($id: String!, $user: UserUpdateInput!) {
        updateUser(id: $id, userData: $user) {
          ${UserDetailsFragment}
        }
      }
      `,
      {
        id,
        user,
      },
    );
  }

  deleteUser(id: string) {
    return this.graphql<{ deleteUser: boolean }>(
      `
      mutation DeleteUser($id: String!) {
        deleteUser(id: $id)
      }
    `,
      { id },
    );
  }

  getByIds(ids: string[]) {
    return this.graphql<{
      users: (UserManagementMapper<IUserQueryResult> | null)[];
    }>(
      `
      query GetUsersByIds($ids: [String!]!) {
        users(ids: $ids) {
          ${UserDetailsFragment}
        }
      }
    `,
      { ids },
    );
  }
}
