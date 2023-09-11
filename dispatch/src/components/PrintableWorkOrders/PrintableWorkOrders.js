/* eslint-disable no-bitwise */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class PrintableWorkOrders extends PureComponent {
  static propTypes = {
    workOrders: PropTypes.array.isRequired,
    driver: PropTypes.object,
  };

  static defaultProps = {
    workOrders: [],
  };

  renderWorkOrderTables = (workOrders) => {
    const headerStyle = {
      fontWeight: '700',
      fontSize: 'x-small',
      height: '20px',
      padding: '0 4px 0 4px',
      verticalAlign: 'bottom',
      paddingTop: '10px',
    };
    const innerStyle = {
      height: '20px',
      padding: '4px',
      border: '1px solid black',
      fontSize: 'xx-small',
    };
    return workOrders.map((workOrder) => (
      <div key={workOrder.id}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td className="cell-title">WO #</td>
              <td className="cell-title">DRIVER NAME</td>
              <td className="cell-title">CAN SIZE</td>
              <td className="cell-title">TYPE</td>
              <td className="cell-title">LOCATION 1</td>
            </tr>
            <tr>
              <td style={innerStyle}>{workOrder.id}</td>
              <td style={innerStyle}>
                {(this.props.driver && this.props.driver.description) ||
                  (workOrder.driver && workOrder.driver.description) ||
                  'UNASSIGNED'}
              </td>
              <td style={innerStyle}>{workOrder.size}</td>
              <td style={innerStyle}>{workOrder.action}</td>
              <td style={innerStyle}>
                {workOrder.location1.waypointName
                  ? workOrder.location1.waypointName
                  : workOrder.location1.name}
              </td>
            </tr>
            <tr>
              <td style={headerStyle}>CLIENT NAME</td>
              <td style={headerStyle}>CONTACT NAME</td>
              <td style={headerStyle}>CONTACT PHONE</td>
              <td style={headerStyle}>MATERIAL</td>
              <td style={headerStyle}>LOCATION 2</td>
            </tr>
            <tr>
              <td style={innerStyle}>{workOrder.customerName}</td>
              <td style={innerStyle}>{workOrder.contactName}</td>
              <td style={innerStyle}>{workOrder.contactNumber}</td>
              <td style={innerStyle}>{workOrder.material}</td>
              <td style={innerStyle}>
                {workOrder.location2.waypointName
                  ? workOrder.location2.waypointName
                  : workOrder.location2.name}
              </td>
            </tr>
            <tr>
              <td style={headerStyle}>Call on way</td>
              <td style={headerStyle}>SOS</td>
              <td style={headerStyle}>Alley Placement</td>
              <td style={headerStyle}>Permitted Can</td>
              <td style={headerStyle}>Allow Early Pickup</td>
            </tr>
            <tr>
              <td style={innerStyle}>{workOrder.cow ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.sos ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.alleyPlacement ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.permittedCan ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.earlyPickUp ? 'YES' : 'NO'}</td>
            </tr>
            <tr>
              <td style={headerStyle}>Cab Over</td>
              <td style={headerStyle}>OK To Roll</td>
              <td style={headerStyle}>Priority</td>
              <td style={headerStyle}>Scheduled Date</td>
              <td style={headerStyle}>Scheduled Time</td>
            </tr>
            <tr>
              <td style={innerStyle}>{workOrder.cabOver ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.okToRoll ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.priority ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>
                {workOrder.scheduledDate ? workOrder.scheduledDate | { date: 'MM/dd/yyyy' } : 'NO'}
              </td>
              <td style={innerStyle}>
                {workOrder.scheduledStart ? workOrder.scheduledStart | { date: 'hh:mm' } : 'NO'}
                <span>-</span>
                {workOrder.scheduledEnd ? workOrder.scheduledEnd | { date: 'hh:mm' } : 'NO'}
              </td>
            </tr>
            <tr>
              <td style={headerStyle}>Negotiated Fill</td>
              <td style={headerStyle}>Profile #</td>
              <td style={headerStyle} colSpan="3">
                INSTRUCTIONS
              </td>
            </tr>
            <tr>
              <td style={innerStyle}>{workOrder.negotiatedFill ? 'YES' : 'NO'}</td>
              <td style={innerStyle}>{workOrder.customerProvidedProfile ? 'YES' : 'NO'}</td>
              <td colSpan="3" style={innerStyle}>
                {workOrder.instructions}
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ height: '30px', borderBottom: '5px dotted black' }} />
        <div style={{ height: '10px' }} />
      </div>
    ));
  };

  render() {
    if (!this.props.workOrders.length) {
      return null;
    }
    return (
      <div className="print">
        <style type="text/css">
          {
            '@media print{@page {size: landscape} .cell-title {font-size: x-small; font-weight: 700; height: 10px; padding: 0 4px 0 4px;}'
          }
        </style>
        {this.renderWorkOrderTables(this.props.workOrders)}
      </div>
    );
  }
}

export default PrintableWorkOrders;
