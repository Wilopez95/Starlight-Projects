export const getGrandTotal = (...params) => params.reduce((sum, param) => sum + param, 0);
