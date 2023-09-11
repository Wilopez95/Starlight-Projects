import axios from 'axios';
import { get } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import { Field, registerEnumType, Directive, ObjectType } from 'type-graphql';
import { TRACING_HEADER, UMS_SERVICE_API_URL } from '../../config';
import { createToken } from '../../utils/serviceToken';
import { parseFacilitySrn } from '../../utils/srn';
import { QueryContext } from '../../types/QueryContext';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

registerEnumType(UserStatus, { name: 'UserStatus' });

@Directive('@extends')
@Directive('@key(fields: "id")')
@ObjectType()
export class User {
  @Directive('@external')
  @Field(() => String)
  id!: string;

  email!: string;
  status!: UserStatus;
  name!: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  tenantId: string | null = null;
  tenantName?: string;
}

export interface UsersFilter {
  boundToTenant?: boolean;
}

export interface GetUserOptions {
  id: string;
  reqId?: string;
  filter?: UsersFilter;
  authorization?: string;
}

export interface GetUsersOptions {
  ids: string[];
  reqId?: string;
  filter?: UsersFilter;
  authorization?: string;
  raw?: boolean;
}

export const getUser = async ({
  id,
  reqId,
  authorization,
  filter,
}: GetUserOptions): Promise<User | null> => {
  const requestId = reqId || uuidV4();
  let authorizationHeader = authorization;

  if (!authorizationHeader) {
    const token = await createToken(
      {},
      {
        audience: 'ums',
        requestId,
      },
    );

    authorizationHeader = `ServiceToken ${token}`;
  }

  const response = await axios.post<{ data: { user: User | null } }>(
    `${UMS_SERVICE_API_URL}/graphql`,
    {
      query: `
        query getUser($id: String!, $filter: UsersFilter) {
          user(filter: $filter, id: $id) {
            id
            email
            status
            name
            firstName
            lastName
            title
            tenantId
            tenantName
          }
        }
      `,
      variables: {
        filter,
        id,
      },
    },
    {
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: requestId,
      },
    },
  );

  const error = get(response, 'data.errors[0]');

  if (error) {
    throw error;
  }

  return response.data?.data.user || null;
};

export const getUsers = async ({
  ids,
  reqId,
  authorization,
  raw,
}: GetUsersOptions): Promise<User[] | null> => {
  const requestId = reqId || uuidV4();
  let authorizationHeader = authorization;

  if (!authorizationHeader) {
    const token = await createToken(
      {},
      {
        audience: 'ums',
        requestId,
      },
    );

    authorizationHeader = `ServiceToken ${token}`;
  }

  try {
    const response = await axios.post<{ data: { users: User[] | null } }>(
      `${UMS_SERVICE_API_URL}/graphql`,
      {
        query: `
          query getUsersByIds($ids: [String!]!, $raw: Boolean) {
            users(ids: $ids, raw: $raw) {
              id
              name
              email
            }
          }
        `,
        variables: {
          ids,
          raw,
        },
      },
      {
        headers: {
          Authorization: authorizationHeader,
          [TRACING_HEADER]: requestId,
        },
      },
    );

    return response.data?.data.users || null;
  } catch (e) {
    throw new Error('Failed to fetch users');
  }
};

export const getSalesRepresentativesByBU = async (ctx: QueryContext): Promise<User[]> => {
  const requestId = ctx.reqId || uuidV4();
  const token = await createToken(
    {},
    {
      audience: 'ums',
      requestId,
      subject: ctx.userInfo.id,
    },
  );
  const authorizationHeader = `ServiceToken ${token}`;

  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from user info');
  }

  const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource);
  const response = await axios.post<{ data: { getSalesRepresentativesByBU: User[] | null } }>(
    `${UMS_SERVICE_API_URL}/graphql`,
    {
      query: `
        query getSalesRepresentativesByBU($businessUnitId: Int!) {
          getSalesRepresentativesByBU(businessUnitId: $businessUnitId) {
            id
            name
            firstName
            lastName
          }
        }
      `,
      variables: {
        businessUnitId,
      },
    },
    {
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: requestId,
      },
    },
  );

  const error = get(response, 'data.errors[0]');

  if (error) {
    throw error;
  }

  return response.data?.data.getSalesRepresentativesByBU || [];
};
