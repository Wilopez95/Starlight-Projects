import { RoleDetailsFragment, RoleDisplayFragment } from '@root/fragments/usersAndRoles';
import { UserManagementMapper } from '@root/types';

import { BaseGraphqlService, GraphqlVariables } from '../base';

import { IRoleInput, IRoleQueryResult } from './types';

export class RoleService extends BaseGraphqlService {
  constructor() {
    super('ums');
  }

  getRoles(variables: GraphqlVariables) {
    return this.graphql<{ listRoles: { data: UserManagementMapper<IRoleQueryResult>[] } }>(
      `
        query GetRoles($offset: Int, $limit: Int) {
          listRoles(offset: $offset, limit: $limit) {
            data {
              ${RoleDetailsFragment}
            }
          }
        }
      `,
      variables,
    );
  }

  getRolesForDisplay(variables: GraphqlVariables) {
    return this.graphql<{ roles: UserManagementMapper<IRoleQueryResult>[] }>(
      `
        query GetRoles {
          roles {
            ${RoleDisplayFragment}
          }
        }
      `,
      variables,
    );
  }

  createRole(role: UserManagementMapper<IRoleInput>) {
    return this.graphql<{ createRole: UserManagementMapper<IRoleQueryResult> }>(
      `
        mutation CreateRole($role: RoleInput!) {
          createRole(roleData: $role) {
            ${RoleDetailsFragment}
          }
        }
      `,
      { role },
    );
  }

  updateRole(id: string, role: UserManagementMapper<IRoleInput>) {
    return this.graphql<{ updateRole: UserManagementMapper<IRoleQueryResult> }>(
      `
        mutation UpdateRole($id: String!, $role: RoleInput!) {
          updateRole(id: $id, roleData: $role) {
            ${RoleDetailsFragment}
          }
        }
      `,
      { id, role },
    );
  }

  deleteRole(id: string) {
    return this.graphql<{ deleteRole: boolean }>(
      `
      mutation DeleteRole($id: String!) {
        deleteRole(id: $id)
      }
    `,
      { id },
    );
  }
}
