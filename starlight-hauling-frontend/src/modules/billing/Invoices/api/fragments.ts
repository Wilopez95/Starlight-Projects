import { PaymentFragment } from '../../Payments/api/fragments';
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
  financeChargeId
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
  serviceItems {
    serviceItemId
    serviceName
    lineItems {
      id
      price
      quantity
      periodTo
      periodSince
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
        sequenceId
        serviceDate
        price
        quantity
      }
    }
  }
  
`;
