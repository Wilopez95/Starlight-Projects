import { createElement } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/* prettier-ignore */
const PageTitle = styled(({ component, children, ...props }) =>
  createElement(component, props, children),
)`
  font-size: 1.2rem;
  font-weight: 700;
  color: #434343;
  text-transform: uppercase;
  display: inline-block;
  vertical-align: middle;
  margin-right: 14px;
  line-height: 23px;
`;
/* prettier-ignore */
PageTitle.propTypes = {
  component: PropTypes.node,
  color: PropTypes.string,
  size: PropTypes.string,
  weight: PropTypes.string,
  family: PropTypes.string,
  truncate: PropTypes.bool,
};
/* prettier-ignore */
PageTitle.defaultProps = {
  component: 'h1',
};

export default PageTitle;
