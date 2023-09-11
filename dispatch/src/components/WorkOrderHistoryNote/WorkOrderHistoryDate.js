import moment from 'moment';
import PropTypes from 'prop-types';

const WorkOrderHistoryDate = (props) => {
  const { createdDate } = props;
  return <p>{moment(createdDate).format('MM/DD/YYYY')}</p>;
};

WorkOrderHistoryDate.propTypes = {
  createdDate: PropTypes.string.isRequired,
};
export default WorkOrderHistoryDate;
