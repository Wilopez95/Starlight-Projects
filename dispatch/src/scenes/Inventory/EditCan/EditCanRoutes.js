/* eslint-disable react/prop-types */
/* eslint-disable react/no-did-mount-set-state */
import { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Route, withRouter } from 'react-router-dom';
import cn from 'classnames';
import { stringLabelValueExtractor } from '@root/utils/stringLabelValueExtractor';
import {
  fetchTrucksIfNeeded,
  selectTrucks,
  selectWaypoints,
  fetchWaypointsIfNeeded,
} from '@root/state/modules/locations';
import { fetchConstants } from '@root/state/modules/constants';
import {
  fetchCans,
  createCanNote,
  fetchCan,
  transferCan,
  pickUpCan,
  dropOffCan,
  moveCan,
} from '@root/state/modules/cans';
// import type {
//   CanType,
//   SizeType,
//   LocationType,
//   Params,
//   WorkOrderNoteType,
// } from 'types/index';
import { pathToUrl } from '@root/helpers/pathToUrl';

import { Paths } from '@root/routes/routing';

import FormEditCan from '@root/forms/EditCan';
import FormEditCanNotes from '@root/forms/EditCanNotes';
import FormEditActions from './EditCanActions';

// type MatchParams = {
//   url: string,
//   params: {
//     canId: number,
//   },
// };
// type Props = {
//   can: CanType,
//   filter: Object,
//   sizes: Array<SizeType>,
//   children: React.Node,
//   history: BrowserHistory,
//   match: MatchParams,
//   setting: Object,
//   truckOpts: Array<Params>,
//   trucks: Array<LocationType>,
//   waypoints: Array<LocationType>,
//   fetchTrucks: () => Array<LocationType>,
//   fetchConstants: () => void,
//   fetchCan: (id: number) => CanType,
//   fetchCans: Object => Array<CanType>,
//   fetchTrucksIfNeeded: () => void,
//   transferCan: (id: number, truck: LocationType) => void,
//   pickUpCan: (id: number, truck: LocationType) => void,
//   moveCan: (id: number, truck: LocationType) => void,
//   dropOffCan: (id: number, location: LocationType) => void,
//   createCanNote: (id: number, note: WorkOrderNoteType) => void,
//   fetchWaypointsIfNeeded: () => void,
// };

