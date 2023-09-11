const mapping = {
  rss: 'Occupied RAM',
  heapTotal: 'Total Size of the Heap',
  heapUsed: 'Heap actually Used',
  external: 'External C++ objects',
  arrayBuffers: 'ArrayBuffers, SharedArrayBuffers, Buffers',
};
export default (p = process) => {
  return Object.entries(p.memoryUsage()).reduce((res, [key, value]) => {
    res[mapping[key]] = `${Math.round((value / 1024 / 1024) * 100) / 100} MB`;
    return res;
  }, {});
};
