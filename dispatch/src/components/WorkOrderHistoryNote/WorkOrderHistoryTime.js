import moment from 'moment-timezone';
import PropTypes from 'prop-types';

// export type Props = {
//   createdDate: string,
//   timezone: string,
// };

const WorkOrderHistoryTime = (props) => {
  const timez = props.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <p>{moment.utc(props.createdDate).tz(timez).format('hh:mm a')}</p>;
};

WorkOrderHistoryTime.defaultProps = {
  timezone: 'America/Denver',
};

WorkOrderHistoryTime.propTypes = {
  createdDate: PropTypes.string.isRequired,
  timezone: PropTypes.string,
};
export default WorkOrderHistoryTime;
