import { Routes } from './Routes';
import { Params } from './Params';

const RouteModules = {
  Customers: `${Routes.Customers}/${Params.customerId}`,
  Orders: `${Routes.Orders}/${Params.subPath}`,
  KioskScales: `${Routes.Kiosk}/${Routes.Scales}/${Params.scaleId}`,
};

export const Paths = {
  OrdersModule: {
    Orders: `/${RouteModules.Orders}`,
    MyOrders: `/${Routes.Orders}/${Routes.My}/${Params.subPath}`,
  },

  CustomersModule: {
    Customers: `/${RouteModules.Customers}`,
    Orders: `/${RouteModules.Customers}/${RouteModules.Orders}`,
  },

  KioskModule: {
    Kiosk: `/${RouteModules.KioskScales}`,
    SelfService: `/${RouteModules.KioskScales}/${Routes.Order}/${Routes.Create}`,
    EditSelfServiceOrder: `/${RouteModules.KioskScales}/${Routes.Order}/${Params.orderId}/${Routes.Edit}`,
    TruckOnScale: `/${RouteModules.KioskScales}/${Routes.Order}/${Params.orderId}/${Routes.TruckOnScales}`,
    AttachPhotos: `/${RouteModules.KioskScales}/${Routes.Order}/${Params.orderId}/${Routes.AttachPhotos}`,
    InboundSummary: `/${RouteModules.KioskScales}/${Routes.Order}/${Params.orderId}/${Routes.InboundSummary}`,
  },
};
