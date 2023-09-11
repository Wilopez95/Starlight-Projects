// This is required because of the architecture of our API handlers - they run a lot of nested processing tasks after sending response.
// And on low-performance hardware (or laptop not plugged-in into the socket) you can face race conditions caused by that.
export const sleep = async ms => {
  await new Promise(resolve => {
    // because `done` callback doesn't work with async tests
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, ms); // to be sure that WOs generation is done
  });
};
