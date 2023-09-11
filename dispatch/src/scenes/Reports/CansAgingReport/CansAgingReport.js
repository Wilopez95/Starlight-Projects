import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { exportCansAging } from '@root/state/modules/cans';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import FormCansAgingReport from '@root/forms/ReportCansAging';

const mapState = (state) => ({
  data: state,
});

class CansAgingReport extends PureComponent {
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
  }

  render() {
    const { data, dispatch, history } = this.props;

    return (
      <main>
        <div className="page--reports-editor">
          <header className="page-header">
            <h1 className="page-title">Cans Aging Report</h1>
          </header>
        </div>
        <div className="page-inner report-container">
          <FormCansAgingReport
            onSubmit={(data) => dispatch(exportCansAging(data))}
            onDismiss={history.goBack}
            fileName="cans-aging-report"
            data={data}
          />
        </div>
      </main>
    );
  }
}

export default withRouter(connect(mapState)(CansAgingReport));
