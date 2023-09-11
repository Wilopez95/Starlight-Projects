import * as React from 'react';

const SvgrMock = React.forwardRef<HTMLSpanElement, unknown>((props, ref) => (
  <span ref={ref} {...props} />
));

export default SvgrMock;
