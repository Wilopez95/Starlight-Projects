/* eslint-disable react/prop-types */

import cx from 'classnames';
import { Tooltip } from 'react-tippy';
import styled from 'styled-components';

// export type TipLabelProps = {
//   className?: string,
//   label?: string,
//   name: string,
//   errorMsg?: string,
//   required?: boolean,
//   tipTrigger?: string,
//   tipPosition?: string,
//   tipTitle: string,
// };

const TipIcon = styled.i`
  display: inline-flex !important;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  color: #001833;
  line-height: 1.5;
`;
const toolTips = {
  color: '#f4f4f4',
  size: '0.2rem',
  fontSize: '0.2rem',
  float: top,
  marginTop: '-23px',
};
const TipLabel = ({
  className,
  label,
  name,
  required,
  errorMsg,
  tipTrigger,
  tipPosition,
  tipTitle,
}) => (
  <label
    className={cx(
      {
        'sui-label': true,
        'sui-form__error': !!errorMsg,
      },
      className,
    )}
    htmlFor={name}
  >
    {`${label}${required ? ' *' : ''}`}
    <Tooltip title={tipTitle} position={tipPosition} trigger={tipTrigger} hideDelay="100000">
      <TipIcon className="far fa-info-circle" style={{ toolTips }} />
    </Tooltip>
  </label>
);

const defaultProps = {
  tipTrigger: 'mouseenter',
  tipPosition: 'top',
};
TipLabel.defaultProps = defaultProps;

export default TipLabel;
