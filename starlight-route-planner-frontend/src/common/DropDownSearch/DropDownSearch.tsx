import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClickOutHandler,
  Dropdown,
  Layouts,
  OptionGroup,
  OptionItem,
  Typography,
} from '@starlightpro/shared-components';

import { DropdownWrapper, NoResult } from './styles';
import { IDropDownSearch } from './types';

const I18N_ROOT_PATH = 'Text.';

export const DropDownSearch: React.FC<IDropDownSearch> = ({ items, onClick, onClickOut }) => {
  const { t } = useTranslation();

  return (
    <ClickOutHandler onClickOut={onClickOut}>
      <DropdownWrapper>
        {items.length ? (
          <Layouts.Scroll maxHeight={312}>
            <Dropdown>
              {items.map(item => {
                return (
                  <OptionGroup key={item.rootMarkerId} hiddenHeader>
                    <OptionItem onClick={() => onClick(item)}>
                      <Typography
                        dangerouslySetInnerHTML={{
                          __html: item.title,
                        }}
                        variant="bodyMedium"
                        color="default"
                        shade="dark"
                      />
                      <Typography
                        dangerouslySetInnerHTML={{
                          __html: item.subTitle,
                        }}
                        variant="bodyMedium"
                        color="secondary"
                        shade="light"
                      />
                    </OptionItem>
                  </OptionGroup>
                );
              })}
            </Dropdown>
          </Layouts.Scroll>
        ) : (
          <NoResult>
            <Layouts.Padding top="2" bottom="2">
              <Typography color="secondary" shade="light" variant="bodyMedium">
                {t(`${I18N_ROOT_PATH}NoResultsFound`)}
              </Typography>
            </Layouts.Padding>
          </NoResult>
        )}
      </DropdownWrapper>
    </ClickOutHandler>
  );
};
