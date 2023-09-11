import { UpdateWorkOrderFragment, WorkOrderFragment } from '@root/graphql/fragments/workOrder';
import { IMedia, IWorkOrder } from '@root/types';

import { BaseGraphqlService } from '../base';

import {
  IBulkActionWorkOrdersResult,
  IBulkRescheduleWorkOrderInput,
  IUpdateWorkOrderParams,
  IWorkOrdersBulkStatusChange,
  IWorkOrdersParams,
} from './types';

export class WorkOrdersService extends BaseGraphqlService {
  getWorkOrdersList(id: number, filters: IWorkOrdersParams, searchInput?: string) {
    return this.graphql<
      { workOrders: IWorkOrder[] },
      {
        businessUnitId: number;
        filters: IWorkOrdersParams;
        searchInput?: string;
      }
    >(
      `
        query WorkOrders($businessUnitId: Int!, $filters: WorkOrderFilters!, $searchInput: String) {
          workOrders(businessUnitId: $businessUnitId, input: $filters, searchInput: $searchInput) {
            ${WorkOrderFragment}
          }
        }
      `,
      { businessUnitId: id, filters, searchInput },
    );
  }

  getWorkOrder(id: string) {
    return this.graphql<{ workOrder: IWorkOrder }, { id: string }>(
      `
        query WorkOrder($id: ID!) {
          workOrder(id: $id) {
            ${WorkOrderFragment}
          }
        }
      `,
      {
        id,
      },
    );
  }

  workOrdersBulkStatusChange(input: IWorkOrdersBulkStatusChange) {
    return this.graphql<
      {
        workOrdersBulkStatusChange: IBulkActionWorkOrdersResult | null;
      },
      {
        input: IWorkOrdersBulkStatusChange;
      }
    >(
      `mutation WorkOrdersBulkStatusChange($input: BulkStatusChangeWorkOrderInput!) {
        workOrdersBulkStatusChange(input: $input) {
          valid
          invalid
        }
      }`,
      {
        input,
      },
    );
  }

  updateWorkOrder(data: Omit<IUpdateWorkOrderParams, 'media'>) {
    return this.graphql<
      {
        updateWorkOrder: IWorkOrder & {
          __typename: string;
        };
      },
      {
        updateWorkOrder: Omit<IUpdateWorkOrderParams, 'media'>;
      }
    >(
      `
      mutation UpdateWorkOrder($updateWorkOrder: UpdateWorkOrderInput!) {
        updateWorkOrder(input: $updateWorkOrder) {
          ${UpdateWorkOrderFragment}
        }
      }
    `,
      {
        updateWorkOrder: data,
      },
    );
  }

  updateWorkOrderMedia(id: number, media: File) {
    return this.graphql<
      {
        uploadWorkOrderMedia: IMedia[];
      },
      {
        id: number;
        input: File;
      }
    >(
      `
      mutation UploadWorkOrderMedia($id: Int!, $input: Upload!) {
        uploadWorkOrderMedia(id: $id, input: $input) {
          id
          workOrderId
          url
          timestamp
          author
          fileName
        }
      }
    `,
      {
        id,
        input: media,
      },
    );
  }

  deleteWorkOrderMedia(ids: number[], workOrderId: number) {
    return this.graphql<unknown, { ids: number[]; workOrderId: number }>(
      `
      mutation DeleteWorkOrderMedia($ids: [ID!]!, $workOrderId: Int!) {
        deleteWorkOrderMedia(ids: $ids, workOrderId: $workOrderId)
      }
    `,
      {
        ids,
        workOrderId,
      },
    );
  }

  workOrdersBulkReschedule(params: IBulkRescheduleWorkOrderInput) {
    return this.graphql<
      { workOrdersBulkReschedule: IBulkActionWorkOrdersResult | null },
      {
        params: IBulkRescheduleWorkOrderInput;
      }
    >(
      `
        mutation WorkOrdersBulkReschedule($params: BulkRescheduleWorkOrderInput!) {
          workOrdersBulkReschedule(input: $params) {
            valid
            invalid
          }
        }
      `,
      { params },
    );
  }
}
