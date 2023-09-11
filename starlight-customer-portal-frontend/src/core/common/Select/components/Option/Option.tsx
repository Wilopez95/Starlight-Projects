import React, { useCallback } from 'react';
import { SelectComponentsConfig } from 'react-select';
import { Layouts, Checkbox, Typography } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';

import { ISelectOption } from '../../types';

import * as Styles from './styles';

export const Option: SelectComponentsConfig<ISelectOption, boolean>['Option'] = ({
  children,
  innerProps,
  isSelected,
  isFocused,
  data,
  selectProps,
  innerRef,
}) => {
  const isCheckbox: boolean = selectProps.checkbox;
  const { onClick, ...optionProps } = innerProps;
  const { hint, subTitle } = data as ISelectOption;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      onClick(e);
    },
    [onClick],
  );

  return (
    <Styles.StyledOption
      ref={innerRef}
      {...innerProps}
      padding='2'
      as='li'
      aria-selected={isFocused}
      onClick={isCheckbox ? undefined : handleClick}
      {...(optionProps as any)}
    >
      <Layouts.Flex alignItems='center'>
        {isCheckbox && (
          <Layouts.Margin right='1' onClick={handleClick}>
            <Checkbox name='optionActionCheckbox' value={isSelected} onChange={noop} />
          </Layouts.Margin>
        )}
        <Layouts.Box
          width='100%'
          as={Layouts.Flex}
          justifyContent='space-between'
          alignItems='center'
        >
          <div>
            <Typography>{children}</Typography>
            {subTitle && (
              <Typography color='secondary' shade='desaturated'>
                {subTitle}
              </Typography>
            )}
          </div>

          {hint && (
            <Typography color='secondary' shade='desaturated'>
              ({hint})
            </Typography>
          )}
        </Layouts.Box>
      </Layouts.Flex>
    </Styles.StyledOption>
  );
};
