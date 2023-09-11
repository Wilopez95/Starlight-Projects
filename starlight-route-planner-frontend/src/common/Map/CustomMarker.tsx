import React, { forwardRef, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Marker } from 'react-map-gl';

import { getLumaContrastColor } from '@root/helpers';

import { Pin, SequenceText } from '../Pin';

import { IDropResult } from '../DragNDropList/types';
import { MarkerInner as MarkerInnerStyled } from './styles';
import { ICustomMarker, MarkerAssetType } from './types';

interface IMarkerInnerProps {
  children: React.ReactNode;
  isDragging?: boolean;
  textColor?: string;
  sequence?: number;
  showSequence?: boolean;
}

const MarkerInnerRenderFn: React.ForwardRefRenderFunction<HTMLDivElement, IMarkerInnerProps> = (
  { children, isDragging, textColor, sequence, showSequence },
  ref,
) => (
  <MarkerInnerStyled ref={ref} isDragging={isDragging}>
    {sequence && showSequence && (
      <SequenceText size="large" color={textColor}>
        {sequence}
      </SequenceText>
    )}
    {children}
  </MarkerInnerStyled>
);

export const CustomMarker: React.FC<ICustomMarker> = ({
  data,
  onClick,
  visible,
  sequence,
  optionColor,
  pinDiskProps,
  draggable = true,
  isHighlighted,
}) => {
  const {
    coordinates,
    assetsType = MarkerAssetType.assigned,
    color,
    markerType,
    showSequence,
    badge,
  } = data;
  const MarkerInner = forwardRef(MarkerInnerRenderFn);
  const [{ isDragging }, drag] = useDrag({
    item: { type: markerType ?? '', ...data } as IDropResult,
    canDrag: () => draggable,
    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  const handleClick = () => {
    onClick?.(data);
  };

  const textColor = useMemo(
    () => (optionColor || color ? getLumaContrastColor(optionColor ?? color) : '#ffffff'),
    [optionColor, color],
  );

  if (!visible) {
    return null;
  }

  return (
    <div onClick={handleClick}>
      <Marker longitude={coordinates[0] || 0} latitude={coordinates[1] || 0}>
        <MarkerInner
          ref={drag}
          isDragging={isDragging}
          textColor={textColor}
          sequence={sequence}
          showSequence={showSequence}
        >
          <Pin
            showHighlightShadow={isHighlighted}
            type={assetsType}
            fullColor={optionColor}
            color={optionColor ?? color}
            pinDiskProps={pinDiskProps}
            badge={badge}
            singleServiceMRColors={data.singleServiceMRColors}
            border
          />
        </MarkerInner>
      </Marker>
    </div>
  );
};
