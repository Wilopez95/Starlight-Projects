/* eslint-disable react/prop-types */

import { Component } from 'react';
import { Field, Formik } from 'formik';

// type Props = {
//   can: CanType,
//   onDismiss: () => void,
//   onSuccessSubmit: () => void,
//   onSubmitCreateCanNote: (number, Object) => Object,
// };

class EditCanNotes extends Component {
  static defaultProps = {
    onDismiss: () => {},
    onSuccessSubmit: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  onValidSubmit(note) {
    this.setState({ submitting: true });

    try {
      const { can } = this.props;

      this.handleCreateCanNote(can.id, note);
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  handleCreateCanNote = (id, note) => {
    this.props.onSubmitCreateCanNote(id, note);
  };

  handleDismiss = () => {
    this.props.onDismiss();
  };

  render() {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          text: '',
        }}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ handleSubmit }) => (
          <form className="form--editCan-notes" onSubmit={this.onValidSubmit}>
            <div className="form-row">
              <label htmlFor="f-text" className="form-label">
                Note:
              </label>
              <div className="control">
                <Field name="text" className="textarea" component="textarea" />
              </div>
            </div>
            <footer className="form-actions">
              <button
                className="button button__empty mr-2"
                onClick={this.handleDismiss}
                disabled={this.state.submitting}
                type="button"
              >
                Cancel
              </button>
              <button
                className="button button__primary"
                type="submit"
                onClick={handleSubmit}
                disabled={this.state.submitting}
              >
                Apply edits
              </button>
            </footer>
          </form>
        )}
      </Formik>
    );
  }
}

export default EditCanNotes;
