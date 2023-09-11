/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { Tooltip } from 'react-tippy';
import moment from 'moment-timezone';
import { Link, withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { pathToUrl } from '@root/helpers/pathToUrl';

import { Paths } from '@root/routes/routing';
import StatusBrokenPicture from '../../static/images/status--broken.svg';
import StatusServicePicture from '../../static/images/status--service.svg';
import HibernateGreenPicture from '../../static/images/hibernate-green.svg';

// export type Props = {
//   onClick?: Function,
//   data?: Object,
//   timezone?: string,
// };

const IconWrapper = styled.div`
  svg {
    width: 16px;
    height: 16px;
  }
`;
class Can extends PureComponent {
  static defaultProps = {
    data: {},
    timezone: '',
  };

  handleClick = () => {
    const { data } = this.props;
    this.props.onClick(data);
  };

  render() {
    const { data} = this.props;

    return (
      <div className="can">
        <div className="can-body" onClick={this.handleClick}>
          <div className="can-number">
            Can <span>{data.name}</span>
          </div>
          <div className="can-activity">
            <p className="activity-details">
              {moment
                .utc(data.timestamp)
                .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                .format('MM/DD/YYYY hh:mm a')}
            </p>
            <p className="activity-location">
              {data?.truck?.description
                ? `at ${data.truck.description}`
                : data.location.description || data.location.name
                ? data.location.description || data.location.name
                : 'Unknown Location'}
            </p>
          </div>
          <div className="can-statuses">
            <ul className="statuses-list">
              {data.inUse ? (
                <li className="statuses-item">
                  <IconWrapper>
                    <Tooltip
                      title="Suspended"
                      position="top"
                      trigger="mouseenter"
                      hideOnClick="true"
                    >
                      <HibernateGreenPicture />
                    </Tooltip>
                  </IconWrapper>
                </li>
              ) : null}
              {data.requiresMaintenance ? (
                <li className="statuses-item">
                  <Tooltip
                    title="Requires Maintenance"
                    position="top"
                    trigger="mouseenter"
                    hideOnClick="true"
                  >
                    <StatusBrokenPicture />
                  </Tooltip>
                </li>
              ) : null}

              {data.outOfService ? (
                <li className="statuses-item">
                  <Tooltip
                    title="Out of Service"
                    position="top"
                    trigger="mouseenter"
                    hideOnClick="true"
                  >
                    <StatusServicePicture />
                  </Tooltip>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="can-actions">
            <Link
              to={{
                pathname: pathToUrl(`${Paths.InventoryEdit}/info`, {
                  businessUnit: this.props.match.params.businessUnit,
                  canId: data.id,
                }),
                state: { modal: true },
              }}
              className="btn btn__default btn__small"
            >
              <i className="far fa-edit" /> Edit
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(Can);
