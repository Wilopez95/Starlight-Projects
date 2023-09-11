import { palette } from './palette';
import { TypographyOptions } from '@material-ui/core/styles/createTypography';

export default {
  htmlFontSize: 8,

  h2: {
    fontSize: 36,
    fontWeight: 500,
  },
  h4: {
    fontSize: 28, // in pixels, material-ui will convert into rem automatically
    fontWeight: 500,
    // lineHeight: 1.57,
    // paddingBottom: 24,
  },
  h5: {
    fontSize: 20,
    fontWeight: 700,
    // paddingBottom: 24,
  },
  subtitle1: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 2.14,
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  overline: {
    fontWeight: 500,
    color: palette.text.hint,
  },
} as TypographyOptions;
