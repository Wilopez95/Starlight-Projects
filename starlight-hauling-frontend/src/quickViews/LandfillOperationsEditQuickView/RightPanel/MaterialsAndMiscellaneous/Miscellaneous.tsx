import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';

import { FormInput, Typography, WarningTooltip } from '@root/common';
import { IEditableLandfillOperation } from '@root/types';

const I18N_PATH = 'components.forms.LandfillOperationEdit.RightPanel.';

export const MiscellaneousItems: React.FC = () => {
  const { values, handleChange, errors } = useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();

  return (
    <Layouts.Grid columns={4} gap="1">
      <Layouts.Cell width={4}>
        <Layouts.Margin bottom="3">
          <Typography variant="headerThree">{t(`${I18N_PATH}MiscellaneousItems`)}</Typography>
        </Layouts.Margin>
      </Layouts.Cell>
      {values.miscellaneousItems.map((item, index) => {
        const inputKey = `miscellaneousItems[${index}].quantity`;

        return (
          <React.Fragment key={item.id}>
            <Layouts.Cell width={3} alignSelf="center">
              {item.description}{' '}
              {!item.mapped ? (
                <WarningTooltip position="top" text={t(`${I18N_PATH}MiscellaneousItemTooltip`)} />
              ) : null}
            </Layouts.Cell>
            <Layouts.Cell width={1}>
              <FormInput
                type="number"
                name={inputKey}
                value={item.quantity}
                error={getIn(errors, inputKey)}
                onChange={handleChange}
                noError
              />
            </Layouts.Cell>
          </React.Fragment>
        );
      })}
    </Layouts.Grid>
  );
};
