import React, { useContext } from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { PlusIcon } from '@root/assets';
import { OptionItem } from '@root/core/common/Dropdown';

import { AutocompleteContext } from '../contexts';

import { IAutocompleteFooter } from './types';

export const AutocompleteFooter: React.FC<IAutocompleteFooter> = ({ text, onClick }) => {
  const { onHide } = useContext(AutocompleteContext);

  return (
    <OptionItem
      onClick={
        onClick
          ? () => {
              onHide();
              onClick();
            }
          : undefined
      }
    >
      <Layouts.Padding top='1' bottom='1'>
        <Layouts.Flex alignItems='center'>
          <Typography variant='bodyMedium' cursor='pointer' color='information'>
            <Layouts.IconLayout width='12px' height='12px'>
              <PlusIcon />
            </Layouts.IconLayout>
            {text}
          </Typography>
        </Layouts.Flex>
      </Layouts.Padding>
    </OptionItem>
  );
};
