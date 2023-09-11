/* eslint-disable consistent-return */
/* eslint-disable react/no-did-mount-set-state, camelcase, react/prop-types */
import { Component } from 'react';
import mapboxgl from '@starlightpro/mapboxgl';
import { connect } from 'react-redux';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';
import { fetchWaypointsByName } from '@root/state/modules/locations/actions';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// type Props = {
//   mapId: string,
//   geocoderId: string,
//   disabled: boolean,
//   centerLon: number,
//   centerLat: number,
//   zoom: number,
//   setLocationValid: boolean => void,
//   setLocation: Object => void,
//   locations: Array<Object>,
//   value: string,
//   isValid: boolean,
//   limit: number,
//   // twoLocationsRequired: boolean,
//   isWaypoint: boolean,
//   waypointsOnly: boolean,
//   turnofSearchingByName: boolean,
//   dispatch: Function,
//   resetMap: boolean,
//   isSuspendedOrder?: boolean,
//   isCoreItem?: boolean,
//   coreId?: string,
//   isAutoComplete?: boolean,
// };

function coordinateFeature(lng, lat) {
  return {
    center: [lng, lat],
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    place_name: `Lat: ${lat} Lng: ${lng}`,
    place_type: ['coordinate'],
    properties: {},
    type: 'Feature',
  };
}

const defaultCoords = {
  centerLat: 39.75101745196717,
  centerLon: -105.00389099121094,
  zoom: 10,
  limit: 5,
  waypointsOnly: false,
};

export class GeoAutocomplete extends Component {
  static defaultProps = defaultCoords;

  constructor(props) {
    super(props);

    this.state = {
      geojson: {
        features: [],
        type: 'FeatureCollection',
      },
      rendered: false,
      hasLoadedWaypoints: false,
    };
    this.marker = null;
  }

