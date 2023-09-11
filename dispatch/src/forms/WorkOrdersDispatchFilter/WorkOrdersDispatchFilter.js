/* eslint-disable complexity */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field } from 'formik';
import { Dropdown, DropdownContent } from '@root/components/Dropdown';
import Checkbox from '../elements/checkbox';

export const valuesDecorator = (values, props) => {
  const {
    search,
    status,
    scheduledStartAM,
    scheduledStartPM,
    cow,
    sos,
    alleyPlacement,
    permittedCan,
    earlyPickUp,
    cabOver,
    okToRoll,
    priority,
    negotiatedFill,
    customerProvidedProfile,
  } = values;

  let sizeString = '';
  let actionString = '';
  let materialString = '';
  props.sizes.forEach((size) => {
    if (values[size.value]) {
      sizeString += `${size.value},`;
    }
  });
  props.actions.forEach((action) => {
    if (values[action.label]) {
      if (action.label === 'DELIVERY') {
        actionString += 'SPOT,';
      } else {
        actionString += `${action.label},`;
      }
    }
  });
  props.materials.forEach((material) => {
    if (values[material.value]) {
      materialString += `${material.value},`;
    }
  });
  return {
    ...values,
    search: search || '',
    status: status || '',
    size: sizeString,
    material: materialString,
    action: actionString,
    scheduledStartAM: scheduledStartAM ? 1 : false,
    scheduledStartPM: scheduledStartPM ? 1 : false,
    cow: cow ? 1 : false,
    sos: sos ? 1 : false,
    alleyPlacement: alleyPlacement ? 1 : false,
    permittedCan: permittedCan ? 1 : false,
    earlyPickUp: earlyPickUp ? 1 : false,
    cabOver: cabOver ? 1 : false,
    okToRoll: okToRoll ? 1 : false,
    priority: priority ? 1 : false,
    negotiatedFill: negotiatedFill ? 1 : false,
    customerProvidedProfile: customerProvidedProfile ? 1 : false,
  };
};

class WorkOrdersDispatchFilter extends Component {
  static propTypes = {
    statuses: PropTypes.array,
    onChange: PropTypes.func,
    state: PropTypes.object,
    actions: PropTypes.array,
    materials: PropTypes.array,
    sizes: PropTypes.array,
  };

  static defaultProps = {
    actions: [],
    materials: [],
    sizes: [],
    statuses: [],
    onChange: () => {},
  };

  onChange = (values) => {
    this.props.onChange(valuesDecorator(values, this.props));
  };

  render() {
    const { actions, sizes, materials } = this.props;

    const initialActionValues = {};
    actions.forEach((action) => {
      initialActionValues[action.value] = false;
    });
    const initialSizeValues = {};
    sizes.forEach((size) => {
      initialSizeValues[size.value] = false;
    });
    const initialMaterialValues = {};
    materials.forEach((material) => {
      initialMaterialValues[material.value] = false;
    });
    return (
      <Formik
        enableReinitialize
        initialValues={this.props.state}
        validate={(values) => {
          this.onChange(values);
        }}
      >
        {({ values, setValues }) => (
          <form className="form form--filter-workorders">
            <div className="form-row">
              <div className="form-col">
                <Dropdown className="dropdown--filter" active>
                  <DropdownContent>
                    <header className="dropdown-header">
                      <h3 className="dropdown-title">dispatch Orders filter</h3>
                      <div className="dropdown-header-controls">
                        <ul className="controls-list">
                          <li>
                            <button
                              type="button"
                              data-name="clear-dropdown-filters"
                              onClick={() => {
                                const values = {
                                  scheduledStartAM: false,
                                  scheduledStartPM: false,
                                  cow: false,
                                  sos: false,
                                  alleyPlacement: false,
                                  permittedCan: false,
                                  earlyPickUp: false,
                                  cabOver: false,
                                  okToRoll: false,
                                  priority: false,
                                  negotiatedFill: false,
                                  customerProvidedProfile: false,
                                };
                                setValues({
                                  size: '',
                                  material: '',
                                  action: '',
                                  ...values,
                                });
                                const { actions, sizes, materials } = this.props;

                                actions.forEach((action) => {
                                  values[action.value] = false;
                                });
                                sizes.forEach((size) => {
                                  values[size.value] = false;
                                });
                                materials.forEach((material) => {
                                  values[material.value] = false;
                                });
                                this.onChange(values);
                              }}
                              className="button button__empty"
                            >
                              Clear all
                            </button>
                          </li>
                        </ul>
                      </div>
                    </header>
                    <div className="ordersFilter">
                      <div className="ordersFilter-inner">
                        <div className="ordersFilter-column">
                          <div className="ordersFilter-row">
                            <h4 className="checkbox-group-title">Can Size</h4>
                            {sizes.map((size) => (
                              <Field
                                name={size.value}
                                key={size.value}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    name={size.label}
                                    label={size.label}
                                    value={values[size.value]}
                                  />
                                )}
                              />
                            ))}
                          </div>
                          <div className="ordersFilter-row">
                            <h4 className="checkbox-group-title">Materials</h4>
                            {materials.map((material) => (
                              <Field
                                name={material.value}
                                key={material.value}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    name={material.label}
                                    label={material.label}
                                    value={values[material.value]}
                                  />
                                )}
                              />
                            ))}
                          </div>
                          <div className="ordersFilter-row">
                            <h4 className="checkbox-group-title">Job Type</h4>
                            {actions.map((action) => (
                              <Field
                                name={action.value}
                                key={action.value}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    name={action.label}
                                    label={action.label}
                                    value={values[action.label]}
                                  />
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="ordersFilter-column">
                          <div className="ordersFilter-row">
                            <Checkbox
                              name="scheduledStartAM"
                              label="Has Scheduled Start (AM)"
                              value={values.scheduledStartAM}
                            />
                            <Checkbox
                              name="scheduledStartPM"
                              label="Has Scheduled Start (PM)"
                              value={values.scheduledStartPM}
                            />
                            <Checkbox name="cow" label="Call on Way" value={values.cow} />
                            <Checkbox name="sos" label="See on Site" value={values.sos} />
                            <Checkbox
                              name="alleyPlacement"
                              label="Alley Placement"
                              value={values.alleyPlacement}
                            />
                            <Checkbox
                              name="permittedCan"
                              label="Permitted Can"
                              value={values.permittedCan}
                            />
                            <Checkbox
                              name="earlyPickUp"
                              label="Allow Early Pickup"
                              value={values.earlyPickUp}
                            />
                            <Checkbox name="cabOver" label="Cab Over" value={values.cabOver} />
                            <Checkbox name="okToRoll" label="OK To Roll" value={values.okToRoll} />
                            <Checkbox name="priority" label="Priority" value={values.priority} />
                            <Checkbox
                              name="negotiatedFill"
                              label="Negotiated Fill"
                              value={values.negotiatedFill}
                            />
                            <Checkbox
                              name="customerProvidedProfile"
                              label="Customer Provided Profile #"
                              value={values.customerProvidedProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          </form>
        )}
      </Formik>
    );
  }
}

export default WorkOrdersDispatchFilter;
