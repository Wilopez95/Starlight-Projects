import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import * as Styles from './styles';
import { IAddFilterIcon } from './types';

const I18N_PATH_AddFilter = 'common.TableTools.TableFilter.TableFilter.Text.AddFilter';

export const AddFilterIcon: React.FC<IAddFilterIcon> = ({ children, onClick }) => {
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onClick();
      }
    },
    [onClick],
  );

  return (
    <Layouts.Box left="8px" right="8px" position="relative">
      <Typography cursor="pointer" onClick={onClick}>
        <Layouts.Box
          width="30px"
          height="30px"
          borderRadius="50%"
          backgroundColor="grey"
          backgroundShade="light"
          position="relative"
        >
          <Layouts.Flex
            tabIndex={0}
            aria-label={t(I18N_PATH_AddFilter)}
            onKeyDown={handleKeyDown}
            justifyContent="center"
            alignItems="center"
            as={Layouts.Box}
            height="100%"
          >
            <Styles.AddFilter />
          </Layouts.Flex>
        </Layouts.Box>
      </Typography>
      {children}
    </Layouts.Box>
  );
};
