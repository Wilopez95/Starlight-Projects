import React from 'react';

import { IOrderHistoryChange } from '../../types';
import { OrderHistoryArrivedAtChanges } from './ArrivedAt/ArrivedAt';
import { OrderHistoryCanSizeChanges } from './CanSize/CanSize';
import { OrderHistoryCustomerJobSiteChanges } from './CustomerJobSite/CustomerJobSite';
import { OrderHistoryCustomerTruckChanges } from './CustomerTruck/CustomerTruck';
import { OrderHistoryDepartureAtChanges } from './DepartureAt/DepartureAt';
import { OrderHistoryDestinationChanges } from './Destination/Destination';
import { GenericPropertiesChanges } from './Generic/Generic';

import { OrderHistoryGrandTotalChanges } from './GrandTotal/GrandTotal';
import { OrderHistoryInvoiceAddedChanges } from './Invoice/InvoiceAdded';
import { OrderHistoryJobSiteChanges } from './JobSite/JobSite';
import { OrderHistoryMassChanges } from './MassChanges/MassChanges';
import { OrderHistoryMaterialChanges } from './Material/Material';
import { OrderHistoryMaterialsDistributionChanges } from './MaterialsDistribution/MaterialsDistribution';
import { OrderHistoryMediaChanges } from './MediaFiles/MediaFilesChanges';
import { OrderHistoryMiscellaneousMaterialsDistributionChanges } from './MiscellaneousMaterialsDistribution/MiscellaneousMaterialsDistribution';
import { OrderHistoryNotesChanges } from './Notes/Notes';
import { OrderHistoryOriginDistrictChanges } from './OriginDistrict/OriginDistrict';
import { OrderHistoryPriceGroupChanges } from './PriceGroup/PriceGroup';
import { OrderHistoryProjectChanges } from './Project/Project';
import { OrderHistoryChangeStatus } from './Status/Status';

export const resolveEditedChanges = (
  change: IOrderHistoryChange & { invoiceId?: number },
): React.ReactNode => {
  const props = {
    newValue: change.newValue,
    prevValue: change.previousValue,
    populated: {
      newValue: change.populatedValues?.newValue,
      prevValue: change.populatedValues?.previousValue,
    },
  };

  switch (change.attribute) {
    case 'status': {
      return <OrderHistoryChangeStatus {...props} />;
    }
    case 'grandTotal': {
      return <OrderHistoryGrandTotalChanges {...props} />;
    }
    case 'materialId': {
      return <OrderHistoryMaterialChanges {...props} />;
    }
    case 'invoiceNotes': {
      return <OrderHistoryNotesChanges {...props} />;
    }
    case 'projectId': {
      return <OrderHistoryProjectChanges {...props} />;
    }
    case 'invoiceId': {
      if (change.newValue) {
        const data = { invoiceId: Number(change.newValue) };

        return <OrderHistoryInvoiceAddedChanges {...data} />;
      } else {
        break;
      }
    }
    case 'priceGroupId': {
      return <OrderHistoryPriceGroupChanges {...props} />;
    }
    case 'customerJobSiteId':
      return <OrderHistoryCustomerJobSiteChanges {...props} />;
    case 'customerTruck':
      return <OrderHistoryCustomerTruckChanges {...props} />;
    case 'originDistrictId':
      return <OrderHistoryOriginDistrictChanges {...props} />;
    case 'jobSiteId':
      return <OrderHistoryJobSiteChanges {...props} />;
    case 'containerId':
      return <OrderHistoryCanSizeChanges {...props} />;
    case 'paymentMethod':
    case 'PONumber':
    case 'WONumber':
      return (
        <GenericPropertiesChanges
          attribute={change.attribute}
          prevValue={change.populatedValues?.previousValue ?? change.previousValue}
          newValue={change.populatedValues?.newValue ?? change.newValue}
        />
      );
    case 'weightIn':
      return <OrderHistoryMassChanges {...props} subject="Weight In" />;
    case 'weightOut':
      return <OrderHistoryMassChanges {...props} subject="Weight Out" />;
    case 'note':
      return <OrderHistoryNotesChanges {...props} />;
    case 'departureAt':
      return <OrderHistoryDepartureAtChanges {...props} />;
    case 'arrivedAt':
      return <OrderHistoryArrivedAtChanges {...props} />;
    case 'materialsDistribution':
      return <OrderHistoryMaterialsDistributionChanges {...props} />;
    case 'miscellaneousMaterialsDistribution':
      return <OrderHistoryMiscellaneousMaterialsDistributionChanges {...props} />;
    case 'images':
      return <OrderHistoryMediaChanges {...props} />;
    case 'destinationId':
      return <OrderHistoryDestinationChanges {...props} />;
    default:
      return null;
  }

  return null;
};
