import { WorkOrderCommentsFragment } from '@root/graphql/fragments/workOrderComments';
import { IWorkOrderComment } from '@root/types';

import { BaseGraphqlService } from '../base';

import { IWorkOrderCommentParams } from './types';

export class WorkOrderCommentsService extends BaseGraphqlService {
  getWorkOrderComments(id: string) {
    return this.graphql<
      { workOrder: { comments: IWorkOrderComment[] } },
      {
        id: string;
      }
    >(
      `
        query WorkOrder($id: ID!) {
          workOrder(id: $id) {
            comments {
              ${WorkOrderCommentsFragment}
            }
          }
        }
      `,
      { id },
    );
  }

  createWorkOrderComment(variables: IWorkOrderCommentParams) {
    return this.graphql<
      { createComment: IWorkOrderComment },
      { variables: IWorkOrderCommentParams }
    >(
      `mutation CreateComment($variables: CreateCommentInput!) {
        createComment(input: $variables) {
          ${WorkOrderCommentsFragment}
        }
      }`,
      {
        variables,
      },
    );
  }
}
