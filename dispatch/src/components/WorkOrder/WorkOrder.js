/* eslint no-alert: 0 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import cx from 'classnames';
import styled from 'styled-components';
import HibernateGreenPicture from '@root/static/images/hibernate-green.svg';
import Waiting from '@root/static/images/waiting.svg';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

const Text = styled.span`
  margin-bottom: 0;
`;

const SuspendedContainer = styled.div`
  display: flex;
  align-items: center;
  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
`;

const suspendedActions = [
  'DUMP & RETURN SUSPEND',
  'FINAL SUSPEND',
  'SWITCH SUSPEND',
  'LIVE LOAD SUSPEND',
  'DUMP & RETURN RESUME',
  'FINAL RESUME',
  'SWITCH RESUME',
  'LIVE LOAD RESUME',
];

const arrayContains = (action, arrayOfActions) => arrayOfActions.indexOf(action) > -1;

class WorkOrder extends PureComponent {
  static propTypes = {
    data: PropTypes.object.isRequired,
    onDelete: PropTypes.func,
    onClick: PropTypes.func,
    match: PropTypes.object,
    active: PropTypes.bool,
  };

  static defaultProps = {
    data: {},
    active: false,
    onDelete: () => {},
    onClick: () => {},
  };

  onDelete = () => {
    if (confirm('Are you sure?')) {
      this.props.onDelete(this.props.data.id);
    }
  };

  handleClick = () => {
    this.props.onClick(this.props.data);
  };

  render() {
    const { data, active } = this.props;
    let actionType = data.action;
    if (actionType === 'SPOT') {
      actionType = 'DELIVERY';
    }

    return (
      <div
        className={cx('workorder', { 'is-active': active })}
        tabIndex="1"
        onClick={this.handleClick}
      >
        <div className="workorder-body">
          <div className="workorder-details">
            <h3 className="workorder-action">
              {actionType} #{data.id}
            </h3>
            <Text>
              {data.scheduledDate ? ` ${moment(data.scheduledDate).format('MM/DD/YYYY')}` : ''}
              {data.scheduledStart
                ? ` ${moment(data.scheduledStart, 'HH:mm:ss').format('hh:mm a')}`
                : ''}
              {data.scheduledEnd
                ? ` - ${moment(data.scheduledEnd, 'HH:mm:ss').format('hh:mm a')}`
                : ''}
            </Text>
            {arrayContains(data.action, suspendedActions) === true ? <SuspendedContainer>
                <HibernateGreenPicture />
                <span style={{ marginTop: 3 }}>Suspended</span>
              </SuspendedContainer> : null}
            {data.pendingSuspend ? (
              <SuspendedContainer>
                <Waiting />
                <span style={{ marginTop: 3 }}>Pending Suspend</span>
              </SuspendedContainer>
            ) : null}
            {data.suspendRequested ? (
              <SuspendedContainer>
                <Waiting />
                <span style={{ marginTop: 3 }}>Pending Suspend</span>
              </SuspendedContainer>
            ) : null}
          </div>
          <div className="workorder-driver">
            <p style={{ float: 'right', marginLeft: '0' }}>{data.driver.description || ''}</p>
          </div>
          <div className="workorder-actions">
            <div className="btn-group">
              <Link
                className="btn btn__default btn__small"
                to={{
                  pathname: pathToUrl(Paths.WorkOrdersEdit, {
                    businessUnit: this.props.match.params.businessUnit,
                    id: data.id,
                  }),
                  state: { modal: true },
                }}
              >
                <i className="far fa-edit" /> Edit
              </Link>
              <button type="button" onClick={this.onDelete} className="btn btn__default btn__small">
                <i className="far fa-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(WorkOrder);
