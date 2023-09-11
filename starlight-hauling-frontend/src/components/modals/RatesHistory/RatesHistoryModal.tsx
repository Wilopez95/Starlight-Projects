import React from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns-tz';
import { startCase, toUpper } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider, Table, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { parseDate } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { ModalStyled, TableBodyStyled, TableScrollContainerStyled } from './styles';
import { RatesHistoryModalProps } from './types';

const headerCells = ['Date &  Time', 'Changed By', 'Attribute', 'Previous Value', 'New Value'];

const RatesHistoryModal: React.FC<RatesHistoryModalProps> = ({ title, onClose, isOpen }) => {
  const { priceGroupStore } = useStores();
  const { dateFormat } = useIntl();

  return (
    <ModalStyled isOpen={isOpen} onClose={onClose}>
      <Layouts.Margin left="3" top="3">
        <Layouts.Margin bottom="1">
          <Typography variant="headerThree">Changes History</Typography>
        </Layouts.Margin>
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          {toUpper(title)}
        </Typography>
      </Layouts.Margin>

      <TableScrollContainerStyled>
        <Table>
          <TableTools.Header>
            {headerCells.map(cellTitle => {
              return <TableTools.HeaderCell key={cellTitle}>{cellTitle}</TableTools.HeaderCell>;
            })}
          </TableTools.Header>

          <TableBodyStyled
            loading={priceGroupStore.loading}
            cells={5}
            noResult={priceGroupStore.rateHistoryData.length === 0}
          >
            {priceGroupStore.rateHistoryData.map(
              ({ user, timestamp, attribute, previousValue, newValue }) => {
                return (
                  <TableRow key={timestamp.getTime()}>
                    <TableCell>{format(parseDate(timestamp), dateFormat.dateTime)}</TableCell>
                    <TableCell>{user}</TableCell>
                    <TableCell>{startCase(attribute)}</TableCell>
                    <TableCell>{previousValue}</TableCell>
                    <TableCell>{newValue}</TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBodyStyled>
        </Table>
      </TableScrollContainerStyled>

      <Divider />
      <Layouts.Flex justifyContent="flex-end">
        <Layouts.Margin margin="4">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </Layouts.Margin>
      </Layouts.Flex>
    </ModalStyled>
  );
};

export default observer(RatesHistoryModal);
