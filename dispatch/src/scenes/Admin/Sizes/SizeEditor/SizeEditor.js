/* eslint-disable react/prop-types */
import { Component } from 'react';
import { connect } from 'react-redux';
import injectReducer from '@root/utils/injectReducer';
import { createSize, fetchSize, updateSize, sizes } from '@root/state/modules/sizes';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import SizeForm from '@root/scenes/Admin/components/SizeForm';

// type Props = {
//   match: Match,
//   isLoading: boolean,
//   size: SizeType,
//   location: Object,
//   updateSize: (number, Object) => void,
//   createSize: Object => void,
//   history: History,
//   push: string => void,
//   fetchSize: (?number) => void,
// };

// type PopProps = {
//   closePopup: Function,
//   text: string,
// };
function Popup(props) {
  return (
    <div className="popup">
      <div className="popup_inner">
        <h1>{props.text}</h1>
        <button type="button" onClick={props.closePopup}>
          close me
        </button>
      </div>
    </div>
  );
}

class SizeEditor extends Component {
  constructor() {
    super();
    this.state = {
      showPopup: false,
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      this.props.fetchSize(id);
    }
  }

  togglePopup = () => {
    this.setState((prevState) => ({
      showPopup: !prevState.showPopup,
    }));
  };

  handleSubmitForm = async (formData) => {
    const hasId = this.props.location.pathname.includes('edit');

    const action = hasId ? 'edit' : 'create';

    try {
      if (action === 'edit') {
        const { id } = this.props.match.params;
        await this.props.updateSize(id, formData);
      } else {
        await this.props.createSize(formData);
      }
      this.backToList();
    } catch (error) {
      console.log(error);
    }
  };

  backToList = () => {
    this.props.history.push('/configuration/sizes');
  };

  render() {
    const {
      size,
      match: {
        params: { id },
      },
    } = this.props;
    const action = id ? 'edit' : 'create';

    return (
      <AdminView title={`${action} Size`} isLoading={this.props.isLoading}>
        <SizeForm
          onSubmitForm={this.handleSubmitForm}
          size={size}
          onDismiss={this.backToList}
          id={Number(id)}
          mode={action}
          onClick={this.togglePopup}
        />
        {this.state.showPopup ? <Popup text="Close Me" closePopup={this.togglePopup} /> : null}
      </AdminView>
    );
  }
}

const mapStateToProps = (state) => ({
  size: state.sizes.current,
  isLoading: state.sizes.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  createSize: (data) => dispatch(createSize(data)),
  updateSize: (id, data) => dispatch(updateSize(id, data)),
  fetchSize: (id) => dispatch(fetchSize(id)),
});

const connectedSizeEditor = connect(mapStateToProps, mapDispatchToProps)(SizeEditor);

export default injectReducer({ key: 'sizes', reducer: sizes })(connectedSizeEditor);
