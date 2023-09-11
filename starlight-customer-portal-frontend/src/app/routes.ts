import { IRoute } from '@root/core/types';
import { customerRoutes } from '@root/customer/routes';

export const routes: IRoute[] = [...customerRoutes];
