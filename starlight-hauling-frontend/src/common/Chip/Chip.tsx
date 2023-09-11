import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { Typography } from '../Typography/Typography';

import { IChip } from './types';

export const Chip: React.FC<IChip> = ({ children, icon: Icon, onIconClick }) => {
  const { t } = useTranslation();
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement> | React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (handleEnterOrSpaceKeyDown(e as React.KeyboardEvent<HTMLOrSVGElement>)) {
        onIconClick?.(e as React.MouseEvent<HTMLElement, MouseEvent>);
      }
    },
    [onIconClick],
  );

  return (
    <Layouts.Margin left="1" right="1">
      <Layouts.Box borderRadius="20px" backgroundColor="grey" backgroundShade="light">
        <Layouts.Padding top="0.5" bottom="0.5" left="2" right="2" as={Layouts.Box} height="30px">
          <Layouts.Flex alignItems="center" as={Layouts.Box} height="100%">
            <Typography color="secondary" shade="desaturated" variant="bodyMedium">
              {children}
            </Typography>
            {Icon ? (
              <Layouts.Margin left="1">
                <Typography cursor="pointer" onClick={onIconClick}>
                  <Layouts.Box width="16px" height="16px">
                    <Icon
                      tabIndex={0}
                      aria-label={`${t('Text.Remove')} ${children}`}
                      onKeyDown={handleKeyDown}
                    />
                  </Layouts.Box>
                </Typography>
              </Layouts.Margin>
            ) : null}
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </Layouts.Margin>
  );
};
