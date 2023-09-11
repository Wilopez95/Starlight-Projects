import React, { FC, useCallback } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import { DisplayData, MUIDataTableData, MUIDataTableOptions } from 'mui-datatables';
import { find } from 'lodash-es';
import { createCSVDownload, downloadCSV as downloadCSVUtil } from './utils';
import { DataTableColumnState } from './types';

export interface DownloadButtonProps {
  label?: string;
  columnOrder?: number[];
  columns: DataTableColumnState[];
  data?: MUIDataTableData[];
  displayData?: DisplayData;
  options?: MUIDataTableOptions;
  classes: {
    icon: string;
  };
}

export const DownloadButton: FC<DownloadButtonProps> = ({
  label,
  columnOrder,
  columns,
  data,
  displayData,
  options,
  classes,
}) => {
  const handleCSVDownload = useCallback(() => {
    const downloadOptions = options?.downloadOptions;
    let dataToDownload: any[] = []; //cloneDeep(data);
    let columnsToDownload: any[] = [];
    let columnOrderCopy = Array.isArray(columnOrder) ? columnOrder.slice(0) : [];

    if (columnOrderCopy.length === 0) {
      columnOrderCopy = columns.map((item: any, idx: any) => idx);
    }

    data?.forEach((row: any) => {
      let newRow = { index: row.index, data: [] };
      columnOrderCopy.forEach((idx) => {
        // eslint-disable-next-line
        // @ts-ignore
        newRow.data.push(row.data[idx]);
      });
      dataToDownload.push(newRow);
    });

    columnOrderCopy.forEach((idx) => {
      columnsToDownload.push(columns[idx]);
    });

    if (downloadOptions && downloadOptions.filterOptions) {
      // check rows first:
      if (downloadOptions.filterOptions.useDisplayedRowsOnly) {
        let filteredDataToDownload = displayData?.map((row: any, index: number) => {
          let i = -1;

          // Help to preserve sort order in custom render columns
          row.index = index;

          return {
            data: row.data.map((column: any) => {
              i += 1;

              // if we have a custom render, which will appear as a react element, we must grab the actual value from data
              // that matches the dataIndex and column
              // TODO: Create a utility function for checking whether or not something is a react object
              let val =
                typeof column === 'object' && column !== null && !Array.isArray(column)
                  ? find(data, (d) => d.index === row.dataIndex)?.data[i]
                  : column;
              val =
                typeof val === 'function'
                  ? find(data, (d) => d.index === row.dataIndex)?.data[i]
                  : val;

              return val;
            }),
          };
        });

        dataToDownload = [];
        filteredDataToDownload?.forEach((row: any) => {
          let newRow = { index: row.index, data: [] };
          columnOrderCopy.forEach((idx) => {
            // eslint-disable-next-line
            // @ts-ignore
            newRow.data.push(row.data[idx]);
          });
          dataToDownload.push(newRow);
        });
      }

      // now, check columns:
      if (downloadOptions.filterOptions.useDisplayedColumnsOnly) {
        columnsToDownload = columnsToDownload.filter((_) => _.display === 'true');

        dataToDownload = dataToDownload.map((row) => {
          row.data = row.data.filter(
            (_: any, index: number) =>
              (columns[columnOrderCopy[index]] || ({} as any)).display === 'true',
          );

          return row;
        });
      }
    }
    createCSVDownload(columnsToDownload, dataToDownload, options, downloadCSVUtil);
  }, [columnOrder, columns, data, displayData, options]);

  return (
    <Tooltip title={label || ''}>
      <IconButton
        data-testid={label + '-iconButton'}
        aria-label={label}
        classes={{ root: classes.icon }}
        disabled={options?.download === 'disabled'}
        onClick={handleCSVDownload}
      >
        <DownloadIcon />
      </IconButton>
    </Tooltip>
  );
};
