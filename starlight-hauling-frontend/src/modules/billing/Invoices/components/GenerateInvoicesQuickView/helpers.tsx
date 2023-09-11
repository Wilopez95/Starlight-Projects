/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { isEmpty } from 'lodash-es';

import { convertInvoicingSubscriptionDates } from '@root/stores/subscription/helpers';
import { convertUnFinalizedSubscriptionOrderDates } from '@root/stores/subscriptionOrder/helpers';

import {
  CustomersWithCommonInvoiceResponse,
  CustomerWithCommonInvoiceDrafts,
  RunCommonInvoicingResponse,
  RunCommonInvoicingResponseNormalized,
  RunInvoicingResponse,
} from '../../../../../api';
import { convertDates } from '../../../../../helpers';
import { convertInvoicingOrderDates } from '../../../../../stores/order/helpers';
import {
  type ICompany,
  type IInvoicingOrder,
  type JsonConversions,
  type IInvoicingSubscriptions,
} from '../../../../../types';
import {
  GenerateInvoicesRequest,
  GenerateSubscriptionInvoicesRequest,
  ISubscriptionInvoiceDraftRequest,
} from '../../types';

import CustomerNavItem from './components/CustomerNavItem/CustomerNavItem';
import { type FormikCustomerWithInvoiceDrafts } from './types';

export const mapCustomerToNavItem = (customer: FormikCustomerWithInvoiceDrafts, index: number) => ({
  label: (
    <CustomerNavItem
      name={customer.name ?? customer.businessName}
      warning={
        !isEmpty(customer.overlimitOrders) ||
        !isEmpty(customer.overpaidOrders) ||
        !isEmpty(customer.unfinalizedOrders)
      }
      address={
        customer.billingAddress || {
          addressLine1: customer.billingAddressLine1,
          addressLine2: customer.billingAddressLine2,
        }
      }
      invoicesCount={customer.invoicesCount}
    />
  ),
  index,
  key: customer.id.toString(),
  customer,
});

export const areAllOrdersResolved = (customers: FormikCustomerWithInvoiceDrafts[]) =>
  customers.every(
    customer => isEmpty(customer.overlimitOrders) && isEmpty(customer.unfinalizedOrders),
  );

export const mapRunOrdersInvoicingResponse = (
  response: JsonConversions<RunInvoicingResponse>,
): RunCommonInvoicingResponseNormalized => ({
  ...response,
  onAccount: response.onAccount.map(customer => ({
    ...convertDates(customer),
    drafts: {
      orders: customer.drafts.map(draft => ({
        ...draft,
        orders: draft.orders.map(order => {
          const purchaseOrder = customer.purchaseOrders?.find(
            pO => pO.id === order.purchaseOrderId,
          );

          return convertInvoicingOrderDates({
            ...order,
            purchaseOrder: purchaseOrder ?? null,
          });
        }),
      })),
    },
  })),
  prepaid: response.prepaid.map(customer => ({
    ...convertDates(customer),
    drafts: {
      orders: customer.drafts.map(draft => ({
        ...draft,
        orders: draft.orders.map(order => {
          const purchaseOrder = customer.purchaseOrders?.find(
            pO => pO.id === order.purchaseOrderId,
          );

          return convertInvoicingOrderDates({
            ...order,
            purchaseOrder: purchaseOrder ?? null,
          });
        }),
      })),
    },
  })),
});

