/* eslint-disable react/prop-types */

import cx from 'classnames';
import { Label, TipLabel } from '../Label';

// type Props = {
//   name: string,
//   label: string,
//   tooltip: boolean,
//   tipTitle?: string,
//   helpText?: string,
//   disabled: boolean,
//   children: React.Node,
//   errorMsg?: string,
//   required: boolean,
//   className?: string,
// };
const FormField = ({
  name,
  label,
  tooltip,
  tipTitle,
  helpText,
  disabled,
  children,
  errorMsg,
  required,
  className,
}) => (
  <div
    className={cx('sui-form-element', className, {
      // prettier-ignore
      'sui-has-error': !!errorMsg,
      // prettier-ignore
      'sui-disabled': disabled,
    })}
  >
    {label && tooltip ? (
      <TipLabel
        tipTitle={tipTitle}
        errorMsg={errorMsg}
        name={name}
        label={label}
        required={required}
      />
    ) : (
      <Label errorMsg={errorMsg} name={name} label={label} required={required} />
    )}
    <div className="sui-form-control">
      {children}
      {helpText ? <span className="sui-form__hint">{helpText}</span> : null}
      {errorMsg ? <span className="sui-form__error">{errorMsg}</span> : null}
    </div>
  </div>
);

export default FormField;
