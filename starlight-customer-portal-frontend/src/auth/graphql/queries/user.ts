import { ICurrentUser } from '@root/auth/types';
import { umsHttpClient } from '@root/core/api/base';

export const currentUser = async () =>
  await umsHttpClient.graphql<{ me: Omit<ICurrentUser, 'company'> | null }>(
    `
        query CurrentUser {
          me {
            email
            name
            firstName
            lastName
            resource
            permissions
          }
        }
      `,
  );
