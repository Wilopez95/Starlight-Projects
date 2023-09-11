/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { fetchDriverHaulsData } from '@root/state/modules/driverhauls';
import { DriverHaulsTable } from '@root/components/DriverHaulsTable';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

// type Props = {
//   fetchDriverHaulsData: () => void,
//   timezone: string,
//   driverData: Array<Object>,
// };

export class ReportsHome extends PureComponent {
  componentDidMount() {
    this.props.fetchDriverHaulsData();
  }

  render() {
    return (
      <div style={{ overflow: 'auto' }}>
        <Helmet title="Reports" />
        <h1 className="page-title">Reports</h1>
        <br />
        <h3>Pull CSV Reports</h3>
        <div className="button-group button-group__reports">
          <Link
            className="button button__primary btn__lg"
            to={{
              pathname: pathToUrl(`${Paths.Reports}/drivers/haul-time`, {
                businessUnit: this.props.match.params.businessUnit,
              }),
            }}
          >
            <i className="fas fa-file-download" /> &nbsp; Drivers Haul Time Report
          </Link>
          <Link
            className="button button__primary btn__lg"
            to={{
              pathname: pathToUrl(`${Paths.Reports}/cans/cans-aging`, {
                businessUnit: this.props.match.params.businessUnit,
              }),
            }}
          >
            <i className="fas fa-file-download" /> &nbsp; Cans Aging Report
          </Link>
          <Link
            className="button button__primary btn__lg"
            to={{
              pathname: pathToUrl(`${Paths.Reports}/workorders/workorder-notes`, {
                businessUnit: this.props.match.params.businessUnit,
              }),
            }}
          >
            <i className="fas fa-file-download" /> &nbsp; Workorder Notes Report
          </Link>
        </div>
        <span style={{ display: 'flex', marginBottom: '20px' }}>
          <h3>Driver Hauls Report By Day </h3>
          {/* Commented out until we decide to move forward on editing timecards */}
          {/* <Link
            style={{
              borderRadius: '10px',
              backgroundColor: 'teal',
              color: 'white',
              paddingLeft: '10px',
              paddingRight: '10px',
              paddingTop: '4px',
              paddingBottom: '4px',
              fontSize: '15px',
              height: '50%',
              marginTop: '15px',
              marginLeft: '20px',
            }}
            to="/admin/trips-timecards"
          >
            <i className="fas fa-edit" /> &nbsp; Edit Driver Hauls Report
          </Link> */}
        </span>
        <DriverHaulsTable driverData={this.props.driverData} timezone={this.props.timezone} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  setting: state.setting,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  driverData: state.driverhauls.allResults,
});

export default withRouter(connect(mapStateToProps, { fetchDriverHaulsData })(ReportsHome));
