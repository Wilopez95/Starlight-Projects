import { Trans, useTranslation } from '@starlightpro/common/i18n';
import React, { ReactElement } from 'react';
import { HaulingMaterial, OrderMaterialDistributionInput } from '../../../../../../../graphql/api';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

interface PopulatedMaterialDistribution extends OrderMaterialDistributionInput {
  material: HaulingMaterial;
  value: number;
}

export const OrderHistoryMaterialsDistributionChanges: React.FC<IBaseOrderHistoryChange<
  PopulatedMaterialDistribution[] | null
>> = ({ prevValue, newValue }) => {
  const { t } = useTranslation();
  const subject = t('Distribution Material');

  if (!newValue) {
    return (
      <SubjectRow subject={subject}>
        <Trans>deleted</Trans>
      </SubjectRow>
    );
  }

  if (!prevValue) {
    if (newValue[0]?.material?.description) {
      return (
        <>
          {newValue.map((materialDistr) => (
            <DifferenceRow
              prefix={materialDistr?.material?.description}
              subject={subject}
              to={`${materialDistr.value}%`}
            />
          ))}
        </>
      );
    }

    return <></>;
  }

  const mappedDistribution = newValue.reduce((acc: ReactElement<unknown>[], materialDistr, i) => {
    // eslint-disable-next-line eqeqeq
    if (materialDistr?.value != prevValue?.[i]?.value) {
      const description =
        materialDistr?.material?.description ||
        prevValue?.[i]?.material?.description ||
        'Not specified';

      acc.push(
        <DifferenceRow
          prefix={description}
          subject="Distribution Material"
          from={`${prevValue[i].value}%`}
          to={`${materialDistr.value}%`}
        />,
      );
    }

    return acc;
  }, []);

  return <>{mappedDistribution}</>;
};
