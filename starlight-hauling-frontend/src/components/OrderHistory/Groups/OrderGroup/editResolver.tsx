import React from 'react';

import {
  IDisposalSite,
  IMaterial,
  IOrderHistoryChange,
  IProject,
  IPromo,
  OrderStatusType,
  TypeOrderHistoryChange,
} from '@root/types';

import { IBaseOrderHistoryChange } from '../types';
import { OrderHistoryDisposalSiteChanges } from './DisposalSite/DisposalSite';
import { OrderHistoryGrandTotalChanges } from './GrandTotal/GrandTotal';
import { OrderHistoryInvoiceAddedChanges } from './Invoice/InvoiceAdded';
import { OrderHistoryMaterialChanges } from './Material/Material';
import { OrderHistoryNotesChanges } from './Notes/Notes';
import { OrderHistoryProjectChanges } from './Project/Project';
import { OrderHistoryPromoChanges } from './Promo/Promo';
import { OrderHistoryServiceDateChanges } from './ServiceDate/ServiceDate';
import { OrderHistoryChangeStatus } from './Status/Status';
import { IOrderHistoryNotesChanges } from './Notes/types';

export const resolveEditedChanges = (
  change: IOrderHistoryChange & { invoiceId?: number },
): React.ReactNode => {
  const props = {
    newValue: change.newValue,
    prevValue: change.previousValue,
    populated: {
      newValue: change.populatedValues?.newValue,
      prevValue: change.populatedValues?.previousValue as TypeOrderHistoryChange,
    },
  };

  switch (change.attribute) {
    case 'status': {
      props.populated.prevValue as OrderStatusType | undefined;
      return (
        <OrderHistoryChangeStatus
          {...(props as unknown as IBaseOrderHistoryChange<OrderStatusType>)}
        />
      );
    }
    case 'grandTotal': {
      return (
        <OrderHistoryGrandTotalChanges
          {...(props as IBaseOrderHistoryChange<number, number, undefined, undefined>)}
        />
      );
    }
    case 'materialId': {
      props.populated.prevValue;
      return (
        <OrderHistoryMaterialChanges
          {...(props as unknown as IBaseOrderHistoryChange<
            number | null,
            number | null,
            IMaterial | null
          >)}
        />
      );
    }
    case 'invoiceNotes': {
      return (
        <OrderHistoryNotesChanges
          {...(props as unknown as IOrderHistoryNotesChanges)}
          title="Invoice Notes"
        />
      );
    }
    case 'driverInstructions': {
      return (
        <OrderHistoryNotesChanges
          {...(props as unknown as IOrderHistoryNotesChanges)}
          title="Instructions for driver"
        />
      );
    }
    case 'disposalSiteId': {
      return (
        <OrderHistoryDisposalSiteChanges
          {...(props as unknown as IBaseOrderHistoryChange<
            number | null,
            number | null,
            IDisposalSite | null
          >)}
        />
      );
    }
    case 'projectId': {
      return (
        <OrderHistoryProjectChanges
          {...(props as unknown as IBaseOrderHistoryChange<
            number | null,
            number | null,
            IProject | null
          >)}
        />
      );
    }
    case 'promoId': {
      return (
        <OrderHistoryPromoChanges
          {...(props as unknown as IBaseOrderHistoryChange<
            number | null,
            number | null,
            IPromo | null
          >)}
        />
      );
    }
    case 'serviceDate': {
      return (
        <OrderHistoryServiceDateChanges
          {...(props as unknown as IBaseOrderHistoryChange<string>)}
        />
      );
    }
    case 'invoiceId': {
      if (change.newValue) {
        const data = { invoiceId: Number(change.newValue) };

        return <OrderHistoryInvoiceAddedChanges {...data} />;
      } else {
        break;
      }
    }
    default: {
      return null;
    }
  }

  return null;
};