const mapDrafts = (draftSet: CustomersWithCommonInvoiceResponse) => {
  const customerMap = new Map();

  draftSet.subscriptions.forEach(customer => {
    customerMap.set(customer.id, {
      ...customer,
      drafts: {
        subscriptions: customer.drafts.map(draft => ({
          ...draft,
          invoicesTotal: draft.subscriptions.reduce(
            (res, { totalPriceForSubscription }) => res + totalPriceForSubscription,
            0,
          ),
          subscriptions: draft.subscriptions.map(convertInvoicingSubscriptionDates),
        })),
      },
      unfinalizedOrders: (customer.unfinalizedOrders ?? []).map(
        convertUnFinalizedSubscriptionOrderDates,
      ),
    });
  });

  draftSet.orders.forEach(customer => {
    const customerWithSubscriptions = customerMap.get(customer.id);
    const uniqCustomer = {
      ...customerWithSubscriptions,
      ...customer,
      drafts: customerWithSubscriptions?.drafts ?? {},
    };

    customerMap.set(uniqCustomer.id, {
      ...uniqCustomer,
      drafts: {
        orders: customer.drafts.map(draft => ({
          ...draft,
          orders: draft.orders.map(convertInvoicingOrderDates),
        })),
        subscriptions: uniqCustomer.drafts.subscriptions,
      },
      invoicesCount: customer.invoicesCount + +(customerWithSubscriptions?.invoicesCount ?? 0),
      invoicesTotal: customer.invoicesTotal + +(customerWithSubscriptions?.invoicesTotal ?? 0),
    });
  });

  return Array.from<CustomerWithCommonInvoiceDrafts>(customerMap.values());
};

export const mapRunCommonInvoicingResponse = (
  response: JsonConversions<RunCommonInvoicingResponse>,
): RunCommonInvoicingResponseNormalized => {
  return {
    ...response,
    onAccount: mapDrafts(response.onAccount),
    prepaid: mapDrafts(response.prepaid),
  };
};

export const mapSubscriptionsInvoiceDraft = ({
  customer,
  subscriptions,
  currentCompany,
  attachMediaPref,
}: {
  customer: FormikCustomerWithInvoiceDrafts;
  subscriptions: IInvoicingSubscriptions[] | undefined;
  currentCompany?: Pick<ICompany, 'logoUrl' | 'physicalAddress'>;
  attachMediaPref?: boolean;
}) => {
  const payments = 0;
  return {
    payments,
    logoUrl: currentCompany?.logoUrl ?? undefined,
    physicalAddress: currentCompany?.physicalAddress,
    attachMediaPref,
    customerId: customer.id,
    subscriptions,
  };
};
export const mapOrderInvoiceDraft = ({
  customer,
  orders,
  currentCompany,
  attachMediaPref,
  attachTicketPref,
}: {
  customer: FormikCustomerWithInvoiceDrafts;
  orders: IInvoicingOrder[];
  currentCompany?: Pick<ICompany, 'logoUrl' | 'physicalAddress'>;
  attachMediaPref?: boolean;
  attachTicketPref?: boolean;
}) => {
  let payments = 0;

  return {
    payments,
    logoUrl: currentCompany?.logoUrl ?? undefined,
    physicalAddress: currentCompany?.physicalAddress,
    attachMediaPref,
    attachTicketPref,
    customerId: customer.id,
    orders: orders.map(order => {
      const services = [];

      // Only non-overlimit (in other words, fully paid) orders can be displayed in previews.
      if (order.paymentMethod !== 'onAccount') {
        payments += order.grandTotal;
      }

      if (order.billableService) {
        services.push({
          quantity: 1,
          isService: true,
          price: +order.billableServiceTotal,
          description: order.billableService.description,
          billableServiceHistoricalId: order.billableService.id,
        });
      }

      order.lineItems?.forEach(item => {
        services.push({
          quantity: item.quantity,
          isService: false,
          price: Number(item.price ?? 0),
          description: item?.billableLineItem?.description,
          billableLineItemHistoricalId: item?.billableLineItem?.id,
        });
      });

      order.thresholds?.forEach(item => {
        services.push({
          quantity: item.quantity,
          isService: false,
          price: item.price ?? 0,
          description: item?.threshold?.description,
          billableLineItemHistoricalId: null,
        });
      });

      return {
        id: order.id,
        woNumber: order.workOrder?.woNumber,
        poNumber: order.purchaseOrder?.poNumber,
        ticket: order.workOrder?.ticket ?? '',
        beforeTaxesTotal: order.beforeTaxesTotal,
        grandTotal: order.grandTotal,
        surchargesTotal: order.surchargesTotal,
        services,
        serviceDate: order.serviceDate,
        jobSite: {
          ...order.jobSite.address,
          id: order.jobSite.originalId,
        },
        status: order.status,
      };
    }),
  };
};

