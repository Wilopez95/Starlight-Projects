/* eslint-disable no-implicit-coercion */
export default () =>
  !!(typeof window !== 'undefined' && window.document && window.document.createElement);
