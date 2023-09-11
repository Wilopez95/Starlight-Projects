import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import request from '@root/helpers/request';
import FormWorkorderNotesReport from '@root/forms/ReportWorkorderNotes';

class WorkorderNotesReport extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
  };

  handleSubmit = (data) =>
    request.get('/reports/workorder-notes', {
      params: data,
    });

  render() {
    const { history } = this.props;

    return (
      <main>
        <div className="page--reports-editor">
          <header className="page-header">
            <h1 className="page-title">WorkOrder Notes Report</h1>
          </header>
        </div>
        <div className="page-inner report-container">
          <FormWorkorderNotesReport
            onDismiss={history.goBack}
            onSubmit={this.handleSubmit}
            fileName="workorder-notes-report"
          />
        </div>
      </main>
    );
  }
}

export default withRouter(WorkorderNotesReport);
