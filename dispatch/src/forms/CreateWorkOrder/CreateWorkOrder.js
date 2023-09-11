/* eslint-disable react/no-unsafe */
/* eslint-disable complexity, max-lines, camelcase, react/prop-types */

import { Component } from "react";
import { Formik, Field } from "formik";
import * as R from "ramda";
import { connect } from "react-redux";
import ReactDatePicker from "react-datepicker";
import { withRouter } from "react-router-dom";
import has from "lodash/has";
import { Tooltip } from "react-tippy";
import moment from "moment";
import { selectTemplates } from "@root/state/modules/templates";
import {
  fetchWaypointsIfNeeded,
  selectWaypoints,
} from "@root/state/modules/locations";

import TimePicker from "@root/forms/elements/TimePicker";
import ConnectedGeoAutocomplete from "@root/forms/elements/GeoAutocomplete";
import { fetchDrivers } from "@root/state/modules/drivers";

import {
  createWorkOrder,
  fetchWorkOrder,
  fetchWorkOrders,
  forgetWorkOrder,
} from "@root/state/modules/workOrders";

const toolTips = {
  position: "relative",
  top: "-3px",
  left: "8px",
};

const toString = R.unless(R.is(String), R.toString);

const simpleExtractor = (value) => ({ label: value, value });

const prepareListForSelect = R.uncurryN(2, (extractor /* , list */) =>
  R.ifElse(R.is(Array), R.map(extractor), R.always([]))
);

const initialState = (state) => {
  const drivers = R.over(
    R.lensProp("list"),
    prepareListForSelect((driver) => ({
      label: driver.description,
      value: String(driver.id),
    })),
    state.drivers
  );
  const workOrderHasDriver = has(state.workOrders.single.driver, "id");

  if (workOrderHasDriver) {
    const workOrderDriverInList = R.any(
      R.propEq("value", String(state.workOrders.single.driver.id)),
      drivers.list
    );
    if (!workOrderDriverInList) {
      const preparedWorkOrderDriver = {
        value: String(state.workOrders.single.driver.id),
        label: `${state.workOrders.single.driver.name} (deleted)`,
      };
      drivers.list.push(preparedWorkOrderDriver);
    }
  }
  return {
    workOrderStatuses: state.constants.workOrder.status,
    locations: selectWaypoints(state),
    sizes: prepareListForSelect(
      R.pipe(toString, simpleExtractor),
      state.constants.can.size
    ),
    actions: prepareListForSelect(
      simpleExtractor,
      R.values(state.constants.workOrder.action)
    ),
    statuses: prepareListForSelect(
      simpleExtractor,
      R.values(state.constants.workOrder.status)
    ),
    materials: prepareListForSelect(
      simpleExtractor,
      state.constants.workOrder.material
    ),
    drivers,
    workOrder: state.workOrders.single,
    workOrderActionConstants: state.constants.workOrder.action,
    mapConfig: state.setting.map,
    templates: selectTemplates(state),
    workOrders: state.workOrders,
  };
};

const landfillActions = ["FINAL", "SWITCH", "DUMP & RETURN", "LIVE LOAD"];
const waypointActions = ["PICKUP CAN", "DROPOFF CAN"];
const locationFields = {
  SPOT: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  FINAL: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  SWITCH: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  "DUMP & RETURN": {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  "LIVE LOAD": {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: false,
    },
  },
  "PICKUP CAN": {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  "DROPOFF CAN": {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
  RELOCATE: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: true,
      disabled: false,
    },
  },
  REPOSITION: {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: true,
      disabled: false,
    },
  },
  "GENERAL PURPOSE": {
    location1: {
      required: true,
      disabled: false,
    },
    location2: {
      required: false,
      disabled: true,
    },
  },
};

// type Props = {
//   dispatch: Function,
//   filter: Object,
//   onSuccessSubmit: () => void,
//   workOrderId: number,
//   actions: Array<Object>,
//   action: string,
//   sizes: Array<Object>,
//   templates: Array<Object>,
//   drivers: Object,
//   materials: Array<Object>,
//   workOrders: Object,
//   mapConfig: MapConfigType,
//   onDismiss: () => void,
//   fetchWaypointsIfNeeded: () => void,
//   workOrder: Object,
//   locations: Array<LocationType>,
//   location: RouterLocation,
// };

class CreateWorkOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {
        action: false,
        size: false,
        material: false,
        template: false,
      },
      location1: {},
      location2: {},
      scheduledDate: moment().format("YYYY-MM-DD"),
      isLocationValid1: false,
      isLocationValid2: false,
      locationFields: {
        location1: {
          required: true,
          disabled: true,
        },
        location2: {
          required: false,
          disabled: true,
        },
      },
    };

    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  componentDidMount() {
    // need to check path to determine if we should send the modifiedDate
    // do not pass modified date on dispatcher tab causes rendering issues per Steven
    const pathParam = this.props.location.pathname.includes("table");
    const type = pathParam ? "workorders" : "dispatch";
    const { dispatch } = this.props;
    if (!this.props.drivers.list.length) {
      dispatch(
        fetchDrivers({
          businessUnitId: this.props.match.params.businessUnit,
          activeOnly: true,
        })
      );
    }
    dispatch(fetchWaypointsIfNeeded());
    dispatch(
      fetchWorkOrders(
        {
          ...this.props.filter,
        },
        type
      )
    );
  }

  // @TODO: deprecated lifecycle method
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch, action, workOrderId } = nextProps;
    const isChangedId = workOrderId && this.props.workOrderId !== workOrderId;

    if (action === "edit" && isChangedId) {
      dispatch(forgetWorkOrder());
      dispatch(fetchWorkOrder(workOrderId));
    }
  }

  onTypeChange = (value) => {
    if (!locationFields[value]) {
      return;
    }

    this.setState({
      locationFields: locationFields[value],
    });
  };

  applyTime(time) {
    return moment(time, "HH:mm").format("HH:mm:ss");
  }

  async onValidSubmit(data) {
    if (
      !data.action ||
      !data.size ||
      !data.material ||
      !data.templateId ||
      !this.state.isLocationValid1 ||
      data.templateId === "selectTemplate" ||
      data.size === "selectSize" ||
      data.material === "selectMaterial" ||
      data.templateId === "selectTemplate" ||
      (this.state.locationFields.location2.required &&
        !this.state.isLocationValid2)
    ) {
      this.setState((state) => ({
        errors: {
          action: !data.action || data.action === "selectType",
          size: !data.size || data.size === "selectSize",
          material: !data.material || data.material === "selectMaterial",
          templateId: !data.templateId || data.templateId === "selectTemplate",
        },
        isLocationValid1: state.locationFields.location1.required
          ? !!state.location1.description || !!state.location1.name
          : true,
        isLocationValid2: state.locationFields.location2.required
          ? !!state.location2.name
          : true,
      }));
      return;
    }

    const formData = R.mapObjIndexed(
      (value) => (value === "" ? null : value),
      data
    );
    formData.driverId = formData.driverId && Number(formData.driverId);

    const wo = this.props.workOrder;

    this.setState({ submitting: true });

    let status = "UNASSIGNED";

    const woDriver = (wo && wo.driver && wo.driver.id) || null;

    const statusWasChanged = wo.status !== status;
    const driverWasChanged = Number(woDriver) !== Number(formData.driverId);

    if (
      (statusWasChanged && driverWasChanged) ||
      (!statusWasChanged && driverWasChanged)
    ) {
      if (formData.driverId) {
        if (status === "UNASSIGNED") {
          status = "ASSIGNED";
        }
      } else if (status === "ASSIGNED") {
        status = "UNASSIGNED";
      }
    } else if (statusWasChanged && !driverWasChanged) {
      if (formData.driverId) {
        if (status === "UNASSIGNED") {
          formData.driverId = null;
        }
      } else if (status === "ASSIGNED") {
        status = "UNASSIGNED";
      }
    }

    const nextIndex = formData.driverId
      ? this.props.workOrders.filtered.filter(
          (workOrder) =>
            // eslint-disable-next-line eqeqeq
            workOrder.driver.id == formData.driverId &&
            workOrder.status !== "COMPLETED" &&
            workOrder.status !== "CANCELED"
        ).length
      : this.props.workOrders.filtered.filter(
          (workOrder) =>
            !!workOrder.driver.id &&
            workOrder.status !== "COMPLETED" &&
            workOrder.status !== "CANCELED"
        ).length;

    try {
      // check to see if the path workorders is in the params and add dispatch if so
      const hasId = this.props.location.pathname.includes("table");
      const type = hasId ? "workorders" : "dispatch";
      await this.props.dispatch(
        createWorkOrder(
          {
            ...formData,
            scheduledDate: this.state.scheduledDate,
            scheduledStart:
              this.state.scheduledStart &&
              this.applyTime(this.state.scheduledStart),
            scheduledEnd:
              this.state.scheduledEnd &&
              this.applyTime(this.state.scheduledEnd),
            location1: this.state.location1,
            location2: this.state.location2,
            status,
            index: nextIndex,
            businessUnitId: this.props.match.params.businessUnit,
          },
          undefined,
          type
        )
      );
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  setLocationValid1 = (value) => {
    this.setState({ isLocationValid1: value });
  };

  setLocationValid2 = (value) => {
    this.setState({ isLocationValid2: value });
  };

  setLocation1 = (value) => {
    this.setState({ location1: value });
  };

  setLocation2 = (value) => {
    this.setState({ location2: value });
  };

  render() {
    const actionTypes = this.props.actions.map((act) => ({
      value: act.value,
      label: act.label === "SPOT" ? "DELIVERY" : act.label,
    }));
    const filteredActions = actionTypes
      .filter((at) => !at.label.includes("SUSPEND"))
      .filter((at) => !at.label.includes("RESUME"));

    return (
      <div className="form form--editWorkOrder">
        <Formik
          enableReinitialize={false}
          initialValues={{
            contactName: "",
            contactNumber: "",
            customerName: "",
            action: "",
            size: "",
            material: "",
            signatureRequired: false,
            templateId: "",
            driverId: "",
            instructions: "",
            textOnWay: "",
            permitNumber: "",
            profileNumber: "",
            poNumber: "",
            priority: false,
            negotiatedFill: false,
            cow: false,
            sos: false,
            cabOver: false,
            permittedCan: false,
            alleyPlacement: false,
            earlyPickUp: false,
            okToRoll: false,
            customerProvidedProfile: false,
            location1: "",
            location2: "",
            scheduledDate: "",
            scheduledStart: "",
            scheduledEnd: "",
          }}
          onSubmit={(values) => {
            this.onValidSubmit(values);
          }}
        >
          {({ values, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="form-row">
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Client Name</label>
                      <Tooltip
                        title="What is the name of the person placing the order?"
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="contactName"
                      type="contactName"
                      className="text-input"
                    />
                  </div>
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Client Phone</label>
                      <Tooltip
                        title="What is the phone number of the person placing the order?"
                        position="top"
                        trigger="click"
                        // hideOnClick="true"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="contactNumber"
                      type="contactNumber"
                      className="text-input"
                    />
                  </div>
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Client Company Name</label>
                      <Tooltip
                        title="What is the name of the company this person works for?"
                        position="top"
                        trigger="click"
                        // hideOnClick="true"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="customerName"
                      type="customerName"
                      className="text-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Type *</label>
                      <Tooltip
                        title="What kind of service is this person asking for? Delivery, Final, Switch… etc."
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="action"
                      component="select"
                      className={
                        this.state.errors.action
                          ? "text-input error-required"
                          : "text-input"
                      }
                      onChange={(e) => {
                        setFieldValue("action", e.target.value);
                        this.onTypeChange(e.target.value);
                        if (e.target.value === "selectType") {
                          this.setState(() => ({
                            errors: {
                              action: true,
                            },
                          }));
                        } else {
                          this.setState(() => ({
                            errors: {
                              action: false,
                            },
                          }));
                        }

                        if (locationFields[e.target.value].location2.disabled) {
                          this.setLocation2({});
                        }
                      }}
                    >
                      <option key="selectType" value="selectType">
                        Select type
                      </option>
                      {filteredActions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Can Size *</label>
                      <Tooltip
                        title="What size of canister does the customer want?"
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="size"
                      component="select"
                      className={
                        this.state.errors.size
                          ? "text-input error-required"
                          : "text-input"
                      }
                      onChange={(e) => {
                        setFieldValue("size", e.target.value);
                        if (e.target.value == "selectSize") {
                          this.setState({
                            errors: {
                              size: true,
                            },
                          });
                        } else {
                          this.setState(() => ({
                            errors: {
                              size: false,
                            },
                          }));
                        }
                      }}
                    >
                      <option key="selectSize" value="selectSize">
                        Select size
                      </option>
                      {this.props.sizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.value}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div className="form-col">
                    <label className="form-label">Material *</label>
                    <Field
                      name="material"
                      component="select"
                      className={
                        this.state.errors.material
                          ? "text-input error-required"
                          : "text-input"
                      }
                      onChange={(e) => {
                        setFieldValue("material", e.target.value);
                        if (e.target.value === "selectMaterial") {
                          this.setState(() => ({
                            errors: {
                              material: true,
                            },
                          }));
                        } else {
                          this.setState({
                            errors: {
                              material: false,
                            },
                          });
                        }
                      }}
                    >
                      <option key="selectMaterial" value="selectMaterial">
                        Select material
                      </option>
                      {this.props.materials.map((material) => (
                        <option key={material.value} value={material.value}>
                          {material.value}
                        </option>
                      ))}
                    </Field>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-col">
                    <div className="checkbox-container">
                      <Field
                        name="signatureRequired"
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            className="checkbox"
                            checked={values.signatureRequired}
                          />
                        )}
                      />
                      <label>Signature Required</label>
                    </div>
                  </div>
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Template</label>
                      <Tooltip
                        title="What logo and style of documentation did you want to use for this order? "
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="templateId"
                      component="select"
                      className={
                        this.state.errors.templateId
                          ? "text-input error-required"
                          : "text-input"
                      }
                      onChange={(e) => {
                        setFieldValue("templateId", e.target.value);
                        if (e.target.value === "selectTemplate") {
                          this.setState(() => ({
                            errors: {
                              templateId: true,
                            },
                          }));
                        } else {
                          this.setState({
                            errors: {
                              templateId: false,
                            },
                          });
                        }
                      }}
                    >
                      <option key="selectTemplate" value="selectTemplate">
                        Select template
                      </option>
                      {this.props.templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div className="form-col" />
                </div>
              </div>
              <div className="form-group">
                <div className="form-row">
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Driver Name</label>
                      <Tooltip
                        title="What driver do you want on this order? *This can be changed later."
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="driverId"
                      component="select"
                      className="text-input"
                    >
                      <option key="selectDriver" value="selectDriver">
                        Select driver
                      </option>
                      {this.props.drivers.list.map((driver) => (
                        <option key={driver.value} value={driver.value}>
                          {driver.label}
                        </option>
                      ))}
                    </Field>
                    <div className="tooltip-container">
                      <label className="form-label">Instructions</label>
                      <Tooltip
                        title="What special instructions does the driver need to know about this work order?"
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="instructions"
                      type="instructions"
                      component="textarea"
                      className="textarea"
                    />
                  </div>
                  <div className="form-col">
                    <div className="tooltip-container">
                      <label className="form-label">Text On Way</label>
                      <Tooltip
                        title="Does the customer want a text when the driver starts his work order? Enter the cell phone here."
                        position="top"
                        trigger="click"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="textOnWay"
                      type="textOnWay"
                      className="text-input"
                    />
                    <div className="tooltip-container">
                      <label className="form-label">Permit Number</label>
                      <Tooltip
                        title="Does this customer have a Permit Number? *This is not required."
                        position="top"
                        trigger="click"
                        // hideOnClick="true"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="permitNumber"
                      type="permitNumber"
                      className="text-input"
                    />
                    <div className="tooltip-container">
                      <label className="form-label">Profile Number</label>
                      <Tooltip
                        title="Does this customer have a Profile Number? *This is not required."
                        position="top"
                        trigger="click"
                        // hideOnClick="true"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="profileNumber"
                      type="profileNumber"
                      className="text-input"
                    />
                    <div className="tooltip-container">
                      <label className="form-label">PO Number</label>
                      <Tooltip
                        title="Does the customer have a PO Number? *This is not required."
                        position="top"
                        trigger="click"
                        // hideOnClick="true"
                      >
                        <i
                          className="far fa-info-circle fa-xs"
                          style={toolTips}
                        />
                      </Tooltip>
                    </div>
                    <Field
                      name="poNumber"
                      type="poNumber"
                      className="text-input"
                    />
                  </div>
                  <div className="form-col">
                    <div className="checkbox-container">
                      <Field
                        name="priority"
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            className="checkbox"
                            checked={!!values.priority}
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
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <div className="tooltip-container">
                    <label className="form-label">Scheduled Date *</label>
                    <Tooltip
                      title="What day does the customer need the service done?"
                      position="top"
                      trigger="click"
                    >
                      <i
                        className="far fa-info-circle fa-xs"
                        style={toolTips}
                      />
                    </Tooltip>
                  </div>
                  <Field
                    name="scheduledDate"
                    render={() => (
                      <ReactDatePicker
                        disabledKeyboardNavigation
                        onChangeRaw={(e) => e.preventDefault()}
                        minDate={new Date()}
                        onChange={(value) => {
                          this.setState({
                            scheduledDate: value.format("YYYY-MM-DD"),
                          });
                        }}
                        selected={moment(this.state.scheduledDate)}
                        className="date-input"
                      />
                    )}
                  />
                  <div className="tooltip-container">
                    <label className="form-label">
                      Scheduled Time Window Start
                    </label>
                    <Tooltip
                      title="What time does the customer need us to start the work?"
                      position="top"
                      trigger="click"
                    >
                      <i
                        className="far fa-info-circle fa-xs"
                        style={toolTips}
                      />
                    </Tooltip>
                  </div>
                  <Field
                    name="scheduledStart"
                    render={() => (
                      <TimePicker
                        name="scheduledStart"
                        showSecond={false}
                        placeholder="Select time"
                        value={this.state.scheduledStart || ""}
                        onChange={(scheduledStart) =>
                          this.setState({
                            scheduledStart,
                          })
                        }
                      />
                    )}
                  />
                  <div className="tooltip-container">
                    <label className="form-label">
                      Scheduled Time Window End
                    </label>
                    <Tooltip
                      title="What time does the customer need us to end the work?"
                      position="top"
                      trigger="click"
                    >
                      <i
                        className="far fa-info-circle fa-xs"
                        style={toolTips}
                      />
                    </Tooltip>
                  </div>
                  <Field
                    name="scheduledEnd"
                    render={() => (
                      <TimePicker
                        name="scheduledEnd"
                        showSecond={false}
                        placeholder="Select time"
                        value={this.state.scheduledEnd || ""}
                        onChange={(scheduledEnd) =>
                          this.setState({
                            scheduledEnd,
                          })
                        }
                      />
                    )}
                  />
                </div>
                <div className="form-col">
                  <div className="tooltip-container">
                    <label className="form-label">Location 1 *</label>
                    <Tooltip
                      title="What address does the customer need the service?"
                      position="top"
                      trigger="click"
                    >
                      <i
                        className="far fa-info-circle fa-xs"
                        style={toolTips}
                      />
                    </Tooltip>
                  </div>
                  <Field
                    name="location1"
                    render={() => (
                      <ConnectedGeoAutocomplete
                        name="location1"
                        mapId="map1"
                        geocoderId="geocoder1"
                        setLocation={this.setLocation1}
                        setLocationValid={this.setLocationValid1}
                        value={
                          this.state.location1.description ||
                          this.state.location1.name ||
                          ""
                        }
                        isValid={
                          !this.state.locationFields.location1.required ||
                          this.state.isLocationValid1
                        }
                        isWaypoint={R.contains(values.action, waypointActions)}
                        twoLocationsRequired={false}
                        disabled={this.state.locationFields.location1.disabled}
                        required={this.state.locationFields.location1.required}
                        centerLon={this.props.mapConfig.lon}
                        centerLat={this.props.mapConfig.lat}
                        zoom={this.props.mapConfig.zoom}
                        locations={this.props.locations}
                      />
                    )}
                  />
                </div>
                <div className="form-col">
                  <div className="tooltip-container">
                    <label className="form-label">
                      {this.state.locationFields.location2.required
                        ? "Location 2 *"
                        : "Location 2"}
                    </label>
                    <Tooltip
                      title="What address does the customer need the service?"
                      position="top"
                      trigger="click"
                    >
                      <i
                        className="far fa-info-circle fa-xs"
                        style={toolTips}
                      />
                    </Tooltip>
                  </div>
                  <Field
                    name="location2"
                    render={() => (
                      <ConnectedGeoAutocomplete
                        name="location2"
                        mapId="map2"
                        isWaypoint={R.contains(values.action, landfillActions)}
                        twoLocationsRequired={
                          values.action === "REPOSITION" ||
                          values.action === "RELOCATE"
                        }
                        geocoderId="geocoder2"
                        value={
                          this.state.location2.description ||
                          this.state.location2.name ||
                          ""
                        }
                        setLocation={this.setLocation2}
                        setLocationValid={this.setLocationValid2}
                        isValid={
                          !this.state.locationFields.location2.required ||
                          this.state.isLocationValid2
                        }
                        disabled={this.state.locationFields.location2.disabled}
                        required={this.state.locationFields.location2.required}
                        centerLon={this.props.mapConfig.lon}
                        centerLat={this.props.mapConfig.lat}
                        zoom={this.props.mapConfig.zoom}
                        locations={this.props.locations}
                      />
                    )}
                  />
                </div>
              </div>
              <footer className="form-footer">
                {this.state.errors.action ||
                this.state.errors.size ||
                this.state.errors.material ? (
                  <span className="error-summary">
                    Please fill out the required fields
                  </span>
                ) : null}
                <button
                  className="button button__empty mr-2"
                  type="button"
                  onClick={this.props.onDismiss}
                >
                  Cancel
                </button>
                <button
                  className="button button__primary"
                  type="submit"
                  disabled={this.state.submitting}
                >
                  Save
                </button>
              </footer>
            </form>
          )}
        </Formik>
      </div>
    );
  }
}

// needs params to only pass modified date to workorders tabs
export default withRouter(connect(initialState)(CreateWorkOrder));
