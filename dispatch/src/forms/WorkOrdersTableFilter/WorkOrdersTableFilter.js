/* eslint-disable complexity */
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import cx from 'classnames';
import { Tooltip } from 'react-tippy';
import { Field, Formik } from 'formik';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { Dropdown, DropdownTrigger, DropdownContent } from 'components/Dropdown';
import SearchInput from '../elements/SearchInput';
import DateRangeInput from '../elements/DateRangeInput';
import Checkbox from '../elements/checkbox';

export const valuesDecorator = (values, props, date) => {
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
    date,
    status: status !== 'All statuses' && status !== 'allStatuses' ? status : null,
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

class WorkOrdersTableFilter extends Component {
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

  state = {
    search: '',
    date: {
      startDate: moment().startOf('day').format('MM/DD/YYYY'),
      endDate: moment().endOf('day').format('MM/DD/YYYY'),
    },
  };

  onChange = (values) => {
    this.props.onChange(valuesDecorator(values, this.props, this.state.date));
  };

  onResetDropdownFilters = (setFieldValue) => {
    const values = {
      size: false,
      material: false,
      action: false,
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
    const { actions, sizes, materials } = this.props;

    actions.forEach((action) => {
      setFieldValue(action.value, false);
    });
    setFieldValue('DELIVERY', false);
    sizes.forEach((size) => {
      setFieldValue(size.value, false);
    });
    materials.forEach((material) => {
      setFieldValue(material.value, false);
    });
    Object.keys(values).forEach((key) => setFieldValue(key, false));

    this.onChange(values);
  };

  render() {
    const { actions, sizes, materials, statuses, state } = this.props;
    const activeFilters = R.values(R.omit(['bounds', 'date', 'search', 'status'], state)).some(
      (el) => Boolean(el),
    );

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
          ...initialActionValues,
          ...initialSizeValues,
          ...initialMaterialValues,
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
          DELIVERY: false,
          SPOT: false,
          status: 'allStatuses',
          date: {},
          search: '',
        }}
        validate={(values) => {
          this.onChange(values);
        }}
      >
        {({ values, setFieldValue }) => (
          <form className="form form--filter-table">
            <div className="form-row">
              <div className="form-col" style={{ width: '65%' }}>
                <SearchInput
                  name="search"
                  placeholder="Search by typing here…"
                  value={this.state.search || ''}
                  setValue={(search) => {
                    this.setState({ search });
                  }}
                  onChange={(search) => {
                    this.setState({ search });
                    debounce(() => this.onChange({ ...values, search }, true), 250, {
                      leading: true,
                      trailing: false,
                    })();
                  }}
                />
              </div>
              <div className="form-col" style={{ width: '15%' }}>
                <DateRangeInput
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
              <div className="form-col" style={{ width: '15%' }}>
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
              <div className="form-col" style={{ width: '5%' }}>
                <Dropdown className="dropdown--filter">
                  <DropdownTrigger>
                    <button
                      className={cx('btn btn__filters', {
                        'active-filters': activeFilters,
                      })}
                      type="button"
                    >
                      <Tooltip
                        title="Filter the work order table "
                        position="top"
                        trigger="mouseenter"
                      >
                        <i className="far fa-filter" /> Filters
                      </Tooltip>
                    </button>
                  </DropdownTrigger>
                  <DropdownContent>
                    <header className="dropdown-header">
                      <h3 className="dropdown-title">Orders filter</h3>
                      <div className="dropdown-header-controls">
                        <ul className="controls-list">
                          <li>
                            <button
                              type="button"
                              data-name="clear-dropdown-filters"
                              onClick={() => this.onResetDropdownFilters(setFieldValue)}
                              className="btn btn__link"
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
                      </div>
                      <div className="dropdown-column">
                        <div className="dropdown-row">
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

export default WorkOrdersTableFilter;
