import React, { useCallback, useRef } from 'react';
import { noop } from 'lodash-es';

import { DropdownList, IDropdownListHandle } from '@root/core/common';

import { AddFilterIcon } from './AddFilterIcon';
import { IFilterDropdownList } from './types';

export const FilterDropdownList: React.FC<IFilterDropdownList> = ({ children }) => {
  const dropdownListController = useRef<IDropdownListHandle>({
    open: noop,
  });

  const handleOpenDropdown = useCallback(() => {
    dropdownListController.current.open();
  }, []);

  return (
    <AddFilterIcon onClick={handleOpenDropdown}>
      <DropdownList ref={dropdownListController}>{children}</DropdownList>
    </AddFilterIcon>
  );
};
