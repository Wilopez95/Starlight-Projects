/* eslint-disable react/prop-types */

import { Field } from 'formik';

// type Props = {
//   name: string,
//   value: boolean,
//   label: string,
// };

const Checkbox = (props) => (
  <div className="checkbox-container">
    <Field
      name={props.name}
      render={({ field }) => (
        <input {...field} type="checkbox" className="checkbox" checked={props.value || false} />
      )}
    />
    <label className="checkbox-label">{props.label}</label>
  </div>
);

export default Checkbox;
