/* eslint-disable react/prop-types */

import cx from 'classnames';
import { StyledIcon } from './styles/StyledIcon';

// export type Props = {
//   name: string,
//   color?: string,
//   size?: string,
//   className?: string,
//   inverted?: boolean,
// };
const FontIcon = (props) => {
  const classes = cx(`far fa-${props.name}`, props.className);
  return <StyledIcon {...props} className={classes} />;
};

const defaultProps = {
  inverted: false,
};
FontIcon.displayName = 'FontIcon';

FontIcon.defaultProps = defaultProps;
export default FontIcon;
