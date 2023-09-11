import { Children, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
// Components
import ModalRoute from '@root/components/ModalRoute';

class EditCan extends Component {
  static propTypes = {
    can: PropTypes.object,
    sizes: PropTypes.array,
    onDismiss: PropTypes.func,
    waypoints: PropTypes.array,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  };

  constructor(props) {
    super(props);

    this.state = {
      fetchCanError: null,
      loading: true,
    };

    this.close = this.close.bind(this);
  }

  close() {
    this.props.onDismiss();
  }

  renderChildren() {
    const { can, sizes, waypoints } = this.props;
    const onDismiss = this.close;
    const onSuccessSubmit = this.close;

    return Children.map(this.props.children, (child) =>
      cloneElement(child, {
        can,
        sizes,
        waypoints,
        onDismiss,
        onSuccessSubmit,
      }),
    );
  }

  render() {
    return (
      <ModalRoute title="Edit can">
        <div>
          {this.state.loading && !this.state.fetchCanError ? <p>Loading...</p> : null}
          {this.state.fetchCanError ? <p className="error">{this.state.fetchCanError}</p> : null}
          {!this.state.loading && !this.state.fetchCanError ? this.renderChildren() : null}
        </div>
      </ModalRoute>
    );
  }
}

export default EditCan;
