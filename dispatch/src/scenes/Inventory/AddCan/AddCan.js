/* eslint-disable react/prop-types */
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import ModalRoute from '@root/components/ModalRoute';
import { fetchWaypointsIfNeeded } from '@root/state/modules/locations';
import FormAddCan from '@root/forms/CreateCan';

// type Props = {
//   history: History,
//   fetchWaypointsIfNeeded: () => void,
// };

export class AddCan extends PureComponent {
  static displayName = 'AddCan';

  componentDidMount() {
    this.props.fetchWaypointsIfNeeded();
  }

  close = () => {
    this.props.history.goBack();
  };

  render() {
    const { history } = this.props;

    return (
      <ModalRoute title="Add a can" history={history}>
        <FormAddCan onDismiss={this.close} onSuccessSubmit={this.close} />
      </ModalRoute>
    );
  }
}

export default connect(null, { fetchWaypointsIfNeeded })(AddCan);
