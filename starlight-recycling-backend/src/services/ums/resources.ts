import axios from 'axios';
import { get } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import { TRACING_HEADER, UMS_SERVICE_API_URL } from '../../config';
import { createToken } from '../../utils/serviceToken';

export enum ResourceType {
  GLOBAL = 'GLOBAL',
  RECYCLING = 'RECYCLING',
  HAULING = 'HAULING',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
}

export interface Resource {
  id: string | null;
  image: string | null;
  label: string | null;
  subLabel: string | null;
  loginUrl: string | null;
  srn: string;
  type: ResourceType;
}

export interface ResourceFilter {
  type?: ResourceType;
}

export interface GetResourcesOptions {
  filter?: ResourceFilter;
  offset?: number;
  authorization?: string;
  reqId?: string;
}

export interface ResourcesResponse {
  data: Resource[];
  total: number;
}

export const getResources = async ({
  filter,
  offset,
  authorization,
  reqId,
}: GetResourcesOptions = {}): Promise<ResourcesResponse> => {
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

  const response = await axios.post<{ data: { resources: ResourcesResponse } }>(
    `${UMS_SERVICE_API_URL}/graphql`,
    {
      query: `
        query getResources($filter: ResourcesFilterInput!, $offset: Int!) {
          resources(filter: $filter, offset: $offset) {
            data {
              id
              image
              label
              subLabel
              srn
              type
              loginUrl
            }
            total
          }
        }
      `,
      variables: {
        filter: filter || {},
        offset: offset || 0,
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

  return response.data.data.resources;
};
