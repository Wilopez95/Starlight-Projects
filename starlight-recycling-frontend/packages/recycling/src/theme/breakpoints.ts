import createBreakpoints, { BreakpointsOptions } from '@material-ui/core/styles/createBreakpoints';

const breakpointsInput: BreakpointsOptions = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

export const breakpoints = createBreakpoints(breakpointsInput);

export default breakpointsInput;