  // eslint-disable-next-line require-await
  async componentDidMount() {
    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
      container: this.props.mapId,
      style: MAPBOX_STYLE_URL,
      center: [this.props.centerLon, this.props.centerLat],
      zoom: Number(this.props.zoom),
    });
    this.map = map;
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_API_KEY,
      mapboxgl,
      localGeocoder: this.forwardGeocoder,
      externalGeocoder: this.props.turnofSearchingByName ? null : this.getExternalData,
      localGeocoderOnly: true,
      limit: this.props.limit,
      bbox: this.props.waypointsOnly ? [139.965, -38.03, 139.965, -38.03] : null,
    });
    document.getElementById(this.props.geocoderId).appendChild(geocoder.onAdd(map));

    const render = (feature) => `<span class='geocoder-menu-item'>${feature.place_name}</span>`;
    geocoder.setRenderFunction(render);

    geocoder.on('clear', () => {
      this.props.setLocation({});
      this.props.setLocationValid(false);
    });

    geocoder.on('result', (e) => {
      const isValidWaypoint =
        (this.props.locations.filter((location) => location.name?.includes(e.result.place_name))
          .length ||
          this.props.locations.filter((location) =>
            location.description?.includes(e.result.place_name),
          ).length) > 0 && this.props.isWaypoint;

      const foundWaypoints =
        this.props.locations.filter((location) => location.name?.includes(e.result.place_name))
          .length ||
        this.props.locations.filter((location) =>
          location.description?.includes(e.result.place_name),
        ).length;

      const fullAddress =
        this.props.locations.filter((location) => location.name?.includes(e.result.place_name))[0]
          ?.name ||
        this.props.locations.filter((location) =>
          location.description?.includes(e.result.place_name),
        )[0]?.name;

      const description =
        this.props.locations.filter((location) =>
          location.description?.includes(e.result.place_name),
        )[0]?.description || '';

      const haulingDisposalSiteId = this.props.locations.filter((location) =>
        location.description?.includes(e.result.place_name),
      )[0]?.haulingDisposalSiteId;
      // const shortAddress = convertLocationFormat(e.result.place_name);
      const locObj = {
        // name: isValidWaypoint
        //   ? this.props.locations.filter(location =>
        //       location.waypointName.includes(e.result.place_name),
        //     )[0].name
        //   : convertLocationFormat(e.result.place_name),
        // name: `${shortAddress} - ${fullAddress}`,
        haulingDisposalSiteId,
        name: fullAddress,
        description,
        location: {
          lon: e.result.center[0],
          lat: e.result.center[1],
        },
        waypointName: isValidWaypoint
          ? this.props.locations.filter((location) =>
              location.waypointName?.includes(e.result.place_name),
            )[0]?.waypointName
          : null,
        type: isValidWaypoint ? 'WAYPOINT' : 'LOCATION',
      };

      // if (this.props.twoLocationsRequired && foundWaypoints !== 0) {
      if (foundWaypoints === 0) {
        this.props.setLocationValid(false);
      } else {
        this.props.setLocationValid(true);
        this.props.setLocation(locObj);
      }

      if (this.marker) {
        this.marker.remove();
      }
    });

    document.getElementById(this.props.geocoderId).children[0].children[1].disabled =
      this.props.disabled;

    if (this.props.value) {
      this.marker = new mapboxgl.Marker()
        .setLngLat([this.props.centerLon, this.props.centerLat])
        .addTo(map);
    }

    this.setState({ rendered: true });
  }

  componentDidUpdate(prevProps) {
    if (this.state.rendered) {
      const inputElement = document.getElementById(this.props.geocoderId).children[0].children[1];
      inputElement.disabled = this.props.disabled;
      if (this.props.value?.length || this.props.value !== prevProps.value) {
        inputElement.value = this.props.value;
      }
    }

    if (!this.state.hasLoadedWaypoints && this.props.locations) {
      const features = [];
      const uniqueLocations = Array.from(
        new Set(this.props.locations.map((location) => location.id)),
      ).map((id) => this.props.locations.filter((s) => s.id === id)[0]);
      uniqueLocations.forEach((location) => {
        features.push({
          type: 'Feature',
          properties: {
            title: location.description || location.name,
            description: location.description || '',
          },
          geometry: {
            coordinates: [location.location.lon, location.location.lat],
            type: 'Point',
          },
        });
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        geojson: {
          features,
          type: 'FeatureCollection',
        },
        hasLoadedWaypoints: true,
      });
    }
    if (
      prevProps.value !== this.props.value &&
      this.props.centerLon &&
      this.props.centerLat &&
      this.props.isAutoComplete
    ) {
      // eslint-disable-next-line no-unused-expressions
      this.map?.flyTo({
        center: [this.props.centerLon, this.props.centerLat],
        zoom: 10,
        // essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
      this.marker = null;
    }
    if (this.props.resetMap) {
      // eslint-disable-next-line no-unused-expressions
      this.map?.flyTo({
        center: [defaultCoords.centerLon, defaultCoords.centerLat],
        zoom: 10,
        // essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
      this.marker = null;
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }

  getExternalData = (query) =>
    this.props
      .dispatch(
        fetchWaypointsByName(
          query,
          this.props.isSuspendedOrder,
          this.props.isCoreItem,
          this.props.coreId,
        ),
      )
      .then(() => {
        this.setState(() => ({
          hasLoadedWaypoints: false,
        }));
      })
      .then(() => {
        const matchingFeatures = [];
        for (const element of this.state.geojson.features) {
          const feature = element;

          feature.place_name = `${feature.properties.title}`;
          feature.center = feature.geometry.coordinates;
          matchingFeatures.push(feature);
        }
        return Promise.resolve(matchingFeatures);
      });

  forwardGeocoder = (query) => {
    if (!this.props.turnofSearchingByName) {
      return;
    }
    const matchingFeatures = [];

    for (const element of this.state.geojson.features) {
      const feature = element;
      if (feature.properties.title?.toLowerCase().search(query.toLowerCase()) !== -1) {
        feature.place_name = `${feature.properties.title}`;
        feature.center = feature.geometry.coordinates;
        matchingFeatures.push(feature);
      }
    }

    const matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i);
    if (matches) {
      const coord1 = Number(matches[1]);
      const coord2 = Number(matches[2]);
      if (coord1 < -90 || coord1 > 90) {
        // must be lng, lat
        matchingFeatures.push(coordinateFeature(coord1, coord2));
      }

      if (coord2 < -90 || coord2 > 90) {
        // must be lat, lng
        matchingFeatures.push(coordinateFeature(coord2, coord1));
      }

      if (matchingFeatures.length === 0) {
        // else could be either lng, lat or lat, lng
        matchingFeatures.push(coordinateFeature(coord1, coord2));
        matchingFeatures.push(coordinateFeature(coord2, coord1));
      }
    }

    return matchingFeatures;
  };

  render() {
    return (
      <div style={{ display: 'block', height: '100%', width: '100%' }} className="geo-input">
        <div
          type="text"
          id={this.props.geocoderId}
          style={{ width: '100%', marginBottom: '20px' }}
          className={this.props.disabled ? '' : this.props.isValid ? '' : 'error-required'}
        />
        <div id={this.props.mapId} style={{ width: '100%', height: '140px' }} />
      </div>
    );
  }
}

const ConnectedGeoAutocomplete = connect()(GeoAutocomplete);
export default ConnectedGeoAutocomplete;
