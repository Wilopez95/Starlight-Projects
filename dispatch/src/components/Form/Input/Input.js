/* eslint-disable react/prop-types */

import cx from 'classnames';
import { connect, getIn } from 'formik';
import './styles.scss';
import FormField from '../FormField';

// export type InputTypes =
//   | 'text'
//   | 'color'
//   | 'email'
//   | 'hidden'
//   | 'image'
//   | 'number'
//   | 'password'
//   | 'range'
//   | 'search'
//   | 'tel'
//   | 'url';

// export type InputProps = {
//   formik: FormikProps,
//   className?: string,
//   disabled?: boolean,
//   hint?: string,
//   id?: string,
//   label?: string,
//   name: string,
//   helpText?: string,
//   tooltip: boolean,
//   tipTitle?: string,
//   placeholder?: string,
//   required?: boolean,
//   type?: InputTypes,
// };

export const Input = ({
  formik,
  className,
  disabled,
  helpText,
  id,
  label,
  name,
  placeholder,
  required,
  type,
  tooltip,
  tipTitle,
  ...rest
}) => {
  const { touched, errors, values, handleChange, handleBlur } = formik;
  const error = getIn(errors, name);
  const touch = getIn(touched, name);
  const errorMsg = touch && error ? error : null;

  return (
    <FormField
      errorMsg={errorMsg}
      touched={touch}
      label={label}
      tipTitle={tipTitle}
      tooltip={tooltip}
      required={required}
      name={name}
      disabled={disabled}
      className={className}
      helpText={helpText}
    >
      <input
        id={id || name}
        name={name}
        type={type}
        className={cx('sui-text-input', {
          // prettier-ignore
          'sui-has-error': !!errorMsg,
          // prettier-ignore
          'sui-disabled': disabled,
        })}
        placeholder={placeholder}
        value={getIn(values, name, '')}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        {...rest}
      />
    </FormField>
  );
};

Input.defaultProps = {
  className: null,
  disabled: false,
  hint: null,
  id: null,
  label: null,
  placeholder: null,
  required: false,
  type: 'text',
};

export default connect(Input);
