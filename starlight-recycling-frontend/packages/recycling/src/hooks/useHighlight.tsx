import React from 'react';
import { has } from 'lodash-es';
import TruncatedTextWithTooltip from '../components/TruncatedTextWithTooltip';
import { DataTableColumn } from '../components/Datatable/types';
import { isEmpty } from 'lodash/fp';

export interface ColumnWithHighlightDef extends DataTableColumn {
  highlightName?: string;
}

interface ItemType {
  highlight?: { [key: string]: string[] };
}

type BuildHighlightFuncDef = (
  value: string,
  field: string,
  item: ItemType,
) => React.ReactNode | null;

type UseHighlightHook = (options: UseHighlightOptions) => ColumnWithHighlightDef[];

export type UseHighlightOptions = {
  defaultColumns: ColumnWithHighlightDef[];
  data: ItemType[];
  highlightColumns: string[];
  highlightElementType?: React.ElementType;
};

export const buildHighlight: BuildHighlightFuncDef = (value, field, item) => {
  if (isEmpty(item.highlight?.[field])) {
    return value;
  }

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: item.highlight![field][0],
      }}
    />
  );
};

export const useHighlight: UseHighlightHook = ({
  defaultColumns,
  data,
  highlightColumns,
  highlightElementType,
}) =>
  defaultColumns.map((column) => {
    if (!highlightColumns.includes(column.name)) {
      return column;
    }

    return {
      ...column,
      options: {
        ...(has(column, 'options') ? column.options : {}),
        customBodyRender: (value, { rowIndex }) => {
          const text = buildHighlight(value, column.highlightName || column.name, data[rowIndex]);

          return <TruncatedTextWithTooltip rootElementType={highlightElementType} value={text} />;
        },
      },
    } as ColumnWithHighlightDef;
  });
