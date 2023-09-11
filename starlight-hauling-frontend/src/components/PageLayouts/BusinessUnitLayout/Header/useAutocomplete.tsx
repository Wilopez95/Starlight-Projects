import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { IAutocompleteConfig } from '@starlightpro/shared-components';

import { ContactIcon, InvoiceIcon, LocationIcon, TruckIcon } from '@root/assets';
import { AutocompleteTemplates } from '@root/common';
import { OrderStatusRoutes, Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import {
  AddressSuggestion,
  CustomerSuggestion,
  InvoiceSuggestion,
  OrderSuggestion,
  WorkOrderSuggestion,
} from '@root/types/responseEntities';

const I18N_PATH = 'components.PageLayouts.BusinessUnitLayout.Header.Text.';

export const useBusinessUnitAutocomplete = (): IAutocompleteConfig[] => {
  const history = useHistory();
  const { jobSiteStore, customerStore, orderStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  return useMemo<IAutocompleteConfig[]>(() => {
    return [
      {
        name: 'customers',
        label: t(`${I18N_PATH}Customer`),
        image: <ContactIcon />,
        onSelect: ({ id }: CustomerSuggestion) => {
          customerStore.requestById(id, true);
          jobSiteStore.unSelectEntity();

          history.push(
            pathToUrl(Paths.CustomersModule.Customers, {
              businessUnit: businessUnitId,
              customerGroupId: 'all',
            }),
          );
        },
        template: (
          <AutocompleteTemplates.Customer
            redirectPath={pathToUrl(Paths.RequestModule.Request, {
              businessUnit: businessUnitId,
            })}
          />
        ),
      },
      {
        name: 'jobSites',
        label: t(`${I18N_PATH}JobSite`),
        image: <LocationIcon />,
        onSelect: ({ id }: AddressSuggestion) => {
          history.push(
            pathToUrl(Paths.JobSitesModule.JobSites, {
              businessUnit: businessUnitId,
              id,
            }),
          );
        },
        template: (
          <AutocompleteTemplates.JobSite
            redirectPath={pathToUrl(Paths.RequestModule.Request, {
              businessUnit: businessUnitId,
            })}
          />
        ),
      },
      {
        name: 'orders',
        label: t(`${I18N_PATH}Orders`),
        image: <TruckIcon />,
        onSelect: ({ id }: OrderSuggestion) => {
          orderStore.requestById(id);
          history.push(
            pathToUrl(Paths.OrderModule.Orders, {
              businessUnit: businessUnitId,
              subPath: OrderStatusRoutes.InProgress,
            }),
          );
        },
        template: <AutocompleteTemplates.Order />,
      },
      {
        name: 'workOrders',
        label: t(`${I18N_PATH}WorkOrders`),
        image: <TruckIcon />,
        onSelect: ({ orderId }: WorkOrderSuggestion) => {
          orderStore.requestDetails({
            orderId,
            shouldOpenDetailsQuickView: true,
          });
          history.push(
            pathToUrl(Paths.OrderModule.Orders, {
              businessUnit: businessUnitId,
              subPath: OrderStatusRoutes.InProgress,
            }),
          );
        },
        template: <AutocompleteTemplates.WorkOrder />,
      },
      {
        name: 'invoices',
        label: t(`${I18N_PATH}Invoice`),
        image: <InvoiceIcon />,
        onSelect: ({ id }: InvoiceSuggestion) => {
          history.push(
            pathToUrl(Paths.BillingModule.Invoices, {
              businessUnit: businessUnitId,
              subPath: Routes.Invoices,
              id,
            }),
          );
        },
        template: <AutocompleteTemplates.Invoice />,
      },
    ];
  }, [businessUnitId, customerStore, history, jobSiteStore, orderStore, t]);
};
