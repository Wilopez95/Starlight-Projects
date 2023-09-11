/* eslint-disable react/prop-types */
/* eslint-disable array-callback-return */

import { memo, Component } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import Media from 'react-media';
import { Tooltip } from 'react-tippy';
import { Helmet } from 'react-helmet';
import { Header } from '@root/components/Layout';

import CanSizeByLocation from '@root/scenes/InventoryBoard/components/CanSizeByLocation';
import HaulsTable from '@root/scenes/InventoryBoard/components/HaulsTable';
import { Paths } from '@root/routes/routing';
import { pathToUrl } from '@root/helpers/pathToUrl';

const MarginDiv = styled.div`
  margin-right: 1em;
  margin-left: 1em;
`;

const Title = styled.h1`
  font-size: 2em;
`;
const clickToHide = {
  border: 'none',
  backgroundColor: 'transparent',
  color: 'white',
  margin: '7px',
  fontSize: '18px',
  width: '36.5px',
};

const REFRESH_INTERVAL = 60000 * 2;

const UPDATE_INTERVAL = 120000 * 60 * 30;

// type Props = {
//   fetchConstantsIfNeeded: () => void,
//   fetchCansAtWaypoints: () => void,
//   fetchCansOnTrucks: () => void,
//   fetchHauls: () => void,
//   user: UserType,
//   canSizes: Array<string>,
//   workorders: $ReadOnlyArray<Object>,
//   currentInventory: $ReadOnlyArray<Object>,
//   endingInventory: $ReadOnlyArray<Object>,
//   tallyOnTruckSizes: Object,
//   finals: $ReadOnlyArray<Object>,
//   cansOnTrucksTally: Object,
//   totalPerSizeMapping: Object,
//   tallySizes: Object,
// };

// type State = {
//   time: string,
//   isHidden: boolean,
//   today: string,
//   tomorrow: string,
//   thirdDay: string,
//   fourthDay: string,
//   nextDayLabel: string,
//   lastDayLabel: string,
// };

class InventoryBoardLayout extends Component {
  static displayName = 'InventoryBoardLayout';

  constructor(props) {
    super(props);
    this.state = {
      time: moment().format('hh:mm:ss A'),
      isHidden: false,
      today: '',
      tomorrow: '',
      thirdDay: '',
      fourthDay: '',
      nextDayLabel: '',
      lastDayLabel: '',
      totalPerSizeMapping: {},
    };
  }

