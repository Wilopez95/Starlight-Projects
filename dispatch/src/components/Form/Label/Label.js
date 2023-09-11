/* eslint-disable react/prop-types */

import cx from 'classnames';

/* It's a type definition for the props of the Label component. */
// export type LabelProps = {
//   className?: string,
//   label?: string,
//   name: string,
//   errorMsg?: string,
//   required?: boolean,
// };

const Label = ({ className, label, name, required, errorMsg }) => (
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
  </label>
);

export default Label;
