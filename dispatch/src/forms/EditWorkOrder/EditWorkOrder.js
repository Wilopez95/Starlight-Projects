/* eslint-disable complexity, react/prop-types, react/no-unsafe, react/no-array-index-key, max-lines, react/no-did-mount-set-state, camelcase */
import { Component } from 'react';
import { Formik, Field } from 'formik/dist/index';
import { connect } from 'react-redux';
import * as R from 'ramda';
import ReactDatePicker from 'react-datepicker';
import { Tooltip } from 'react-tippy';
import moment from 'moment/moment';
import has from 'lodash/has';
import { withRouter } from 'react-router-dom';
import * as Yup from 'yup';
import { selectTemplates } from '@root/state/modules/templates';
import { fetchDrivers } from '@root/state/modules/drivers';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';
import {
  updateSingleWorkOrder,
  fetchWorkOrder,
  forgetWorkOrder,
} from '@root/state/modules/workOrders';
import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';
import TimePicker from '../elements/TimePicker';
import locationFields from './locationFieldsObj';
import CheckboxesSection from './CheckboxesSection';
import SecondInfoBlock from './SecondInfoBlock';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

const toString = R.unless(R.is(String), R.toString);

const simpleExtractor = (value) => ({ label: value, value });

const prepareListForSelect = R.uncurryN(2, (extractor /* , list */) =>
  R.ifElse(R.is(Array), R.map(extractor), R.always([])),
);

const landfillActions = ['FINAL', 'SWITCH', 'DUMP & RETURN', 'LIVE LOAD'];

// type Props = {
//   actions: Array<{ label: string, value: string }>,
//   action: string,
//   dispatch: Function,
//   drivers: {
//     list: Array<{ label: string, value: string }>,
//   },
//   location: PropTypes.object,
//   mapConfig: Object,
//   materials: Array<{ label: string, value: string }>,
//   onDismiss: () => void,
//   onSuccessSubmit: () => void,
//   sizes: Array<{ label: string, value: string }>,
//   statuses: Array<{ label: string, value: string }>,
//   templates: Array<TemplateType>,
//   isLoading: boolean,
//   workOrder: WorkOrderType,
//   workOrderActionConstants: Object,
//   workOrderId: ?string,
//   workOrderStatuses: Object,
//   waypoints: Array<LocationType>,
//   history: Object,
//   reversedCoreActionsObj: Object,
//   billableService: Object,
//   serviceMaterials: Object,
// };

// type State = {
//   isLocationValid1: boolean,
//   isLocationValid2: boolean,
//   location1: Object,
//   location2: Object,
//   action: string,
//   scheduledStart?: string,
//   scheduledEnd?: string,
//   scheduledDate?: string,
//   submitting: boolean,
//   resetMap2: boolean,
//   isScheduledEndRequired: boolean,
//   isScheduledEndRequired: boolean,
// };

class EditWorkOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location1: {
        location: {},
      },
      isScheduledStartRequired: false,
      isScheduledEndRequired: false,
      location2: {
        location: {},
        resetMap2: false,
      },
      action: props.workOrder.action,
      submitting: false,
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
    const { dispatch, action, workOrderId } = this.props;
    if (!this.props.drivers.list.length) {
      dispatch(
        fetchDrivers({
          businessUnitId: this.props.match.params.businessUnit,
          activeOnly: true,
        }),
      );
    }

    if (action === 'edit' && workOrderId && workOrderId !== 'edit') {
      dispatch(forgetWorkOrder());
      dispatch(fetchWorkOrder(workOrderId)).then(() => {
        this.setState(() => ({
          location1: this.props.workOrder.location1,
          location2: this.props.workOrder.location2,
          isLocationValid1: !!this.props.workOrder.location1.name,
          isLocationValid2: !!this.props.workOrder.location2.name,
          scheduledStart: this.props.workOrder.scheduledStart,
          scheduledEnd: this.props.workOrder.scheduledEnd,
          scheduledDate: this.props.workOrder.scheduledDate,
          action: this.props.workOrder.action,
          isScheduledStartRequired: !!this.props.workOrder.scheduledStart,
          isScheduledEndRequired: !!this.props.workOrder.scheduledEnd,
        }));
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch, action, workOrderId } = nextProps;

    const isChangedId = workOrderId && this.props.workOrderId !== workOrderId;

    if (action === 'edit' && isChangedId && workOrderId !== 'edit') {
      dispatch(forgetWorkOrder());
      dispatch(fetchWorkOrder(workOrderId));
    }
    if (this.props.workOrder.location1 !== nextProps.workOrder.location1) {
      this.setState(() => ({
        location1: nextProps.workOrder.location1,
        location2: nextProps.workOrder.location2,
        isLocationValid1: !!nextProps.workOrder.location1.name,
        isLocationValid2: !!nextProps.workOrder.location2.name,
        scheduledStart: nextProps.workOrder.scheduledStart,
        scheduledEnd:
          nextProps.workOrder.scheduledEnd === '00:00:00' ? '' : nextProps.workOrder.scheduledEnd,
        scheduledDate: nextProps.workOrder.scheduledDate,
        action: nextProps.workOrder.action,
        locationFields: nextProps.workOrder.action
          ? locationFields[nextProps.workOrder.action]
          : {
              location1: {
                required: true,
                disabled: true,
              },
              location2: {
                required: false,
                disabled: true,
              },
            },
      }));
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
    return moment(time, 'HH:mm').format('HH:mm:ss');
  }

  async onValidSubmit({
    service, // eslint-disable-line no-unused-vars
    ...data
  }) {
    if (
      !this.state.isLocationValid1 ||
      ((locationFields[this.state.action].location2.required ||
        locationFields[data.action]?.location2.required) &&
        !this.state.isLocationValid2)
    ) {
      return;
    }

    const formData = R.mapObjIndexed((value) => (value === '' ? null : value), data);
    formData.driverId = formData.driverId && Number(formData.driverId);

    const { workOrder } = this.props;

    this.setState({ submitting: true });

    let { status } = formData;

    const woDriver = workOrder?.driver?.id || null;

    const statusWasChanged = workOrder.status !== status;
    const driverWasChanged = Number(woDriver) !== Number(formData.driverId);

    if ((statusWasChanged && driverWasChanged) || (!statusWasChanged && driverWasChanged)) {
      if (formData.driverId) {
        if (status === 'UNASSIGNED') {
          status = 'ASSIGNED';
          // force the scheduledDate to updated to today if the order becomes assigned
          // otherwise the order will not display on the driver and driver app when a driver is assigned to a resume
          this.setState({
            scheduledDate:
              this.props.workOrder.action.includes('RESUME') &&
              moment(new Date()).format('YYYY-MM-DD') !== this.props.workOrder.scheduledDate
                ? moment(new Date()).format('YYYY-MM-DD')
                : this.props.workOrder.scheduledDate,
          });
        }
      } else if (status === 'ASSIGNED') {
        status = 'UNASSIGNED';
      }
    } else if (statusWasChanged && !driverWasChanged) {
      if (formData.driverId) {
        if (status === 'UNASSIGNED') {
          formData.driverId = null;
        }
      } else if (status === 'ASSIGNED') {
        status = 'UNASSIGNED';
      }
    }
    const putData = formData;
    if (putData.templateId === '') {
      delete putData.templateId;
    }
    try {
      const pathParam = this.props.location.pathname.includes('table');
      const type = pathParam ? 'workorders' : 'dispatch';

      await this.props.dispatch(
        updateSingleWorkOrder(
          {
            ...putData,
            scheduledDate: this.state.scheduledDate,
            scheduledStart: this.state.scheduledStart && this.applyTime(this.state.scheduledStart),
            scheduledEnd: this.state.scheduledEnd && this.applyTime(this.state.scheduledEnd),
            location1: this.state.location1,
            location2: this.state.location2,
            haulingDisposalSiteId:
              this.props.workOrder.haulingBillableServiceId !== null &&
              this.state.location2?.description
                ? this.state.location2?.haulingDisposalSiteId
                : null,
            status,
          },
          null,
          type,
        ),
      );

      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      // eslint-disable-next-line no-unused-vars
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

  setLocation2 = (value, resetMap2, isLocationValid2 = true) => {
    this.setState({ location2: value, resetMap2, isLocationValid2 });
  };

  schema = Yup.object().shape({
    service: Yup.string().required(),
  });

  transformCoreActionToDispatch = (coreActionType) => {
    const { reversedCoreActionsObj, workOrderActionConstants } = this.props;

    const rightActionsKey = reversedCoreActionsObj[coreActionType];
    const rightActionsVal = workOrderActionConstants[rightActionsKey];

    return rightActionsVal;
  };

  render() {
    const {
      id,
      status,
      contactName,
      contactNumber,
      customerName,
      size,
      material,
      signatureRequired,
      pendingSuspend,
      templateId,
      driver,
      instructions,
      textOnWay,
      permitNumber,
      profileNumber,
      poNumber,
      priority,
      negotiatedFill,
      cow,
      sos,
      cabOver,
      permittedCan,
      alleyPlacement,
      earlyPickUp,
      okToRoll,
      customerProvidedProfile,
      scheduledDate,
      haulingBillableServiceId,
      serviceDescription,
    } = this.props.workOrder;
    if (!this.state.action) {
      return null;
    }

    const isWOfromCore =
      this.props.billableService.services.length > 0 && !!haulingBillableServiceId;
    const coreActionType = this.props.billableService.action;
    const hasCoreRequiredProps = isWOfromCore
      ? {
          serviceDescription,
          haulingBillableServiceId: this.props.billableService.currentServicesId,
          haulingMaterialId: this.props.serviceMaterials.serviceCoreMaterialsId,
        }
      : {};

    return (
      <div className="form form--editWorkOrder">
        <Formik
          key={isWOfromCore ? "updatedForm" : "initialForm"} // used for initial values update only if order from core
          validationSchema={isWOfromCore ? this.schema : null}
          initialValues={{
            id: id || "",
            status: status || "",
            contactName: contactName || "",
            contactNumber: contactNumber || "",
            customerName: customerName || "",
            service: this.props.billableService.currentService,
            action: isWOfromCore
              ? this.transformCoreActionToDispatch(coreActionType)
              : this.state.action,
            pendingSuspend: pendingSuspend || false,
            size: size || "",
            material: this.state.material || material,
            signatureRequired: signatureRequired || false,
            templateId: templateId || "",
            driverId: driver.id || {},
            instructions: instructions || "",
            textOnWay: textOnWay || "",
            permitNumber: permitNumber || "",
            profileNumber: profileNumber || "",
            poNumber: poNumber || "",
            priority: priority || false,
            negotiatedFill: negotiatedFill || false,
            cow: cow || false,
            sos: sos || false,
            cabOver: cabOver || false,
            permittedCan: permittedCan || false,
            alleyPlacement: alleyPlacement || false,
            earlyPickUp: earlyPickUp || false,
            okToRoll: okToRoll || false,
            customerProvidedProfile: customerProvidedProfile || false,
            location1: this.state.location1 || "",
            location2: this.state.location2 || "",
            scheduledDate: scheduledDate || "",
            ...hasCoreRequiredProps,
          }}
          onSubmit={(values) => {
            if (
              !this.state.scheduledStart &&
              this.state.isScheduledStartRequired
            ) {
              this.setState({ scheduledStart: null });
            }
            if (!this.state.scheduledEnd && this.state.isScheduledEndRequired) {
              this.setState({ scheduledEnd: null });
            }

            this.onValidSubmit(values);
          }}
        >
          {({ values, handleSubmit, setFieldValue, errors }) => (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">ID</label>
                    <Field
                      disabled={status === "CANCELED"}
                      name="id"
                      type="id"
                      className="text-input"
                    />
                  </div>
                  <div className="form-col">
                    <label className="form-label">Status</label>
                    <Field
                      disabled={status === "CANCELED"}
                      name="status"
                      component="select"
                      className="text-input"
                    >
                      {this.props.statuses.map((stat) => (
                        <option key={stat.value} value={stat.value}>
                          {stat.value}
                        </option>
                      ))}
                    </Field>
                  </div>
                  {R.contains(values.action, landfillActions) ? (
                    <div
                      className="form-col"
                      style={{ marginLeft: 20, paddingLeft: 200 }}
                    >
                      <div className="checkbox-container">
                        <Field
                          name="pendingSuspend"
                          render={({ field }) => (
                            <input
                              {...field}
                              disabled={status === "CANCELED"}
                              type="checkbox"
                              className="checkbox"
                              checked={values.pendingSuspend}
                            />
                          )}
                        />
                        <label>Pending Suspension</label>
                      </div>
                    </div>
                  ) : null}
                  <div className="form-col" />
                </div>
              </div>
              <SecondInfoBlock
                setLocation2={this.setLocation2}
                disabled={status === "CANCELED"}
                errors={errors}
                Field={Field}
                values={values}
                {...this.props}
                setFieldValue={setFieldValue}
                onTypeChange={this.onTypeChange}
                setValueInState={(value) => this.setState({ action: value })}
                isWOfromCore={isWOfromCore}
                transformCoreActionToDispatch={
                  this.transformCoreActionToDispatch
                }
                serviceCoreMaterialsId={
                  this.props.serviceMaterials.serviceCoreMaterialsId
                }
                currentServiceMaterials={
                  this.props.serviceMaterials.currentServiceMaterials
                }
              />
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
                      disabled={status === "CANCELED"}
                      name="driverId"
                      component="select"
                      className="text-input"
                    >
                      <option key="selectDriver" value="selectDriver">
                        Select driver
                      </option>
                      {this.props.drivers.list.map((driv, index) => (
                        <option key={index} value={driv.value}>
                          {driv.label}
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
                      disabled={status === "CANCELED"}
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
                      disabled={status === "CANCELED"}
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
                      disabled={status === "CANCELED"}
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
                      disabled={status === "CANCELED"}
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
                      disabled={status === "CANCELED"}
                      name="poNumber"
                      type="poNumber"
                      className="text-input"
                    />
                  </div>
                  <CheckboxesSection
                    disabled={status === "CANCELED"}
                    Field={Field}
                    values={values}
                  />
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
                        disabled={status === "CANCELED"}
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
                        disabled={status === "CANCELED"}
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
                        disabled={status === "CANCELED"}
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
                        isWaypoint={false}
                        twoLocationsRequired={false}
                        geocoderId="geocoder1"
                        setLocation={this.setLocation1}
                        setLocationValid={this.setLocationValid1}
                        isValid={
                          !this.state.locationFields.location1.required ||
                          this.state.isLocationValid1
                        }
                        disabled={
                          this.state.locationFields.location1.disabled ||
                          status === "CANCELED"
                        }
                        required={this.state.locationFields.location1.required}
                        value={
                          this.state.location1.description ||
                          this.state.location1.name ||
                          ""
                        }
                        centerLon={
                          this.state.location1?.location?.lon ||
                          this.props.mapConfig?.lon
                        }
                        centerLat={
                          this.state.location1?.location?.lat ||
                          this.props.mapConfig?.lat
                        }
                        zoom={this.props.mapConfig.zoom}
                        locations={this.props.waypoints}
                      />
                    )}
                  />
                </div>
                <div className="form-col">
                  <div className="tooltip-container">
                    <label className="form-label">
                      Location 2
                      {values.action === "REPOSITION" ||
                      values.action === "RELOCATE"
                        ? " *"
                        : null}
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
                        setLocation={this.setLocation2}
                        setLocationValid={this.setLocationValid2}
                        isValid={
                          !this.state.locationFields.location2.required ||
                          this.state.isLocationValid2
                        }
                        disabled={
                          this.state.locationFields.location2.disabled ||
                          status === "CANCELED"
                        }
                        required={this.state.locationFields.location2.required}
                        centerLon={
                          this.state.location2?.location?.lon ||
                          this.props.mapConfig?.lon
                        }
                        centerLat={
                          this.state.location2?.location?.lat ||
                          this.props.mapConfig?.lat
                        }
                        resetMap={this.state.resetMap2}
                        zoom={this.props.mapConfig.zoom}
                        value={
                          this.state.location2.description ||
                          this.state.location2.name ||
                          ""
                        }
                        isCoreItem={
                          this.props.workOrder.haulingBillableServiceId !== null
                        }
                        coreId={id}
                        locations={this.props.waypoints}
                      />
                    )}
                  />
                </div>
              </div>

              <footer className="form-footer">
                <button
                  className="button button__empty mr-2"
                  type="button"
                  onClick={this.props.onDismiss}
                >
                  Cancel
                </button>
                {R.contains(values.action, landfillActions) &&
                this.props.workOrder.step === "FINISH SERVICE" ? (
                  <button
                    className="button button__empty mr-2"
                    type="button"
                    onClick={() => {
                      this.props.history.push(
                        pathToUrl(
                          `${Paths.WorkOrders}/suspend/:woaction/:step/:driverId/:workOrderId`,
                          {
                            businessUnit: this.props.match.params.businessUnit,
                            woaction: encodeURIComponent(this.state.action),
                            step: encodeURIComponent(
                              this.props.workOrder.step === null
                                ? "workorder"
                                : this.props.workOrder.step
                            ),
                            driverId: this.props.workOrder.driver?.id ?? "nodriver",
                            workOrderId: this.props.workOrder.id,
                          }
                        )
                      );
                    }}
                  >
                    Suspend
                  </button>
                ) : null}

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

const mapStateToProps = (state) => {
  // takes state.drivers
  // enters state.drivers.list
  // maps to {label: '', value: ''}
  const drivers = R.over(
    R.lensProp('list'),
    prepareListForSelect((driver) => ({
      label: driver.description,
      value: String(driver.id),
    })),
    state.drivers,
  );

  if (has(state.workOrders.single, 'driver.id')) {
    // checks to see if the driver id matches any of the
    // values mapped in state.drivers.list
    const workOrderDriverInList = R.any(
      R.propEq('value', String(state.workOrders.single.driver.id)),
      drivers.list,
    );
    // if driver cannot be found in the mapped list,
    // make a value/label and push it
    if (!workOrderDriverInList) {
      const preparedWorkOrderDriver = {
        value: String(state.workOrders.single.driver.id),
        label: `${state.workOrders.single.driver.description} (deleted)`,
      };
      drivers.list.push(preparedWorkOrderDriver);
    }
  }

  const haulingBillableServiceId = state.workOrders?.single?.haulingBillableServiceId;
  const services =
    state.workOrderServices?.services
      ?.filter(({ active, id }) => active || id === haulingBillableServiceId)
      .map((bs) => ({
        value: bs.description,
        label: bs.description,
        action: bs.action,
        cansize: bs.equipmentItem?.shortDescription,
        id: bs.id,
      })) || [];
  const { size } = state.workOrders.single;
  const haulingMaterialId = state.workOrders?.single?.haulingMaterialId;
  const serviceMaterials =
    state.workOrderServices?.serviceMaterials
      ?.filter(({ active, id }) => active || id === haulingMaterialId)
      .map((sm) => ({
        value: sm.description,
        label: sm.description,
        id: sm.id,
      })) || [];

  const currentServicesId = state.workOrders?.single?.haulingBillableServiceId || 1;

  const serviceCoreMaterialsId = state.workOrders?.single?.haulingMaterialId || 1;

  const workOrderhaulingActionConstants = state.constants.workOrder.haulingAction || [];

  const reversedCoreActionsObj = Object.keys(workOrderhaulingActionConstants).reduce(
    (prev, next) => ({
      ...prev,
      [workOrderhaulingActionConstants[next]]: next,
    }),
    {},
  );

  const currentCoreService = services.find((service) => service.id === currentServicesId);

  const currentCoreMaterials = serviceMaterials.find(
    (material) => material.id === serviceCoreMaterialsId,
  );

  const sizes = prepareListForSelect(R.pipe(toString, simpleExtractor), state.constants.can.size);

  return {
    workOrderStatuses: state.constants.workOrder.status,
    sizes: sizes.some(({ value }) => value === size)
      ? sizes
      : [...sizes, { label: size, value: size }],
    actions: prepareListForSelect(simpleExtractor, R.values(state.constants.workOrder.action)),
    statuses: prepareListForSelect(simpleExtractor, R.values(state.constants.workOrder.status)),
    materials: prepareListForSelect(simpleExtractor, state.constants.workOrder.material),
    drivers,
    workOrder: state.workOrders.single,
    isLoading: state.workOrders.isLoading,
    workOrderActionConstants: state.constants.workOrder.action,
    reversedCoreActionsObj,
    mapConfig: state.setting.map,
    templates: selectTemplates(state),
    billableService: {
      reversedCoreActionsObj,
      currentServicesId,
      services,
      currentService: currentCoreService?.value || state.workOrders.single.serviceDescription,
      action: currentCoreService?.action,
    },
    serviceMaterials: {
      serviceCoreMaterialsId,
      materials: serviceMaterials,
      currentServiceMaterials: currentCoreMaterials?.value,
    },
  };
};

export default withRouter(connect(mapStateToProps)(EditWorkOrder));
