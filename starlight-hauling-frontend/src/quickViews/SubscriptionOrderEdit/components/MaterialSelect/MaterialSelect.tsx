import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelect, ISelectOption, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

const MaterialSelect: React.FC<Omit<ISelect, 'options'>> = ({ ...props }) => {
  const { materialStore } = useStores();
  const { t } = useTranslation();
  const materialOptions: ISelectOption[] = useMemo(
    () =>
      materialStore.sortedValues.reduce(
        (options: ISelectOption[], material) =>
          material.active
            ? [
                ...options,
                {
                  label: material.description,
                  value: material.id,
                  hint: material.manifested ? t(`Text.Manifested`) : '',
                },
              ]
            : options,
        [],
      ),
    [materialStore.sortedValues, t],
  );

  return <Select {...props} options={materialOptions} />;
};

export default observer(MaterialSelect);
