import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption, ISelectOptionGroup } from '../../types';
import { FooterOption } from '../FooterOption/FooterOption';

export const Group: SelectComponentsConfig<ISelectOption, boolean>['Group'] = ({
  children,

  ...props
}) => {
  const { onFooterClick, footer } = props.headingProps.data as ISelectOptionGroup;

  return (
    <components.Group {...props}>
      {children}
      {footer ? <FooterOption onClick={onFooterClick}>{footer}</FooterOption> : null}
    </components.Group>
  );
};