export class EditCanRoutes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetchCanError: null,
      loading: true,
    };
  }

  async componentDidMount() {
    const {
      sizes,
      match: {
        params: { canId },
      },
    } = this.props;
    this.props.fetchTrucksIfNeeded({
      businessUnitId: this.props.match.params.businessUnit,
    });
    this.props.fetchWaypointsIfNeeded();
    const isEmptySizes = sizes.length === 0;

    if (isEmptySizes) {
      await this.props.fetchConstants();
    }

    try {
      await this.props.fetchCan(canId);
    } catch (error) {
      this.setState({ fetchCanError: error.message });
    }
    this.setState({ loading: false });
  }

  close = () => {
    this.props.fetchCans({});
    this.props.history.push(
      pathToUrl(`${Paths.Inventory}`, {
        businessUnit: this.props.match.params.businessUnit,
      }),
    );
  };

  handleSubmitTransferCan = (id, truck) => {
    this.props.transferCan(id, truck);
    const event = new CustomEvent('refreshMapMarkers', {
      detail: {
        id,
        location: truck,
      },
    });
    window.dispatchEvent(event);
  };

  handleSubmitPickUpCan = (id, truck) => {
    this.props.pickUpCan(id, truck);
    const event = new CustomEvent('refreshMapMarkers', {
      detail: {
        id,
        location: truck,
      },
    });
    window.dispatchEvent(event);
  };

  handleSubmitMoveCan = (id, truck) => {
    this.props.moveCan(id, truck);
    const event = new CustomEvent('refreshMapMarkers', {
      detail: {
        id,
        location: truck,
      },
    });
    window.dispatchEvent(event);
  };

  handleSubmitDropOffCan = (id, location) => {
    this.props.dropOffCan(id, location);
    const event = new CustomEvent('refreshMapMarkers', {
      detail: {
        id,
        location,
      },
    });
    window.dispatchEvent(event);
  };

  handleSubmitCreateCanNote = (id, note) => {
    this.props.createCanNote(id, note);
  };

  renderChildren() {
    const { can, sizes, filter } = this.props;

    return (
      <>
        <Route
          path={`${Paths.InventoryEdit}/info`}
          render={(props) => (
            <FormEditCan
              {...props}
              can={can}
              sizes={sizes}
              filter={filter}
              onDismiss={this.close}
              onSuccessSubmit={this.close}
              waypoints={this.props.waypoints}
            />
          )}
          exact
        />
        <Route
          path={`${Paths.InventoryEdit}/actions`}
          render={(props) => (
            <FormEditActions
              {...props}
              can={can}
              sizes={sizes}
              setting={this.props.setting}
              onDismiss={this.close}
              onSubmitTransferCan={this.handleSubmitTransferCan}
              onSubmitPickUpCan={this.handleSubmitPickUpCan}
              onSubmitMoveCan={this.handleSubmitMoveCan}
              onSubmitDropOffCan={this.handleSubmitDropOffCan}
              onSuccessSubmit={this.close}
              truckOpts={this.props.truckOpts}
              trucks={this.props.trucks}
              waypoints={this.props.waypoints}
            />
          )}
        />
        <Route
          path={`${Paths.InventoryEdit}/notes`}
          render={(props) => (
            <FormEditCanNotes
              {...props}
              can={can}
              onDismiss={this.close}
              onSuccessSubmit={this.close}
              onSubmitCreateCanNote={this.handleSubmitCreateCanNote}
            />
          )}
        />
      </>
    );
  }

  render() {
    const {
      match: {
        params: { canId },
      },
    } = this.props;

    return (
      <div className={cn('router-popup')}>
        <div className="router-popup--inner">
          <header className="router-popup--header">
            <h2 className="router-popup--title">Edit can</h2>
            <nav className="router-popup--nav">
              <NavLink
                to={{
                  pathname: pathToUrl(`${Paths.InventoryEdit}/info`, {
                    businessUnit: this.props.match.params.businessUnit,
                    canId,
                  }),
                }}
                className="router-popup--nav-item"
                activeClassName="router-popup--nav-item--active"
              >
                Info
              </NavLink>
              <NavLink
                to={{
                  pathname: pathToUrl(`${Paths.InventoryEdit}/actions`, {
                    businessUnit: this.props.match.params.businessUnit,
                    canId,
                  }),
                }}
                className="router-popup--nav-item"
                activeClassName="router-popup--nav-item--active"
              >
                Actions
              </NavLink>
              <NavLink
                to={{
                  pathname: pathToUrl(`${Paths.InventoryEdit}/notes`, {
                    businessUnit: this.props.match.params.businessUnit,
                    canId,
                  }),
                }}
                className="router-popup--nav-item"
                activeClassName="router-popup--nav-item--active"
              >
                Notes
              </NavLink>
            </nav>
          </header>
          <div className="router-popup--body">
            {this.state.loading && !this.state.fetchCanError ? <p>Loading...</p> : null}
            {this.state.fetchCanError ? <p className="error">{this.state.fetchCanError}</p> : null}
            {!this.state.loading && !this.state.fetchCanError ? this.renderChildren() : null}
          </div>
          <button className="router-popup--close" type="button" onClick={this.close} />
        </div>
      </div>
    );
  }
}

const labelAndValueTruckExtractor = (truck) => ({
  label: truck.description,
  value: truck.id,
});

const mapStateToProps = (state) => ({
  can: state.cans.current,
  sizes: state.constants.can.size.map(stringLabelValueExtractor),
  filter: state.cans.filter,
  setting: state.setting,
  trucks: selectTrucks(state),
  truckOpts: selectTrucks(state).map(labelAndValueTruckExtractor),
  waypoints: selectWaypoints(state),
});

const mapDispatchToProps = (dispatch) => ({
  transferCan: (id, truck) => dispatch(transferCan(id, truck)),
  pickUpCan: (id, truck) => dispatch(pickUpCan(id, truck)),
  fetchCans: (filter) => dispatch(fetchCans(filter)),
  fetchCan: (id) => dispatch(fetchCan(id)),
  fetchConstants: () => dispatch(fetchConstants()),
  fetchTrucksIfNeeded: (params) => dispatch(fetchTrucksIfNeeded(params)),
  dropOffCan: (id, location) => dispatch(dropOffCan(id, location)),
  moveCan: (id, location) => dispatch(moveCan(id, location)),
  createCanNote: (id, note) => dispatch(createCanNote(id, note)),
  fetchWaypointsIfNeeded: () => dispatch(fetchWaypointsIfNeeded()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditCanRoutes));
