import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Typography } from '@starlightpro/shared-components';

import { TableHeadCell, TableHeader as BaseTableHeader } from '@root/common/TableTools';

interface IProps {
  isSelected: boolean;
  toggleAllCheck(): void;
}

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'quickViews.AddMultipleServiceItems.Text.';

const TableHeader: React.FC<IProps> = ({ isSelected, toggleAllCheck }) => {
  const { t } = useTranslation();

  return (
    <BaseTableHeader>
      <TableHeadCell>
        <Layouts.Margin right="2">
          <Checkbox name="all" value={isSelected} onChange={toggleAllCheck} />
        </Layouts.Margin>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_PATH}ServiceNumber`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_ROOT_PATH}Service`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_ROOT_PATH}Material`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_PATH}EquipmentSize`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_PATH}Frequency`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_PATH}AssignedDays`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant="bodyMedium" color="secondary" shade="light">
          {t(`${I18N_ROOT_PATH}BestTimeToCome`)}
        </Typography>
      </TableHeadCell>
    </BaseTableHeader>
  );
};

export { TableHeader };
