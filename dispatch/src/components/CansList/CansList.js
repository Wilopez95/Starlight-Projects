/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import * as R from 'ramda';
import moment from 'moment';
import { stableSort } from '@root/utils/stableSort';
import Can from '../Can';

export const sortCans = R.comparator((a, b) => {
  const momentA = moment(a.timestamp);
  const momentB = moment(b.timestamp);
  return momentA.isAfter(momentB);
});

// export type Props = {
//   onClick?: Function,
//   setRefsToCans?: Function,
//   cans?: Array<any>,
//   timezone?: string,
// };
class CansList extends PureComponent {
  static defaultProps = {
    cans: {},
    onClick: () => {},
    setRefsToCans: () => {},
    timezone: 'America/Denver',
  };

  constructor(props) {
    super(props);
    this.cans = {};
  }

  componentDidMount() {
    this.props.setRefsToCans(this.cans);
  }

  componentDidUpdate() {
    this.props.setRefsToCans(this.cans);
  }

  handleCanClick = (data) => {
    this.props.onClick(data);
  };

  render() {
    const { cans } = this.props;

    return (
      <div>
        {stableSort(cans, sortCans).map((item) => (
          <Can
            wrappedComponentRef={(c) => (this.cans[item.id] = c)}
            key={item.id}
            data={item}
            onClick={this.handleCanClick}
            timezone={this.props.timezone}
          />
        ))}
      </div>
    );
  }
}

export default CansList;
