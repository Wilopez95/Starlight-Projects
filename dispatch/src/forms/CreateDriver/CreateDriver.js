import { Component } from "react";
import { Formik, Field } from "formik";
import PropTypes from "prop-types";
import * as R from "ramda";
import { Tooltip } from "react-tippy";
import * as Yup from "yup";
import ImageInput from "../elements/ImageInput";

const toolTips = {
  position: "relative",
  top: "-3px",
  left: "8px",
};

class CreateDriver extends Component {
  static propTypes = {
    onSuccessSubmit: PropTypes.func,
    onDismiss: PropTypes.func,
    driver: PropTypes.object,
    trucks: PropTypes.array,
    onUpdateDriver: PropTypes.func,
    onCreateDriver: PropTypes.func,
    truckOpts: PropTypes.array,
    id: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired,
    ]),
  };

  static defaultProps = {
    onDismiss: R.identity,
    onSuccessSubmit: R.identity,
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
    };

    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  async onValidSubmit(data) {
    const { id, trucks } = this.props;
    const action = id ? "edit" : "create";
    const isCreateTruck = R.is(Object, data.truck);
    const truck = isCreateTruck
      ? data.truck || {}
      : R.find(R.propEq("id", parseInt(data.truck, 10)))(trucks) || {};
    const formData = { ...data, truck };

    this.setState({ submitting: true });

    try {
      if (action === "edit") {
        await this.props.onUpdateDriver(formData);
      } else {
        await this.props.onCreateDriver(formData);
      }

      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  createNewTruck(value) {
    return {
      label: value,
      create: true,
      value: {
        name: value,
        type: "TRUCK",
      },
    };
  }

  removePhoto = () => {
    this.props.onUpdateDriver({ photo: null });
  };

  schema = Yup.object().shape({
    name: Yup.string().required("Required"),
    username: Yup.string().required("Required"),
    phoneNumber: Yup.string().max("15", "Too long!"),
    truck: Yup.string().notOneOf(["selectTruck"]).required("Required"),
    enableWoControl: Yup.boolean(),
    allowOoS: Yup.boolean(),
  });

  renderForm() {
    const {
      driver: { data },
    } = this.props;
    const photoStyles =
      data && data.photo
        ? { backgroundImage: `url(${this.props.driver.data.photo})` }
        : {};

    return (
      <Formik
        enableReinitialize
        initialValues={{
          photo: this.props.driver?.data?.photo || "",
          name: this.props.driver?.data?.name || "",
          username: this.props.driver?.data?.username || "",
          phoneNumber: this.props.driver?.data?.phoneNumber || "",
          truck: this.props.driver?.data?.truck?.id || "selectTruck",
          enableWoControl: this.props.driver?.data?.enableWoControl || false,
          allowOoS: this.props.driver?.data?.allowOoS || false,
        }}
        validationSchema={this.schema}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit, setFieldValue, errors }) => (
          <form className="form form--createDriver">
            <div className="form-row">
              <div className="form-col">
                <div className="tooltip-container">
                  <label className="form-label">Photo</label>
                  <Tooltip
                    title="Enter a PNG or JPG image of the driver. The driver photo must be the correct orientation."
                    position="top"
                    trigger="click"
                  >
                    <i className="far fa-info-circle fa-xs" style={toolTips} />
                  </Tooltip>
                </div>
                {data && data.photo ? (
                  <div className="photo" style={photoStyles}>
                    <button
                      className="photo-removeBtn"
                      onClick={this.removePhoto}
                      type="button"
                    >
                      <i className="far fa-trash" />
                    </button>
                  </div>
                ) : (
                  <ImageInput name="photo" setValue={setFieldValue} />
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Name</label>
                <Tooltip
                  title="Who is the driver? Please enter their full name."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="name"
                type="name"
                className={
                  errors.name ? "text-input error-required" : "text-input"
                }
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Email</label>
                <Tooltip
                  title="What is the drivers email address? We will use this to reset their DriverApp password if needed."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="username"
                type="username"
                className={
                  errors.username ? "text-input error-required" : "text-input"
                }
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Phone Number</label>
                <Tooltip
                  title="What is the drivers phone number?"
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="phoneNumber"
                type="text"
                className={
                  errors.phoneNumber
                    ? "text-input error-required"
                    : "text-input"
                }
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Truck</label>
                <Tooltip
                  title="Please select the correct truck number."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="truck"
                value={values.truck}
                component="select"
                className={
                  errors.truck ? "text-input error-required" : "text-input"
                }
              >
                {this.props.id ? null : (
                  <option key="selectTruck" value="selectTruck">
                    Select a truck
                  </option>
                )}
                {this.props.truckOpts.map((truck) => (
                  <option key={truck.value} value={truck.value}>
                    {truck.label}
                  </option>
                ))}
              </Field>
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <Field
                  name="enableWoControl"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="checkbox"
                      className="checkbox"
                      checked={values.enableWoControl}
                    />
                  )}
                />
                <label className="form-label">
                  Allow full control of work order queue
                </label>
                <Tooltip
                  title="This gives drivers the ability to start work orders in the driver application in whatever order they prefer."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <Field
                  name="allowOoS"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="checkbox"
                      className="checkbox"
                      checked={values.allowOoS}
                    />
                  )}
                />
                <label className="form-label">
                  Allow out of service can pickup
                </label>
                <Tooltip
                  title="This gives drivers the ability to pick up cans marked as out of service."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
            </div>
            <footer className="form-actions">
              <button
                className="button button__empty mr-2"
                onClick={this.props.onDismiss}
                disabled={this.state.submitting}
                type="button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button__primary"
                disabled={this.state.submitting}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </footer>
          </form>
        )}
      </Formik>
    );
  }

  render() {
    return this.renderForm();
  }
}

export default CreateDriver;
