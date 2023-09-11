/* eslint-disable react/no-did-update-set-state, react/prop-types */
import { Component } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import { Link, withRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Tooltip } from 'react-tippy';
import { Helmet } from 'react-helmet';
import {
  fetchCans,
  setActiveCan,
  unsetActiveCan,
  resetRefreshCans,
  filterChange,
} from '@root/state/modules/cans';
import { pathToUrl } from '@root/helpers/pathToUrl';
import InventoryMap from '@root/components/InventoryMap';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import { fetchSettingByKey } from '@root/state/modules/settings';
import CansList from '@root/components/CansList';
import { DataList, Wrapper, Page, Aside, Main, Header } from '@root/components/index';
import ActiveCan from '@root/components/ActiveCan';
import FilterForm from '@root/forms/CansFilter';
import { Paths } from '@root/routes/routing';
// import type { UserType, CanType } from 'types/index';

export const cansFetchingInterval = 60000;
export const canFetchingInterval = 15000;

// type Props = {
//   cans: Array<CanType>,
//   filter: Object,
//   dispatch: Function,
//   statuses: $ReadOnlyArray<string>,
//   sizes: $ReadOnlyArray<string>,
//   setting: Object,
//   user: UserType,
//   isLoading: boolean,
//   activeCan: Object | boolean,
//   errorOnTransactionsFetch: boolean,
//   history: History,
//   refreshCans: boolean,
// };

