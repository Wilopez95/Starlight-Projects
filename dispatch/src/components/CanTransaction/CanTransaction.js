/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import uniqueId from 'lodash/uniqueId';
import moment from 'moment-timezone';

// export type Props = { data: Object, timezone: string };

class CanTransaction extends PureComponent {
  renderNote(data) {
    const { payload } = data;
    const picturesArray = Array.isArray(payload.pictures);

    data.pictures = picturesArray
      ? payload.pictures.map((picture) => ({
          id: uniqueId(),
          picture,
        })) : []

    data.desc = payload.text || '';

    return (
      <li className="can-transactions-item">
        <span className="can-transactions-time">
          {moment
            .utc(data.timestamp)
            .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
            .format('MM/DD/YYYY hh:mm a')}{' '}
          -{' '}
        </span>
        <span className="can-transactions-type">
          {data.action}
          {data.desc ? ': ' : ''}
        </span>
        <span className="can-transactions-desc">{data.desc}</span>
        <ul className="can-transactions-images">
          {data.pictures.map((picture) => (
            <li key={picture.id}>
              <div className="preview" style={{ backgroundImage: `url(${picture.picture})` }} />
            </li>
          ))}
        </ul>
      </li>
    );
  }

  renderTransaction(data) {
    data.desc =
      data.location2.description || data.location2.name
        ? `at ${data.location2.description || data.location2.name}`
        : '';

    return (
      <li className="can-transactions-item">
        <span className="can-transactions-time">
          {moment
            .utc(data.timestamp)
            .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
            .format('MM/DD/YYYY hh:mm a')}{' '}
          -{' '}
        </span>
        <span className="can-transactions-type">
          {data.action}
          {data.desc ? ': ' : ''}
        </span>
        <span className="can-transactions-desc">{data.desc}</span>
      </li>
    );
  }

  render() {
    const { data } = this.props;

    return data.action === 'NOTE' ? this.renderNote(data) : this.renderTransaction(data);
  }
}

export default CanTransaction;
