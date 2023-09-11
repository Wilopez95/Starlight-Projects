import { AtLeast } from '@root/types/helpers/atLeast';

import { IEntity } from './';

export interface ICustomerComment extends IEntity {
  customerId: number;
  content: string;
  authorId: string;
}

export type CustomerCommentRequest = AtLeast<ICustomerComment, 'content'> & {
  authorId: string;
};
