import ExcelJS from 'exceljs';

import ApiError from '../errors/ApiError.js';

export const getKeys = sheet => {
  let keys;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      keys = row.values.slice(1, row.values.length);
    }
  });
  return keys;
};

export const buildObjectsByRows = (sheet, keys) => {
  const objectsByRows = [];
  let prepared = {};
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
      const clearRows = row.values.slice(1, row.values.length);
      keys.forEach((key, index) => {
        const value = clearRows[index];
        if (value?.text) {
          prepared[key] = value.text;
        } else if (value?.formula && value?.formula === 'TRUE()') {
          prepared[key] = !!value.result;
        } else {
          prepared[key] = value;
        }
      });

      objectsByRows.push(prepared);
      prepared = {};
    }
  });

  return objectsByRows;
};

export const excel2Json = async ({ stream, maxRowsCount }) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.read(stream);

  const parsedData = [];
  let rowsCount = 0;
  workbook.eachSheet(sheet => {
    rowsCount += sheet.actualRowCount;

    if (rowsCount > maxRowsCount) {
      throw ApiError.badRequest(`Max rows count in the file should be <= 1000`);
    }

    if (sheet.actualRowCount > 1) {
      const keys = getKeys(sheet);
      const objectsByRow = buildObjectsByRows(sheet, keys);
      parsedData.push({ sheetName: sheet.name.toLowerCase(), data: objectsByRow });
    }
  });

  return parsedData;
};
