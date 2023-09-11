// COPY & PASTE from mui-datatables, because they are not exposing it in any way
// function buildMap(rows: any) {
//   return rows.reduce((accum, { dataIndex }) => {
//     accum[dataIndex] = true;
//     return accum;
//   }, {});
// }

import { FC } from 'react';
import { FilterSearchValueProps } from './fields/SearchValueField/SearchValueField';

function escapeDangerousCSVCharacters(data: any) {
  if (typeof data === 'string') {
    // Places single quote before the appearance of dangerous characters if they
    // are the first in the data string.
    return data.replace(/^\+|^-|^=^@/g, "'$&");
  }

  return data;
}

function buildCSV(columns: any, data: any, options: any) {
  const replaceDoubleQuoteInString = (columnData: any) =>
    typeof columnData === 'string' ? columnData.replace(/"/g, '""') : columnData;

  const buildHead = (columns: any) => {
    return (
      columns
        .reduce(
          (soFar: any, column: any) =>
            column.download
              ? soFar +
                '"' +
                escapeDangerousCSVCharacters(
                  replaceDoubleQuoteInString(column.label || column.name),
                ) +
                '"' +
                options.downloadOptions.separator
              : soFar,
          '',
        )
        .slice(0, -1) + '\r\n'
    );
  };
  const CSVHead = buildHead(columns);

  const buildBody = (data: any) => {
    if (!data.length) {
      return '';
    }

    return data
      .reduce(
        (soFar: any, row: any) =>
          soFar +
          '"' +
          row.data
            .filter((_: any, index: number) => columns[index].download)
            .map((columnData: any) =>
              escapeDangerousCSVCharacters(replaceDoubleQuoteInString(columnData)),
            )
            .join('"' + options.downloadOptions.separator + '"') +
          '"\r\n',
        '',
      )
      .trim();
  };
  const CSVBody = buildBody(data);

  return options.onDownload
    ? options.onDownload(buildHead, buildBody, columns, data)
    : `${CSVHead}${CSVBody}`.trim();
}

export function downloadCSV(csv: any, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });

  /* taken from react-csv */
  if (navigator && navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const dataURI = `data:text/csv;charset=utf-8,${csv}`;

    const URL = window.URL || window.webkitURL;
    const downloadURI =
      typeof URL.createObjectURL === 'undefined' ? dataURI : URL.createObjectURL(blob);

    let link = document.createElement('a');
    link.setAttribute('href', downloadURI);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function createCSVDownload(columns: any, data: any, options: any, downloadCSV: any) {
  const csv = buildCSV(columns, data, options);

  if (options.onDownload && csv === false) {
    return;
  }

  downloadCSV(csv, options.downloadOptions.filename);
}

export const DummyFieldComponent: FC<FilterSearchValueProps> = () => null;

export const mapFilterType = (filterType: string | undefined) =>
  ['range', 'daterange', 'custom', 'radio', 'checkbox', 'multiselect'].some((e) => e === filterType)
    ? 'custom'
    : filterType;