  componentDidMount() {
    // generate the labels for today, tomorrow, the next day,
    // and the day after. Must be initially called here, then
    // put on an interval as people will leave this open all the time
    this.makeDayLabels();
    Promise.all([
      this.props.fetchConstantsIfNeeded(),
      this.props.fetchCansAtWaypoints(),
      this.props.fetchCansOnTrucks(this.props.match.params.businessUnit),
      this.props.fetchHauls(),
    ]);
    this.setMapping();
    this.daysInterval = setInterval(() => {
      this.makeDayLabels();
    }, UPDATE_INTERVAL);

    this.intervalCans = setInterval(() => this.props.fetchHauls(), REFRESH_INTERVAL);

    this.interval = setInterval(() => this.tick(), REFRESH_INTERVAL);

    this.intervalCansAtWaypoints = setInterval(
      () => this.props.fetchCansAtWaypoints(),
      REFRESH_INTERVAL,
    );

    this.intervalCansOnTrucks = setInterval(
      () => this.props.fetchCansOnTrucks(this.props.match.params.businessUnit),
      REFRESH_INTERVAL,
    );
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.tallySizes !== prevProps.tallySizes ||
      this.props.cansOnTrucksTally !== prevProps.cansOnTrucksTally
    ) {
      this.setMapping();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.daysInterval);
    clearInterval(this.intervalCansAtWaypoints);
    clearInterval(this.intervalCansOnTrucks);
    clearInterval(this.intervalCans);
  }

  interval;

  daysInterval;

  intervalCansAtWaypoints;

  intervalCansOnTrucks;

  intervalCans;

  tick() {
    this.setState(() => ({
      time: moment().format('hh:mm:ss A'),
    }));
  }

  toggleHidden = () => {
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
    }));
  };

  setMapping = () => {
    const totalPerSizeMapping = this.props.canSizes.reduce((aggregator, size) => {
      /**
       * tallySizes is total cans at each waypoint
       * @example from 5280
       *   "tallySizes": {
       *   "Foothills Landfill": {
       *     "10": 2,
       *     "12": 4,
       *     ...
       *   }
       * }
       * */
      const totalForCurrentSize = Object.keys(this.props.tallySizes || {}).reduce(
        // eslint-disable-next-line consistent-return
        (countAggregator, waypointName) => {
          if (waypointName !== 'Me Electral') {
            return countAggregator + (this.props.tallySizes[waypointName][size] || 0);
          }
        },
        0,
      );

      const totalForCurrentSizeOnTrucks = Object.keys(this.props.cansOnTrucksTally || {}).reduce(
        (countAggregator, scheduledDate) =>
          countAggregator + (this.props.cansOnTrucksTally[scheduledDate][size] || 0),
        0,
      );

      aggregator[size] = totalForCurrentSize + totalForCurrentSizeOnTrucks;

      return aggregator;
    }, {});
    this.setState(() => ({
      totalPerSizeMapping,
    }));
  };

  makeDayLabels() {
    // get today
    const currentDate = new Date();
    // format today YYYY-MM-DD
    const today = moment(currentDate).format('YYYY-MM-DD');
    // add 1 day to today and format YYYY-MM-DD
    const tomorrow = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
    // add 2 days to today and format YYYY-MM-DD
    const thirdDay = moment(currentDate).add(2, 'days').format('YYYY-MM-DD');
    const fourthDay = moment(currentDate).add(3, 'days').format('YYYY-MM-DD');

    const nextDayFormat = moment(currentDate).add(2, 'days').format('dddd');
    const lastDayFormat = moment(currentDate).add(3, 'days').format('dddd');

    this.setState(() => ({
      today,
      tomorrow,
      thirdDay,
      fourthDay,
      nextDayLabel: nextDayFormat,
      lastDayLabel: lastDayFormat,
    }));
  }

  render() {
    const { canSizes } = this.props;
    const { totalPerSizeMapping } = this.state;
    return (
      // <Wrapper style={{marginLeft: '4% !important', marginRight: '4% !important', marginBottom: '4%'}}>
      <div
        style={{
          marginLeft: '2%',
          marginRight: '2%',
          marginBottom: '3%',
          padding: '0',
          position: 'relative',
        }}
      >
        <Helmet title="Inventory Board" />
        {!this.state.isHidden && !this.props.location?.pathname.includes('configuration') ? <Header>
            <div className="scroll header__column--actions">
              <Link
                className="button button__primary button__lrg"
                to={{
                  pathname: pathToUrl(`${Paths.WorkOrders}/create`, {
                    businessUnit: this.props.match.params.businessUnit,
                  }),
                }}
              >
                Create work order
              </Link>
            </div>
          </Header> : null}

        <div className="page page--inventoryIndex">
          <MarginDiv>
            <div className="row ib-title-style">
              <Media query={{ maxWidth: 599 }}>
                {(matches) =>
                  matches ? (
                    <>
                      <div className="col-6">
                        <h1 style={{ fontSize: '0.75rem' }}>Inventory Board</h1>
                      </div>
                      <div className="col-6" style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                        Last Updated: {this.state.time}{' '}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-6">
                        <Title>
                          Inventory Board
                          <button onClick={this.toggleHidden} style={clickToHide} type="button">
                            <Tooltip
                              title="TV view (hide navbar)"
                              position="top"
                              trigger="mouseenter"
                            >
                              <i className="fas fa-tv" />
                            </Tooltip>
                          </button>
                        </Title>
                      </div>
                      <div className="col-6" style={{ textAlign: 'right', fontSize: '1.2em' }}>
                        Last Updated: {this.state.time} <br />
                      </div>
                    </>
                  )
                }
              </Media>
            </div>
            <div className="row">
              <div className="col-12 col-md-7 order-md-0 order-sm-last order-xs-last">
                <HaulsTable
                  allCans={canSizes}
                  workorders={this.props.workorders}
                  currentInventory={this.props.currentInventory}
                  endingInventory={this.props.endingInventory}
                  tallyOnTruckSizes={this.props.tallyOnTruckSizes}
                  totalPerSizeMapping={totalPerSizeMapping}
                  finals={this.props.finals}
                  today={this.state.today}
                  tomorrow={this.state.tomorrow}
                  thirdDay={this.state.thirdDay}
                  fourthDay={this.state.fourthDay}
                  nextDayLabel={this.state.nextDayLabel}
                  lastDayLabel={this.state.lastDayLabel}
                />
              </div>
              <div className="col-12 col-md-5 order-first order-md-12">
                <CanSizeByLocation
                  allCans={canSizes}
                  cansOnTrucksTally={this.props.cansOnTrucksTally}
                  totalPerSizeMapping={totalPerSizeMapping}
                  tallySizes={this.props.tallySizes}
                />
              </div>
            </div>
          </MarginDiv>
        </div>
      </div>
    );
  }
}

export default withRouter(memo(InventoryBoardLayout));
