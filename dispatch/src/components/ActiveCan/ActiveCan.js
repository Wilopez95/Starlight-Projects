/* eslint-disable react/prop-types */
import { PureComponent } from 'react';
import moment from 'moment-timezone';
import onClickOutside from 'react-onclickoutside';
import styled from 'styled-components';
import CanTransaction from '@root/components/CanTransaction';
import StatusBrokenPicture from '../../static/images/status--broken.svg';
import StatusServicePicture from '../../static/images/status--service.svg';
import HibernateGreenPicture from '../../static/images/hibernate-green.svg';

// export type Props = {
//   onEdit: number => void,
//   onClose: Function,
//   errorOnTransactions?: boolean,
//   activeCan: CanType | boolean,
//   timezone?: string,
// };
const IconWrapper = styled.div`
  svg {
    width: 16px;
    height: 16px;
  }
`;
export class ActiveCan extends PureComponent {
  static defaultProps = {
    activeCan: {},
    errorOnTransactions: false,
    timezone: 'America/Denver',
  };

  handleClickOutside() {
    const { activeCan } = this.props;
    if (activeCan) {
      this.props.onClose();
    }
  }

  onEdit = () => {
    const { activeCan } = this.props;
    this.props.onEdit(activeCan.id);
  };

  render() {
    // debugger;
    const { activeCan, errorOnTransactions } = this.props;
    const isTransactionsLoading = activeCan && !activeCan.transactions;
    const transactions = (activeCan && activeCan.transactions) || [];
    const isTransactionsEmpty = transactions.length > 0 && transactions[0].id !== null;

    const transactionsStatus = errorOnTransactions ? (
      <span className="status-message error-message">The fetch transactions request failed</span>
    ) : (
      isTransactionsLoading && <span className="status-message">Loading transactions</span>
    );

    const transactionSection = isTransactionsEmpty ? (
      <ul className="can-transactions-list">
        {transactions.map((transaction) => (
          <CanTransaction key={transaction.id} timezone={this.props.timezone} data={transaction} />
        ))}
      </ul>
    ) : (
      <span className="status-message">There are no transactions yet</span>
    );

    const transactionsContainer = transactionsStatus || transactionSection;

    const activeCanTransactions = (
      <div className="can-footer">
        <div className="can-transactions">{transactionsContainer}</div>
      </div>
    );
    return (
      <div>
        {activeCan ? (
          <div className="can active-can-popup">
            <div className="can-body popup-body">
              <div className="can-number">
                Can <span>{activeCan.name}</span>
              </div>
              <div className="can-activity">
                <p className="activity-details">
                  {moment
                    .utc(activeCan.timestamp)
                    .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                    .format('MM/DD/YYYY hh:mm a')}{' '}
                  {activeCan.action}
                </p>
                <p className="activity-location">
                  {activeCan?.truck?.description ||
                  activeCan.location?.description ||
                  activeCan.location?.name
                    ? `at ${
                        activeCan?.truck?.description ||
                        activeCan.location?.description ||
                        activeCan.location.name
                      }`
                    : 'Unknown Location'}
                </p>
              </div>
              <div className="can-statuses">
                <ul className="statuses-list">
                  {activeCan.inUse ? (
                    <li className="statuses-item">
                      <IconWrapper>
                        <HibernateGreenPicture />
                      </IconWrapper>
                    </li>
                  ) : null}
                  {activeCan.requiresMaintenance ? (
                    <li className="statuses-item">
                      <StatusBrokenPicture />
                    </li>
                  ) : null}
                  {activeCan.outOfService ? (
                    <li className="statuses-item">
                      <StatusServicePicture />
                    </li>
                  ) : null}
                </ul>
              </div>
              <div className="can-actions">
                <button
                  className="btn btn__default btn__small"
                  onClick={this.onEdit}
                  type="button"
                  name="button"
                >
                  <i className="far fa-edit" /> Edit
                </button>
              </div>
            </div>
            <div className="transactions-block">{activeCanTransactions}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default onClickOutside(ActiveCan);
