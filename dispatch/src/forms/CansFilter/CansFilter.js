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

class CansFilter extends Component {
  static propTypes = {
    statuses: PropTypes.array,
    onChange: PropTypes.func,
    state: PropTypes.object,
    sizes: PropTypes.array,
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
    const { status, isRequiredMaintenance, isOutOfService, allowNullLocations, hazardous, inUse } =
      values;

    let sizeString = '';
    for (let i = 0; i < this.props.sizes.length; i++) {
      if (values[this.props.sizes[i].value]) {
        sizeString += `${this.props.sizes[i].value},`;
      }
    }
    if (sizeString[sizeString.length - 1] === ',') {
      sizeString = sizeString.slice(0, -1);
    }

    const returnValues = {
      date: this.state.date,
      search: this.state.search,
      status: status !== 'All statuses' && status !== 'allStatuses' ? status : null,
      size: sizeString || null,
      isRequiredMaintenance: isRequiredMaintenance ? 1 : null,
      isOutOfService: isOutOfService ? 1 : null,
      inUse: inUse ? 1 : null,
      allowNullLocations: allowNullLocations ? 1 : null,
      hazardous: hazardous ? 1 : null,
    };
    if (
      returnValues.size ||
      returnValues.isRequiredMaintenance ||
      returnValues.isOutOfService ||
      returnValues.hazardous ||
      returnValues.inUse
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

  onResetDropdownFilters = (values, setValues) => {
    this.setState({
      date: {
        endDate: '',
        startDate: '',
      },
      isFilterActive: false,
      search: '',
    });
    const initialSizeValues = {};
    this.props.sizes.forEach((size) => {
      initialSizeValues[size.value] = false;
    });
    setValues({
      ...initialSizeValues,
      isRequiredMaintenance: false,
      isOutOfService: false,
      hazardous: false,
      inUse: false,
      status: 'allStatuses',
    });
    this.onChange({
      ...initialSizeValues,
      isRequiredMaintenance: false,
      isOutOfService: false,
      inUse: false,
      hazardous: false,
    });
  };

  render() {
    const { statuses, sizes } = this.props;
    const initialSizeValues = {};
    sizes.forEach((size) => {
      // eslint-disable-next-line eqeqeq
      initialSizeValues[size.value] = this.props.state.size == size.label;
    });

    return (
      <Formik
        enableReinitialize
        initialValues={{
          isRequiredMaintenance: false,
          isOutOfService: false,
          inUse: false,
          hazardous: false,
          allowNullLocations: false,
        }}
        validate={(values) => {
          debounce(() => this.onChange(values), 400, {
            leading: true,
            trailing: true,
          })();
        }}
      >
        {({ values, setValues }) => (
          <form className="form form--filter-aside">
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
                      <h3 className="dropdown-title">Cans filter</h3>
                      <div className="dropdown-header-controls">
                        <ul className="controls-list">
                          <li>
                            <button
                              onClick={() => this.onResetDropdownFilters(values, setValues)}
                              className="button button__empty"
                              type="button"
                              data-name="clear-dropdown-filters"
                            >
                              Clear all
                            </button>
                          </li>
                        </ul>
                      </div>
                    </header>
                    <div className="dropdown-inner--cans">
                      <div className="dropdown-column">
                        <div className="dropdown-row">
                          <h4 className="checkbox-group-title">Can size</h4>
                          {sizes.map((size) => (
                            <Checkbox
                              key={size.label}
                              name={size.label}
                              label={size.title}
                              value={values[size.value]}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="dropdown-column">
                        <div className="dropdown-row">
                          <div className="states-checkbox-group">
                            <h4 className="checkbox-group-title">Can state</h4>
                            <Checkbox
                              name="isRequiredMaintenance"
                              label="Requires Maintenance"
                              value={values.isRequiredMaintenance}
                            />
                            <Checkbox
                              name="isOutOfService"
                              label="Out Of Service"
                              value={values.isOutOfService}
                            />
                            <Checkbox name="hazardous" label="Hazardous" value={values.hazardous} />
                            <Checkbox name="inUse" label="Staged/Suspended" value={values.inUse} />
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
            <div className="form-row">
              <div className="checkbox-container">
                <Field
                  name="allowNullLocations"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="checkbox"
                      className="checkbox"
                      style={{ top: '3px' }}
                      checked={values.allowNullLocations || false}
                    />
                  )}
                />
                <label className="checkbox-label">Show Cans with Unknown Locations</label>
              </div>
            </div>
          </form>
        )}
      </Formik>
    );
  }
}

export default CansFilter;
