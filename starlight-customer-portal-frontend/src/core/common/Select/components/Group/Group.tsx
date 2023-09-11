import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption, ISelectOptionGroup } from '../../types';
import { Footer } from '../Footer/Footer';

export const Group: SelectComponentsConfig<ISelectOption, boolean>['Group'] = ({
  children,

  ...props
}) => {
  //TODO: add title and GroupHeading
  const { onFooterClick, footer } = props.headingProps.data as ISelectOptionGroup;

  return (
    <components.Group {...props}>
      {children}
      {footer && <Footer onClick={onFooterClick}>{footer}</Footer>}
    </components.Group>
  );
};
