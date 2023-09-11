import PropTypes from 'prop-types';

CheckboxesSection.propTypes = {
  values: PropTypes.object,
  Field: PropTypes.elementType,
  disabled: PropTypes.bool,
};

function CheckboxesSection({ values, Field, disabled }) {
  return (
    <div className="form-col">
      <div className="checkbox-container">
        <Field
          name="priority"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.priority}
            />
          )}
        />
        <label>High Priority</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="negotiatedFill"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.negotiatedFill}
            />
          )}
        />
        <label>Negotiated Fill</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="cow"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.cow}
            />
          )}
        />
        <label>Call on Way</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="sos"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.sos}
            />
          )}
        />
        <label>See on Site</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="cabOver"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.cabOver}
            />
          )}
        />
        <label>Cab Over</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="permittedCan"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.permittedCan}
            />
          )}
        />
        <label>Permitted Can</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="alleyPlacement"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.alleyPlacement}
            />
          )}
        />
        <label>Alley Placement</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="earlyPickUp"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.earlyPickUp}
            />
          )}
        />
        <label>Allow Early Pickup</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="okToRoll"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.okToRoll}
            />
          )}
        />
        <label>OK To Roll</label>
      </div>
      <div className="checkbox-container">
        <Field
          name="customerProvidedProfile"
          render={({ field }) => (
            <input
              disabled={disabled}
              {...field}
              type="checkbox"
              className="checkbox"
              checked={values.customerProvidedProfile}
            />
          )}
        />
        <label>Customer Provided Profile #</label>
      </div>
    </div>
  );
}

export default CheckboxesSection;
