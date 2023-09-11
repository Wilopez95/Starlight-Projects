import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-regular-svg-icons/faPlus';
import PropTypes from 'prop-types';

const iconStyle = {
  fontSize: '28px',
  width: '30px',
  position: 'relative',
  top: '5px',
  right: '-40px',
  border: '1px solid rgb(186, 186, 186)',
  padding: '4px',
  borderRadius: '50%',
  backgroundColor: '#6fce1b',
  color: 'white',
};
const listViewStyle = {
  borderBottom: '1px solid #888',
  cursor: 'pointer',
  padding: 0,
};
const photoStyle = {
  paddingTop: 0,
  verticalAlign: 'middle',
  justifyContent: 'center',
  marginRight: '1em',
};
const contentStyle = {
  verticalAlign: 'middle',
  paddingTop: 0,
  justifyContent: 'center',
};
// type Props = {
//   driver: DriverType,
//   onClickAddDriver: DriverType => void,
// };

export default function AddDriversDriver({ driver, onClickAddDriver }) {
  const handleAddDriver = () => {
    onClickAddDriver(driver);
  };
  return (
    <li
      className="listview-content"
      key={driver.id}
      style={listViewStyle}
      onClick={handleAddDriver}
    >
      <div className="driver">
        <div className="driver-photo" style={photoStyle}>
          <img src={driver.photoUrl || 'https://cdn.starlightpro.com/img/noPhoto.png'} />
        </div>
        <div className="driver-content" style={contentStyle}>
          <h4 id="dr-name" className="driver-name">
            {driver.description}
          </h4>
        </div>
        <FontAwesomeIcon icon={faPlus} style={iconStyle} />
      </div>
    </li>
  );
}
AddDriversDriver.propTypes = {
  driver: PropTypes.object.isRequired,
  onClickAddDriver: PropTypes.func.isRequired,
};
