import React, { useMemo } from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Pin, SequenceText } from '@root/common';
import { getLumaContrastColor } from '@root/helpers';

import { MarkerAssetType } from '../Map';

import { CrossIcon, OrderedMarker, StyledListItem } from './styles';
import { IDndListItemWrapper } from './types';

export const DndListItemWrapper: React.FC<IDndListItemWrapper> = ({
  id,
  sequence = 0,
  readOnly = true,
  color = '#637381',
  onDelete,
  onClick,
  children,
}) => {
  const handlePinClick = () => {
    // This method open popup on map
    onClick?.(id);
  };

  const handleDelete = () => {
    // Always pass original service item id (cause rootMarkerId is only in create but not at edit)
    onDelete?.(id);
  };

  const textColor = useMemo(() => getLumaContrastColor(color), [color]);

  return (
    <StyledListItem readOnly={readOnly}>
      {!readOnly && onDelete && <CrossIcon onClick={handleDelete} />}
      <Layouts.Margin right="1">
        <OrderedMarker onClick={handlePinClick}>
          <SequenceText size="small" color={textColor}>
            {sequence}
          </SequenceText>
          <Pin
            width={20}
            height={28}
            type={MarkerAssetType.assigned}
            color={color}
            fullColor={color}
            cursor={!readOnly}
          />
        </OrderedMarker>
      </Layouts.Margin>
      {children}
    </StyledListItem>
  );
};
