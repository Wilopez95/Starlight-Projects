import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';
import { get } from 'lodash-es';

import { AutocompleteOptionGroupContext } from '../../../Autocomplete/context';
import { IAutocompleteOptionGroupData } from '../../../Autocomplete/types';
import { ISelectOption } from '../../../types';
import { FooterOption } from '../../FooterOption/FooterOption';

export const AutocompleteGroup: SelectComponentsConfig<ISelectOption, boolean>['Group'] = ({
  children,

  ...props
}) => {
  const { footer, onFooterClick, options, showFooterIfNoOption } = props.headingProps
    .data as IAutocompleteOptionGroupData;

  const disableOptionsRender = options.length === 1 && get(options, '[0].fallbackForFooter', false);

  const shouldRenderFooter = showFooterIfNoOption ? disableOptionsRender : true;

  return (
    <components.Group {...props}>
      {!disableOptionsRender ? (
        <AutocompleteOptionGroupContext.Provider value={props.headingProps.data}>
          {children}
        </AutocompleteOptionGroupContext.Provider>
      ) : null}

      {footer && shouldRenderFooter ? (
        <FooterOption onClick={onFooterClick}>{footer}</FooterOption>
      ) : null}
    </components.Group>
  );
};
