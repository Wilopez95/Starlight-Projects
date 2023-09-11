import React, { useCallback } from 'react';
import { SelectComponentsConfig } from 'react-select';
import { noop } from 'lodash-es';

import { Layouts } from '../../../../layouts';
import { Badge } from '../../../Badge/Badge';
import { Checkbox } from '../../../Checkbox/Checkbox';
import { Typography } from '../../../Typography/Typography';
import { ISelectOption } from '../../types';

import * as Styles from './styles';

export const Option: SelectComponentsConfig<ISelectOption, boolean>['Option'] = ({
  children,
  isSelected,
  data,
  selectProps,
  isFocused,
  innerProps,
  innerRef,
}) => {
  const isCheckbox: boolean = selectProps.checkbox;
  const { onClick, ...optionProps } = innerProps;
  const { hint, subTitle, disabled, description, badge } = data as ISelectOption;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      onClick(e);
    },
    [onClick],
  );

  return (
    <Styles.StyledOption
      padding="2"
      as="li"
      aria-selected={isSelected}
      onClick={isCheckbox || disabled ? undefined : handleClick}
      disabled={disabled}
      isFocused={isFocused}
      ref={innerRef}
      {...(optionProps as any)}
    >
      <Layouts.Flex alignItems="center">
        {isCheckbox ? (
          <Layouts.Margin right="1" onClick={disabled ? undefined : handleClick}>
            <Checkbox name="optionActionCheckbox" value={isSelected} onChange={noop} />
          </Layouts.Margin>
        ) : null}
        <Layouts.Box
          width="100%"
          as={Layouts.Flex}
          justifyContent="space-between"
          alignItems="center"
        >
          <div style={{ maxWidth: '100%' }}>
            <Layouts.Flex alignItems="center">
              <Typography ellipsis>{children}</Typography>
              {description ? (
                <Layouts.Margin left="1">
                  <Typography color="secondary" shade="desaturated">
                    {description}
                  </Typography>
                </Layouts.Margin>
              ) : null}
            </Layouts.Flex>
            {subTitle ? (
              <Typography color="secondary" shade="desaturated">
                {subTitle}
              </Typography>
            ) : null}
          </div>

          {hint ? (
            <Typography color="secondary" shade="desaturated">
              ({hint})
            </Typography>
          ) : null}
          {badge ? (
            <Badge color={badge.color} borderRadius={badge.borderRadius}>
              {badge.text}
            </Badge>
          ) : null}
        </Layouts.Box>
      </Layouts.Flex>
    </Styles.StyledOption>
  );
};
