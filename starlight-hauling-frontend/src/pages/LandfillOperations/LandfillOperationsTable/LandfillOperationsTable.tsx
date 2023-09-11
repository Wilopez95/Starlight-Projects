import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { TableBody, TableCell, TableRow } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { hasDataAttribute, isModal, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import LandfillMediaSection from './LandfillMediaSection/LandfillMediaSection';
import * as Styles from './styles';
import { type ILandfillOperationsTable } from './types';

const LandfillOperationsTable: React.ForwardRefRenderFunction<
  HTMLTableSectionElement,
  ILandfillOperationsTable
> = ({ onSelect }, ref) => {
  const { landfillOperationStore } = useStores();
  const { formatDateTime } = useIntl();
  const { businessUnitId } = useBusinessContext();

  return (
    <TableBody
      loading={landfillOperationStore.loading}
      cells={11}
      noResult={landfillOperationStore.noResult}
      ref={ref}
    >
      {landfillOperationStore.values.map(landfillOperation => {
        const url = pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
          businessUnit: businessUnitId,
          customerId: landfillOperation.customer?.originalId,
          jobSiteId: landfillOperation.jobSite?.originalId,
          id: landfillOperation.orderId,
        });

        return (
          <TableRow
            key={landfillOperation.id}
            selected={landfillOperationStore.selectedEntity?.id === landfillOperation.id}
            onClick={e => {
              if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
                return;
              }
              onSelect(landfillOperation);
            }}
          >
            <TableCell>{landfillOperation.id}</TableCell>
            <TableCell>{formatDateTime(landfillOperation.syncDate).date}</TableCell>
            <TableCell>{landfillOperation.recyclingFacility.description}</TableCell>

            <Styles.TicketTableCell fallback="">
              {landfillOperation.ticketUrl ? (
                <LandfillMediaSection landfillOperation={landfillOperation} />
              ) : null}

              {landfillOperation.ticketNumber}
            </Styles.TicketTableCell>
            <TableCell>{landfillOperation.customer.name}</TableCell>
            <TableCell>
              <Link to={url}>{landfillOperation.orderId}</Link>
            </TableCell>
            <TableCell>{landfillOperation.workOrder.woNumber}</TableCell>
            <TableCell>{landfillOperation.truck}</TableCell>

            <TableCell>{formatDateTime(landfillOperation.arrivalDate).time}</TableCell>
            <TableCell>{formatDateTime(landfillOperation.departureDate).time}</TableCell>
            <TableCell right>{landfillOperation.netWeight}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default observer(LandfillOperationsTable, { forwardRef: true });
