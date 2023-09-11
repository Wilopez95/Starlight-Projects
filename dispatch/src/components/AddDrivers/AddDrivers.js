import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faSearch } from '@fortawesome/pro-regular-svg-icons';
import { addDriver, setFilteredDrivers } from '@root/state/modules/drivers';
import AddDriversDriver from '@root/components/AddDriversDriver';

const borderStyle = '1px solid #888';
const minusStyle = {
  fontSize: '28px',
  border: '1px solid rgb(186, 186, 186)',
  padding: '4px',
  borderRadius: '4px',
};

const listViewFilterStyle = {
  borderBottom: borderStyle,
  borderTop: borderStyle,
};
const searchStyle = {
  fontSize: '20px',
  color: '#aaa',
  right: '-27px',
};

class AddDrivers extends Component {
  static propTypes = {
    drivers: PropTypes.object.isRequired,
    toggleAddDrivers: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    searchValue: '',
  };

  componentDidMount() {
    this.props.dispatch(setFilteredDrivers(this.props.drivers.unadded));
  }

  handleSearch = (event) => {
    this.props.dispatch(
      setFilteredDrivers(
        this.props.drivers.unadded.filter((driver) =>
          driver.description.toLowerCase().includes(event.target.value.toLowerCase()),
        ),
      ),
    );
    this.setState({
      searchValue: event.target.value,
    });
  };

  handleClickAddDriver = (driver) => {
    this.props.dispatch(addDriver(driver));
    // this.props.force({}, true, false, false, false);
  };

  render() {
    return (
      <div id="newDrivers">
        <ul className="listview">
          <li className="listview-header">
            <div className="listview-header-action">
              <span className="hover">
                <FontAwesomeIcon
                  icon={faMinus}
                  style={minusStyle}
                  onClick={this.props.toggleAddDrivers}
                  className="hoverBorder"
                />
              </span>
            </div>
            <div className="listview-header-title">DRIVERS LIST</div>
            <div className="listview-header-action" />
          </li>
          <li className="listview-filter" style={listViewFilterStyle}>
            <FontAwesomeIcon icon={faSearch} style={searchStyle} className="listview-filter-icon" />
            <input
              type="text"
              value={this.state.searchValue}
              id="searchText"
              placeholder="Search"
              onChange={this.handleSearch}
            />
          </li>
          {this.props.drivers.filtered.map((driver) => (
            <AddDriversDriver
              key={driver.id}
              driver={driver}
              onClickAddDriver={this.handleClickAddDriver}
            />
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  drivers: state.drivers,
});

export default connect(mapStateToProps)(AddDrivers);