export const getSubscriptionsInvoicesRequestData = (
  customers: FormikCustomerWithInvoiceDrafts[],
): GenerateSubscriptionInvoicesRequest => {
  return {
    invoices: customers.flatMap(customer =>
      customer.drafts.subscriptions.reduce<ISubscriptionInvoiceDraftRequest[]>((res, draft) => {
        if (
          !draft.subscriptions.some(({ id }) =>
            customer.unfinalizedOrders?.some(({ subscriptionId }) => id === subscriptionId),
          )
        ) {
          res.push({
            customerId: customer.id,
            subscriptions: draft.subscriptions.map(item => {
              const subscription = {
                ...item,
                summaryPerServiceItem: item.summaryPerServiceItem.map(summaryPerServiceItem => {
                  const service = {
                    ...summaryPerServiceItem,
                    lineItems: summaryPerServiceItem.lineItemsProrationInfo.length
                      ? summaryPerServiceItem.lineItemsProrationInfo.map(lineItem => ({
                          lineItemId: lineItem.lineItemId,
                          price: lineItem.price,
                          quantity: lineItem.quantity,
                          totalPrice: lineItem.totalPrice,
                          from: lineItem.from,
                          since: lineItem.since,
                          serviceName: lineItem.description,
                          totalDay: lineItem.totalDay,
                          usageDay: lineItem.usageDay,
                        }))
                      : undefined,
                    serviceItems: summaryPerServiceItem.serviceItemsApplicable.map(
                      serviceItemApplicable => {
                        const result = {
                          ...serviceItemApplicable,
                          subscriptionOrders: serviceItemApplicable.subscriptionOrdersSort.map(
                            subscriptionOrders => {
                              const resultData = {
                                ...subscriptionOrders,
                                subscriptionOrderId: subscriptionOrders.id,
                              };

                              //@ts-expect-error
                              delete resultData?.id;

                              return resultData;
                            },
                          ),
                        };

                        //@ts-expect-error
                        delete result.subscriptionOrdersSort;

                        return result;
                      },
                    ),
                  };

                  //@ts-expect-error
                  delete service.lineItemsProrationInfo;
                  //@ts-expect-error
                  delete service.serviceItemsApplicable;

                  return service;
                }),
                jobSite: item.jobSiteAddress,
              };

              //@ts-expect-error
              delete subscription.jobSiteAddress;

              return subscription;
            }),
            attachMediaPref: draft.attachMediaPref,
          });
        }

        return res;
      }, []),
    ),
  };
};

export const getOrdersInvoicesRequestData = (
  customers: FormikCustomerWithInvoiceDrafts[],
  omitUnresolved?: boolean,
): GenerateInvoicesRequest => {
  return {
    invoices: customers.flatMap(customer =>
      customer.drafts.orders
        .filter(draft => !draft.orders.some(({ id }) => customer.overpaidOrders[id]))
        .filter(draft =>
          omitUnresolved ? !draft.orders.some(({ id }) => customer.overlimitOrders[id]) : true,
        )
        .map(draft =>
          mapOrderInvoiceDraft({
            customer,
            orders: draft.orders,
            attachMediaPref: draft.attachMediaPref,
            attachTicketPref: draft.attachTicketPref,
          }),
        ),
    ),
  };
};

export const countInvoices = (customers: FormikCustomerWithInvoiceDrafts[]) =>
  customers.reduce((total, customer) => {
    const overlimitOrders = Object.keys(customer.overlimitOrders);
    const overpaidOrders = Object.keys(customer.overpaidOrders);

    const availableSubscriptionCount = customer.unfinalizedOrders?.length
      ? 0
      : customer.drafts.subscriptions.length;

    return (
      total +
      customer.drafts.orders.filter(
        draft =>
          draft.orders.every(({ id }) => !overpaidOrders.includes(String(id))) &&
          draft.orders.every(({ id }) => !overlimitOrders.includes(String(id))),
      ).length +
      availableSubscriptionCount
    );
  }, 0);
