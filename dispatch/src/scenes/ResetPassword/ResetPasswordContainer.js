import { connect } from 'react-redux';
import { passwordReset } from '@root/state/modules/session';
import ResetPassword from './ResetPassword';

const mapDispatchToProps = (dispatch) => ({
  onSubmit: (resetToken, formInput) => dispatch(passwordReset(resetToken, formInput)),
});

export default connect(null, mapDispatchToProps)(ResetPassword);
