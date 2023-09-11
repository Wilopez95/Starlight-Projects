import React from 'react';
import { DragObjectWithType, useDrop } from 'react-dnd';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { IMapMergeData, MarkerItemTypes } from '@root/types';
import { DnDList, DnDListTitle } from './styles';
import { IDragNDropList } from './types';

interface MyDragObject extends DragObjectWithType, IMapMergeData {
  // Define any additional properties you need for your drag object
  type: MarkerItemTypes;
}

const DragNDropList: React.FC<IDragNDropList> = ({
  title,
  acceptType,
  onItemDrop,
  children,
  error,
}) => {
  const [, drop] = useDrop({
    accept: acceptType,
    drop: (item: MyDragObject) => {
      onItemDrop(item);
    },
  });

  return (
    <>
      <DnDList ref={drop} error={error}>
        <DnDListTitle>{title}</DnDListTitle>
        {children}
      </DnDList>
      {error && (
        <Layouts.Padding top="1">
          <Typography color="alert" variant="bodySmall">
            {error}
          </Typography>
        </Layouts.Padding>
      )}
    </>
  );
};

export default DragNDropList;