class Inventory extends Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line react/no-unused-class-component-methods
    this.datalist = null;
    this.cans = {};
    this.state = {
      cans: props.cans,
      allCans: props.cans,
    };
  }

  componentDidMount() {
    this.loadComponentData();
    window.addEventListener('refreshMapMarkers', this.refreshMapMarkers);
  }

  // @TODO: deprecated lifecycle method
  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.refreshCans && nextProps.refreshCans) {
      this.props.dispatch(resetRefreshCans());
      this.props
        .dispatch(fetchCans({ businessUnitId: this.props.match.params.businessUnit }, true))
        .then(() => {
          this.setState(
            {
              allCans: this.props.cans,
              cans: this.props.cans,
            },
            () => this.onFilterChange(nextProps.filter),
          );
        });
    }
  }

  componentWillUnmount() {
    if (this.refreshTransactionsTimer) {
      clearInterval(this.refreshTransactionsTimer);
    }
    // removed the persisting behaviour on inventory tab
    this.props.filter.search = '';
    this.props.filter.date.startDate = null;
    this.props.filter.date.endDate = null;
    this.props.filter.status = null;
    this.props.filter.allowNullLocations = null;
    this.props.filter.bounds = null;
    this.props.filter.isOutOfService = null;
    this.props.filter.inUse = null;
    this.props.filter.isRequiredMaintenance = null;
    this.props.filter.hazardous = null;
    this.props.filter.size = '';

    window.removeEventListener('refreshMapMarkers', this.refreshMapMarkers);
  }

  refreshMapMarkers = (e) => {
    this.setState(
      (state) => ({
        allCans: [
          ...state.allCans.filter((can) => can.id !== e.detail.id),
          {
            ...state.allCans.filter((can) => can.id === e.detail.id)[0],
            location: e.detail.location,
          },
        ],
      }),
      () => this.onFilterChange(this.props.filter),
    );
  };

  loadComponentData = () => {
    this.props.dispatch(fetchSettingByKey('map', this.props.match.params.businessUnit));
    this.props
      .dispatch(
        fetchCans(
          {
            ...this.props.filter,
            businessUnitId: this.props.match.params.businessUnit,
          },
          true,
        ),
      )
      .then(() =>
        this.setState({
          cans: this.props.cans.filter((can) => !!can.location.name),
          allCans: this.props.cans,
        }),
      );
    this.props.dispatch(fetchConstantsIfNeeded());
  };

  onPointClick = (can) => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: `Clicked marker for can #"${can.id}"`,
      level: 'info',
      type: 'user',
    });

    this.props.dispatch(setActiveCan(can, true)).then(() => {
      this.scrollTo(can);
    });

    if (this.refreshTransactionsTimer) {
      clearInterval(this.refreshTransactionsTimer);
    }

    this.refreshTransactionsTimer = setInterval(() => {
      this.props.dispatch(setActiveCan(can, false));
    }, canFetchingInterval);
  };

  onCloseActiveCan = () => {
    this.props.dispatch(unsetActiveCan()); // no
    clearInterval(this.refreshTransactionsTimer);
  };

  onBoundsChange = (bounds) => {
    let filteredCans = this.props.cans.filter((can) => {
      const lng =
        (can.location.location.lon - bounds._ne.lng) *
          (can.location.location.lon - bounds._sw.lng) <
        0;
      const lat =
        (can.location.location.lat - bounds._ne.lat) *
          (can.location.location.lat - bounds._sw.lat) <
        0;
      return lng && lat;
    });

    if (this.props.filter.size) {
      filteredCans = filteredCans.filter((can) =>
        this.props.filter.size.split(',').includes(can.size),
      );
    }

    if (this.props.filter.hazardous) {
      filteredCans = filteredCans.filter((can) => !!can.hazardous);
    }

    if (this.props.filter.inUse) {
      filteredCans = filteredCans.filter((can) => !!can.inUse);
    }

    if (this.props.filter.isRequiredMaintenance) {
      filteredCans = filteredCans.filter((can) => !!can.requiresMaintenance);
    }

    if (this.props.filter.isOutOfService) {
      filteredCans = filteredCans.filter((can) => !!can.outOfService);
    }

    if (!this.props.filter.allowNullLocations) {
      filteredCans = filteredCans.filter((can) => !!can.location.name);
    }

    if (this.props.filter.search) {
      filteredCans = filteredCans.filter(
        (can) =>
          (can.location.name &&
            can.location.name.toLowerCase().includes(this.props.filter.search.toLowerCase())) ||
          (can.location.waypointName &&
            can.location.waypointName
              .toLowerCase()
              .includes(this.props.filter.search.toLowerCase())) ||
          can.name.toLowerCase().includes(this.props.filter.search.toLowerCase()),
      );
    }

    if (this.props.filter.date.startDate && this.props.filter.date.endDate) {
      filteredCans = filteredCans.filter(
        (can) =>
          Date.parse(can.startDate) < this.props.filter.date.endDate &&
          Date.parse(can.startDate) > this.props.filter.date.startDate,
      );
    }

    if (this.props.filter.status) {
      filteredCans = filteredCans.filter((can) => can.action === this.props.filter.status);
    }

    if (
      !this.props.filter.size &&
      !this.props.filter.hazardous &&
      !this.props.filter.isRequiredMaintenance &&
      !this.props.filter.isOutOfService &&
      !this.props.filter.inUse &&
      !this.props.filter.allowNullLocations &&
      !this.props.filter.status &&
      !this.props.filter.search &&
      !this.props.filter.date.startDate &&
      !this.props.filter.date.endDate
    ) {
      this.setState({
        cans: this.props.cans.filter((can) => {
          const lng =
            (can.location.location.lon - bounds._ne.lng) *
              (can.location.location.lon - bounds._sw.lng) <
            0;
          const lat =
            (can.location.location.lat - bounds._ne.lat) *
              (can.location.location.lat - bounds._sw.lat) <
            0;
          return lng && lat && !!can.location.name;
        }),
      });
    } else {
      this.setState({
        cans: filteredCans,
      });
    }

    this.props.dispatch(unsetActiveCan()); // no
    clearInterval(this.refreshTransactionsTimer);
  };

  onFilterChange = (filter = {}) => {
    this.props.dispatch(filterChange(filter));
    let filteredCans = this.state.allCans;

    if (filter.size) {
      filteredCans = filteredCans.filter((can) => filter.size.split(',').includes(can.size));
    }

    if (filter.hazardous) {
      filteredCans = filteredCans.filter((can) => !!can.hazardous);
    }

    if (filter.isRequiredMaintenance) {
      filteredCans = filteredCans.filter((can) => !!can.requiresMaintenance);
    }

    if (filter.isOutOfService) {
      filteredCans = filteredCans.filter((can) => !!can.outOfService);
    }

    if (filter.inUse) {
      filteredCans = filteredCans.filter((can) => !!can.inUse);
    }

    if (!filter.allowNullLocations) {
      filteredCans = filteredCans.filter((can) => !!can.location?.name);
    }

    if (filter.search) {
      filteredCans = filteredCans.filter(
        (can) =>
          (can.location.name &&
            can.location.name.toLowerCase().includes(filter.search.toLowerCase())) ||
          (can.location.waypointName &&
            can.location.waypointName.toLowerCase().includes(filter.search.toLowerCase())) ||
          can.name?.toLowerCase().includes(filter.search.toLowerCase()),
      );
    }

    if (filter.date.startDate && filter.date.endDate) {
      filteredCans = filteredCans.filter(
        (can) =>
          Date.parse(can.startDate) < filter.date.endDate &&
          Date.parse(can.startDate) > filter.date.startDate,
      );
    }

    if (filter.status) {
      filteredCans = filteredCans.filter((can) => can.action === filter.status);
    }

    if (
      !filter.size &&
      !filter.hazardous &&
      !filter.isRequiredMaintenance &&
      !filter.isOutOfService &&
      !filter.inUse &&
      !filter.date.startDate &&
      !filter.date.endDate &&
      !filter.allowNullLocations &&
      !filter.status &&
      !filter.search
    ) {
      this.setState((state) => ({
        cans: state.allCans.filter((can) => !!can.location?.name),
      }));
    } else {
      this.setState({
        cans: filteredCans,
      });
    }
    this.props.dispatch(unsetActiveCan()); // no
    clearInterval(this.refreshTransactionsTimer);
  };

  setRefsToCans = (cans) => {
    this.cans = cans;
  };

  onEdit = (canId) => {
    this.props.history.push(
      pathToUrl(`${Paths.InventoryEdit}/info`, {
        businessUnit: this.props.match.params.businessUnit,
        canId,
      }),
    );
  };

  scrollTo({ id }) {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: `Scrolling to can #"${id}"`,
      level: 'info',
      type: 'user',
    });
    // eslint-disable-next-line react/no-find-dom-node
    const canNode = ReactDOM.findDOMNode(this.cans[id]);
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (canNode == null) {
      return;
    }

    // removed smooth scrolling from inventory tab because it was a little weird behind the popup
    // to add back in {behavior: "smooth"}
    canNode.scrollIntoView();
  }

  render() {
    const {
      filter,
      statuses,
      setting,
      sizes,
      user,
      activeCan,
      errorOnTransactionsFetch,
      isLoading,
    } = this.props;

    const shouldDisableDatalist = !!activeCan;
    const IS_READ_ONLY = user.roleId === 4;

    return (
      <Wrapper data-name="inventory-layout">
        <Helmet title="Inventory" />
        <Header>
          <div className="header__column--actions">
            {IS_READ_ONLY ? null : (
              <Link
                className="button button__primary button__lrg"
                style={{ textAlign: 'center' }}
                to={{
                  pathname: pathToUrl(`${Paths.Inventory}/can/create`, {
                    businessUnit: this.props.match.params.businessUnit,
                  }),
                  state: { modal: true },
                }}
              >
                Add a can
              </Link>
            )}
          </div>
        </Header>
        <Page name="inventoryIndex">
          <Main>
            {setting && setting.data ? (
              <InventoryMap
                cans={this.state.cans.filter((can) => !!can.location.name)}
                onBoundsChange={this.onBoundsChange} // onBoundsChange
                onPointClick={this.onPointClick}
                activeCan={activeCan}
                setting={setting}
              />
            ) : null}
          </Main>
          <Aside>
            <header className="aside-header">
              <h1 className="aside-title">Inventory</h1>
              <div className="controls">
                <div className="controls-item">
                  <div className="btn-group">
                    <Tooltip title="Export to CSV" position="top" trigger="mouseenter">
                      <Link
                        className="btn btn__default btn__small export-button"
                        to={{
                          pathname: pathToUrl(`${Paths.Inventory}/export`, {
                            businessUnit: this.props.match.params.businessUnit,
                          }),
                        }}
                      >
                        Export
                      </Link>
                    </Tooltip>
                    <Tooltip title="Import CSV" position="top" trigger="mouseenter">
                      <Link
                        className="btn btn__default btn__small import-button"
                        to={{
                          pathname: pathToUrl(`${Paths.Inventory}/import`, {
                            businessUnit: this.props.match.params.businessUnit,
                          }),
                        }}
                      >
                        Import
                      </Link>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </header>
            <div
              className={cx('filter filter--aside', {
                disabled: isLoading,
              })}
            >
              <FilterForm
                onChange={this.onFilterChange}
                statuses={statuses}
                state={filter}
                sizes={sizes}
              />
            </div>
            <ActiveCan
              activeCan={activeCan}
              errorOnTransactions={errorOnTransactionsFetch}
              onClose={this.onCloseActiveCan}
              onEdit={this.onEdit}
              timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
            />

            <DataList
              ref={(c) => (this.datalist = c)}
              loading={isLoading}
              disabled={shouldDisableDatalist}
            >
              <CansList
                timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
                cans={this.state.cans}
                onClick={this.onPointClick}
                onEdit={this.onEdit}
                setRefsToCans={this.setRefsToCans}
              />
            </DataList>
          </Aside>
        </Page>
      </Wrapper>
    );
  }
}

export default withRouter(Inventory);
