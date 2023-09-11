import { Component } from 'react';
import PropTypes from 'prop-types';

import * as R from 'ramda';
import cx from 'classnames';
import { Formik, Field } from 'formik';
import debounce from 'lodash/debounce';
import { Dropdown, DropdownTrigger, DropdownContent } from 'components/Dropdown';
import SearchInput from '../elements/SearchInput';
import Checkbox from '../elements/checkbox';
import DateRangeTimestampInput from '../elements/DateRangeTimestampInput';

class WorkOrdersFilter extends Component {
  static propTypes = {
    statuses: PropTypes.array,
    onChange: PropTypes.func,
    state: PropTypes.object,
    sizes: PropTypes.array,
    actions: PropTypes.array,
    materials: PropTypes.array,
  };

  static defaultProps = {
    statuses: [],
    state: {
      date: {
        endDate: '',
        startDate: '',
      },
    },
    sizes: [],
    actions: [],
    materials: [],
    onChange: R.identity,
  };

  state = {
    date: {
      startDate: this.props.state.date.startDate,
      endDate: this.props.state.date.endDate,
    },
    search: '',
    isFilterActive: false,
  };

  // eslint-disable-next-line
  onChange = (values) => {
    const {
      // search,
      status,
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
      suspensionLocationId,
    } = values;

    let sizeString = '';
    let actionString = '';
    let materialString = '';
    for (let i = 0; i < this.props.sizes.length; i++) {
      if (values[this.props.sizes[i].value]) {
        sizeString += `${this.props.sizes[i].value},`;
      }
    }
    if (sizeString[sizeString.length - 1] === ',') {
      sizeString = sizeString.slice(0, -1);
    }
    this.props.actions.forEach((action) => {
      if (values[action.label]) {
        if (action.label === 'DELIVERY') {
          actionString += 'SPOT,';
        } else {
          actionString += `${action.label},`;
        }
      }
    });
    this.props.materials.forEach((material) => {
      if (values[material.value]) {
        materialString += `${material.value},`;
      }
    });

    const returnValues = {
      date: this.state.date,
      search: this.state.search,
      status: status !== 'All statuses' && status !== 'allStatuses' ? status : null,
      size: sizeString || null,
      material: materialString,
      action: actionString,
      scheduledStartAM: false,
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
      suspensionLocationId: suspensionLocationId ? 1 : false,
    };
    if (
      returnValues.size ||
      returnValues.material ||
      returnValues.action ||
      returnValues.scheduledStartAM ||
      returnValues.scheduledStartPM ||
      returnValues.cow ||
      returnValues.sos ||
      returnValues.alleyPlacement ||
      returnValues.permittedCan ||
      returnValues.earlyPickUp ||
      returnValues.cabOver ||
      returnValues.okToRoll ||
      returnValues.priority ||
      returnValues.negotiatedFill ||
      returnValues.customerProvidedProfile ||
      returnValues.suspensionLocationId
    ) {
      this.setState({
        isFilterActive: true,
      });
    } else {
      this.setState({
        isFilterActive: false,
      });
    }
    this.props.onChange(returnValues);
  };

  render() {
    const { statuses, sizes, materials, actions } = this.props;

    // const date = new Date();

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
        initialValues={{
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
          suspensionLocationId: false,
          ...initialActionValues,
          ...initialMaterialValues,
          ...initialSizeValues,
        }}
        validate={(values) => {
          debounce(() => this.onChange(values), 400, {
            leading: true,
            trailing: true,
          })();
        }}
      >
        {({ values, setValues }) => (
          <form className="form form--filter-workorders">
            <div className="form-row">
              <div className="form-col" style={{ width: '75%' }}>
                <SearchInput
                  name="search"
                  placeholder="Search by typing here…"
                  value={this.state.search || ''}
                  setValue={(search) => {
                    this.setState({ search });
                  }}
                  onChange={(search) => {
                    this.setState({ search }, () => {
                      debounce(() => this.onChange(values), 400, {
                        leading: true,
                        trailing: true,
                      })();
                    });
                  }}
                />
              </div>
              <div className="form-col" style={{ width: '25%', textAlign: 'right' }}>
                <Dropdown className="dropdown--filter">
                  <DropdownTrigger>
                    <button
                      className={cx('btn btn__filters', {
                        'active-filters': this.state.isFilterActive,
                      })}
                      type="button"
                    >
                      <i className="far fa-filter" /> Filters
                    </button>
                  </DropdownTrigger>
                  <DropdownContent>
                    <header className="dropdown-header">
                      <h3 className="dropdown-title">Workorders filter</h3>
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
                                  suspensionLocationId: false,
                                };

                                actions.forEach((action) => {
                                  values[action.value] = false;
                                });
                                sizes.forEach((size) => {
                                  values[size.value] = false;
                                });
                                materials.forEach((material) => {
                                  values[material.value] = false;
                                });
                                setValues({
                                  size: '',
                                  material: '',
                                  action: '',
                                  ...values,
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
                    <div className="dropdown-inner">
                      <div className="dropdown-column">
                        <div className="dropdown-row">
                          {sizes.map((size) => (
                            <Checkbox
                              key={size.label}
                              name={size.label}
                              label={size.label}
                              value={values[size.value]}
                            />
                          ))}
                        </div>
                        <div className="dropdown-row">
                          {materials.map((material) => (
                            <Checkbox
                              key={material.label}
                              name={material.label}
                              label={material.label}
                              value={values[material.value]}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="dropdown-column">
                        {actions.map((action) => (
                          <Checkbox
                            key={action.label}
                            name={action.label}
                            label={action.label}
                            value={values[action.label]}
                          />
                        ))}
                        <Checkbox
                          name="suspensionLocationId"
                          label="SUSPENDED"
                          value={values.suspensionLocationId}
                        />
                      </div>
                      <div className="dropdown-column">
                        <div className="dropdown-row">
                          <div className="states-checkbox-group">
                            <h4 className="checkbox-group-title">Can state</h4>
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
            <div className="form-row">
              <div className="form-col">
                <DateRangeTimestampInput
                  name="date"
                  startDate={this.state.date.startDate}
                  endDate={this.state.date.endDate}
                  onChange={(date) => {
                    this.setState({ date }, () => {
                      this.onChange(values, true);
                    });
                  }}
                />
              </div>
              <div className="form-col">
                <Field name="status" component="select" className="text-input">
                  <option key="allStatuses" value="All statuses">
                    All statuses
                  </option>
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.value}
                    </option>
                  ))}
                </Field>
              </div>
            </div>
          </form>
        )}
      </Formik>
    );
  }
}

export default WorkOrdersFilter;
