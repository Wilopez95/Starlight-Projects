import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import FormDriversReport from '@root/forms/ReportDrivers';
import { exportDrivers, fetchDrivers } from '@root/state/modules/drivers';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';

const mapState = (state) => ({
  data: state,
});

class DriversHaulTimeReport extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    dispatch: PropTypes.func,
    history: PropTypes.object,
  };

  static defaultProps = {
    data: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchConstantsIfNeeded());
    dispatch(fetchDrivers());
  }

  render() {
    const { data, dispatch, history } = this.props;
    return (
      <main>
        <div className="page--reports-editor">
          <header className="page-header">
            <h1 className="page-title">Drivers Haul Time Report</h1>
          </header>
        </div>
        <div className="page-inner report-container">
          <FormDriversReport
            onDismiss={history.goBack}
            onSubmit={(data) => dispatch(exportDrivers(data))}
            fileName="drivers-haul-time-report"
            data={data}
          />
        </div>
      </main>
    );
  }
}

export default withRouter(connect(mapState)(DriversHaulTimeReport));
