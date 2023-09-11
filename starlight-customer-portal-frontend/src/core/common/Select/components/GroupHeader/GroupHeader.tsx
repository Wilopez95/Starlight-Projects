import React from 'react';
import { SelectComponentsConfig } from 'react-select';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { ISelectOption, ISelectOptionGroup } from '../../types';

import * as Styles from './styles';

export const GroupHeader: SelectComponentsConfig<ISelectOption, boolean>['GroupHeading'] = ({
  data,
}) => {
  const { image: Image, label } = data as ISelectOptionGroup;

  if (!label) {
    return null;
  }

  return (
    <Styles.StyledGroupHeader>
      <Layouts.Flex as={Layouts.Padding} padding='1.5' alignItems='center'>
        <Layouts.IconLayout as={Layouts.Margin} right='1' height='100%'>
          {Image}
        </Layouts.IconLayout>
        <Typography
          variant='caption'
          color='secondary'
          shade='desaturated'
          textTransform='uppercase'
        >
          {label}
        </Typography>
      </Layouts.Flex>
    </Styles.StyledGroupHeader>
  );
};
