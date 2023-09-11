import { PaymentFragment } from './payment';

// fragment invoice on Invoice
export const InvoiceFragment = `
  id
  type
  dueDate
  createdAt
  csrName
  csrEmail
  total
  pdfUrl
  balance
  writeOff
  businessLines {
    id
    shortName
    name
  }
`;

export const InvoiceCustomer = `
  onAccount
  name
  id
`;

// fragment detailedInvoice on Invoice
export const DetailedInvoiceFragment = `
  payments {
    ${PaymentFragment}
  }
  emails {
    id
    status
    receiver
    createdAt
  }
`;

export const InvoicedOrderFragment = `
  id
  grandTotal
  serviceDate
  lineItems {
    isService
    price
    description
  }
`;

export const SubOrderLineItem = `
  id
  price
  quantity
  serviceName
`;

export const InvoicedSubscriptionFragment = `
  id
  anniversaryBilling
  billingCycle
  billingType
  businessLineId
  endDate
  nextBillingPeriodFrom
  nextBillingPeriodTo
  totalPriceForSubscription
  startDate

  nonServiceOrder {
    id
    serviceDate
    price
    quantity
    serviceName
    grandTotal
    subOrderLineItems {
      ${SubOrderLineItem}
    }
  }

  serviceItems {
    serviceItemId
    serviceName
    lineItems {
      id
      price
      quantity
      totalPrice
      periodTo
      periodSince
      serviceName
      totalDay
      usageDay
    }
    serviceItems {
      id
      totalPrice
      totalDay
      usageDay
      price
      quantity
      periodTo
      periodSince
      subscriptionOrders {
        id
        serviceDate
        price
        quantity
        serviceName
        subOrderLineItems {
          ${SubOrderLineItem}
        }
      }
    }
  }
`;
