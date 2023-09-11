import { OrdersViewProps } from '@starlightpro/recycling/views/OrdersView/OrdersView';

export type RecyclingOrdersRouteParams = NonNullable<OrdersViewProps['match']>['params'];
