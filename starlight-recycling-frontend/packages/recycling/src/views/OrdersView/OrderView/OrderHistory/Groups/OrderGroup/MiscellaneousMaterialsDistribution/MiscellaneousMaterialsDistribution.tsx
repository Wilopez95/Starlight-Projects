import { useTranslation } from '@starlightpro/common/i18n';
import React, { ReactElement } from 'react';
import {
  HaulingMaterial,
  OrderMiscellaneousMaterialDistributionInput,
} from '../../../../../../../graphql/api';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

interface PopulatedMaterialDistribution extends OrderMiscellaneousMaterialDistributionInput {
  material: HaulingMaterial;
}

export const OrderHistoryMiscellaneousMaterialsDistributionChanges: React.FC<IBaseOrderHistoryChange<
  PopulatedMaterialDistribution[]
>> = ({ prevValue, newValue }) => {
  const { t } = useTranslation();
  const subject = t('Miscellaneous Item');

  if (!newValue) {
    return <SubjectRow subject={subject}>{t('deleted')}</SubjectRow>;
  }

  if (!prevValue) {
    if (newValue[0]?.material?.description) {
      return (
        <>
          {newValue.map((materialMisc) => (
            <DifferenceRow
              prefix={materialMisc.material.description}
              subject={subject}
              to={materialMisc.quantity}
            />
          ))}
        </>
      );
    }

    return <></>;
  }

  const mappedMiscDistribution = newValue.reduce(
    (acc: ReactElement<unknown>[], materialMisc, i) => {
      if (materialMisc.quantity !== prevValue[i].quantity) {
        const description =
          materialMisc?.material?.description ||
          prevValue?.[i]?.material?.description ||
          'Not specified';

        acc.push(
          <DifferenceRow
            prefix={description}
            subject={subject}
            from={prevValue[i].quantity}
            to={materialMisc.quantity}
            label={t('quantity changed')}
          />,
        );
      }

      return acc;
    },
    [],
  );

  return <>{mappedMiscDistribution}</>;
};
