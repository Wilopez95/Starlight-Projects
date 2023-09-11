const isNilOrNaN = value => value === null || value === undefined || Number.isNaN(Number(value));

export default isNilOrNaN;
