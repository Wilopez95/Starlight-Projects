/* eslint-disable react/prop-types */
/* eslint-disable max-lines */
import { PureComponent } from 'react';
import mapboxgl from '@starlightpro/mapboxgl';
import MapboxglSpiderifier from '@starlightpro/mapboxgl-spiderifier';
import map from 'lodash/map';
import MapboxTraffic from '@mapbox/mapbox-gl-traffic';
import { styleSwitcherControl } from '@root/helpers/mapboxStyleSwitcher';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';
import workOrderPinImg from '@root/static/images/workorderPin.png';
import markerGreenStagingImg from '@root/static/images/marker-green-staging-small-2.png';
import { isEmpty } from 'lodash';

// export type Props = {
//   workOrders: $ReadOnlyArray<Object>,
//   onBoundsChange?: Function,
//   setting: Object,
//   onPointClick?: Function,
// };

const loadedPromise = (promisedMap) => {
  if (promisedMap.isStyleLoaded()) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    promisedMap.on("idle", () => resolve(true));
  });
};

const suspendResumeActions = [
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
// workorders.filter( wo => arrayContains(wo.action)

class WorkOrdersMap extends PureComponent {
  static defaultProps = {
    workOrders: [],
    setting: {},
  };

  constructor(props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
    this.handleUpdateMap = this.handleUpdateMap.bind(this);
    this.popup = null;
    this.traffic = new MapboxTraffic();
    this.nav = new mapboxgl.NavigationControl();
    this.styleSwitcher = new styleSwitcherControl();
    this.fullscreen = new mapboxgl.FullscreenControl();
  }

  componentDidMount() {
    if (!mapboxgl) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
      container: 'workorders-map',
      style: MAPBOX_STYLE_URL,
      center: [
        parseFloat(this.props.setting?.map?.lon) || 0,
        parseFloat(this.props.setting?.map?.lat) || 0,
      ],
      zoom: parseInt(this.props.setting.map.zoom, 10),
    });
    this._map = map;


    // Store the waypoint bounds
    const bounds = new mapboxgl.LngLatBounds();
    this.props.workOrders.forEach((item) => {
      // get the bounds of the waypoints
      if (item.location1?.location?.lon && item.location1?.location?.lat) {
        bounds.extend([item.location1.location.lon, item.location1.location.lat]);
      }
    });

    // set the map view to the bounds of the waypoints
    if (!isEmpty(this.props.workOrders)) {
      map.fitBounds(bounds, { padding: 80 });

    }

    // create a spiderifier for the map, pass spiderified popup function
    const spiderifier = new MapboxglSpiderifier(map, {
      initializeLeg: this.initializeSpiderLeg,
    });
    this._spiderifier = spiderifier;

    // loading map and map styles to fix the toggle between map styles
    map.on('load', () => {
      this.setupMap();
      this.onLoad();
      map.on('style.load', () => {
        this.onLoad();
        this.traffic.toggleTraffic();
        this.traffic.toggleTraffic();
      });
    });
  }

  async componentDidUpdate() {
    if (!this._map) {
      return;
    }

    await loadedPromise(this._map);
    this.handleUpdateMap();
  }

  componentWillUnmount() {
    if (this._map) {
      this._map.remove();
    }
  }

  // Set popups for the spiderified pins with workorder id and action
  initializeSpiderLeg = (spiderLeg) => {
    const pinElem = spiderLeg.elements.pin;
    const { feature } = spiderLeg;
    pinElem.style.backgroundImage = `url(${workOrderPinImg})`;
    pinElem.style.cursor = 'pointer';

    this.popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: MapboxglSpiderifier.popupOffsetForSpiderLeg(spiderLeg),
    });
    // eslint-disable-next-line no-unused-vars
    pinElem.addEventListener('click', (e) => {
      setTimeout(() => {
        if (this.popup) {
          this.popup.remove();
        }
        this.popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: MapboxglSpiderifier.popupOffsetForSpiderLeg(spiderLeg),
        });
        spiderLeg.mapboxMarker.setPopup(this.popup);
        this.popup.setLngLat([
          spiderLeg.mapboxMarker._lngLat.lng,
          spiderLeg.mapboxMarker._lngLat.lat,
        ]);
        this.popup.setText(`${feature.description}`);
        this.popup.addTo(this._map);
        this.props.onPointClick(feature);
        // this.onMouseClickActiveWorkorder(e);
      }, 100);
    });
  };

  setupMap = () => {
    // add zoom, traffic option, map toggle and full screen controls to map
    this._map.addControl(this.nav, 'top-left');
    this._map.addControl(this.traffic, 'top-left');
    this._map.addControl(this.styleSwitcher, 'top-left');
    this._map.addControl(this.fullscreen, 'top-left');

    // Map Events
    // Change the cursor to a pointer when the mouse is over the pins layer.
    this._map.on('mouseenter', 'pins', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', 'pins', () => {
      this._map.getCanvas().style.cursor = '';
    });
    // Change the cursor to a pointer when the mouse is over the pins layer.
    this._map.on('mouseenter', 'unclustered-cans-suspended', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', 'unclustered-cans-suspended', () => {
      this._map.getCanvas().style.cursor = '';
    });
    // Change the cursor to a pointer when the mouse is over the suspended pins layer.
    this._map.on('mouseenter', 'unclustered-cans-not', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', 'unclustered-cans-not', () => {
      this._map.getCanvas().style.cursor = '';
    });
    this._map.on('mouseenter', 'cluster-pins', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', 'cluster-pins', () => {
      this._map.getCanvas().style.cursor = '';
    });
    // clickhandler for the map pins to popup the workorder number and work order type on click
    this._map.on('click', 'pins', (e) => {
      const featuresPins = this._map.queryRenderedFeatures(e.point, {
        layers: ['pins'],
      });
      // offset popup for stylistic reasons, description set in features
      new mapboxgl.Popup({ offset: 19 })
        .setLngLat([featuresPins[0].properties.lon, featuresPins[0].properties.lat])
        .setHTML(`<strong>${featuresPins[0].properties.description}</strong>`)
        .addTo(this._map);
    });

    // clickhandler for the map pins to popup the workorder number and work order type on click
    this._map.on('click', 'unclustered-cans-suspended', (e) => {
      const featuresPins = this._map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-cans-suspended'],
      });
      // offset popup for stylistic reasons, description set in features
      new mapboxgl.Popup({ offset: 19 })
        .setLngLat([featuresPins[0].properties.lon, featuresPins[0].properties.lat])
        .setHTML(`<strong>${featuresPins[0].properties.description}</strong>`)
        .addTo(this._map);
    });

    // clickhandler for the map pins to popup the workorder number and work order type on click
    this._map.on('click', 'unclustered-cans-not', (e) => {
      const featuresPins = this._map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-cans-not'],
      });
      // offset popup for stylistic reasons, description set in features
      new mapboxgl.Popup({ offset: 19 })
        .setLngLat([featuresPins[0].properties.lon, featuresPins[0].properties.lat])
        .setHTML(`<strong>${featuresPins[0].properties.description}</strong>`)
        .addTo(this._map);
    });

    this._map.on('click', 'cluster-pins', this.onMouseClick);
    this._map.on('touchend', 'cluster-pins', this.onMouseClick);
    this._map.on('zoomstart', () => {
      this._spiderifier.unspiderfy();
    });

    this._map.on('dragstart', () => {
      this._map.on('mouseup', () => {
        this.onBoundsChange();
        this._map.off('mouseup');
      });
    });

    this._map.on('zoomend', () => {
      this.onBoundsChange();
    });

    // this._map.on('click', 'pins', e => this.onMouseClickActiveWorkorder(e));
    this._map.on('click', 'unclustered-cans-suspended', (e) => this.onMouseClickActiveWorkorder(e));
    this._map.on('click', 'unclustered-cans-not', (e) => this.onMouseClickActiveWorkorder(e));

    this.onBoundsChange();
  };

  onBoundsChange = () => {
    const boundsOnZoom = this._map.getBounds();
    const neLat = boundsOnZoom._ne.lat;
    const neLng = boundsOnZoom._ne.lng;
    const swLat = boundsOnZoom._sw.lat;
    const swLng = boundsOnZoom._sw.lng;
    const bounds = `${neLng},${neLat},${swLng},${swLat}`;
    this.props.onBoundsChange({ bounds });
  };

  onLoad() {
    if (!this._map) {
      return;
    }
    const features = this.props.workOrders.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description:
          listing.action === 'SPOT'
            ? `DELIVERY  #${listing.id}`
            : `${listing.action} #${listing.id}`,
        action: listing.action,
        lat: listing.location1.location.lat,
        lon: listing.location1.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location1.location.lon, listing.location1.location.lat],
      },
    }));

    // NOTE: suspenssionLocationID will not be removed when a workorder has been completed
    // filter workorders on the action and locationID => logic behind this decision
    const suspendedWO = this.props.workOrders.filter((wo) =>
      arrayContains(wo.action, suspendResumeActions),
    );

    const nonSuspendedWO = this.props.workOrders.filter(
      (workorder) => workorder.suspensionLocation.id === null,
    );

    const featuresSuspended = suspendedWO.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description:
          listing.action === 'SPOT'
            ? `DELIVERY  #${listing.id}`
            : `${listing.action} #${listing.id}`,
        action: listing.action,
        lat: listing.location1.location.lat,
        lon: listing.location1.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location1.location.lon, listing.location1.location.lat],
      },
    }));

    const featuresNotSuspended = nonSuspendedWO.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description:
          listing.action === 'SPOT'
            ? `DELIVERY  #${listing.id}`
            : `${listing.action} #${listing.id}`,
        action: listing.action,
        lat: listing.location1.location.lat,
        lon: listing.location1.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location1.location.lon, listing.location1.location.lat],
      },
    }));

    this._map.loadImage(workOrderPinImg, (error, image) => {
      if (error) {
        // do nothing... this is harmless
      }
      // add workorder image
      this._map.addImage('wopin', image);
    });

    this._map.loadImage(markerGreenStagingImg, (error, image) => {
      if (error) {
        // do nothing... this is harmless
      }
      // add workorder image
      this._map.addImage('markerGreenStagingImg', image);
    });
    // add data structure for the clusers, this is not for the pins
    // needed for the correct counts when clustered and spiderified
    this._map.addSource('pins', {
      type: 'geojson',
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 25,
      data: {
        type: 'FeatureCollection',
        features,
      },
    });
    // add the data structure for the suspended pins
    this._map.addSource('suspended', {
      type: 'geojson',
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 25,
      data: {
        type: 'FeatureCollection',
        features: featuresSuspended,
      },
    });
    // add the data structure for without suspended pins
    this._map.addSource('notSuspended', {
      type: 'geojson',
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 25,
      data: {
        type: 'FeatureCollection',
        features: featuresNotSuspended,
      },
    });
    // add the pins for cans that are not staged /inUse
    this._map.addLayer({
      id: 'unclustered-cans-not',
      type: 'symbol',
      source: 'notSuspended',
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': 'wopin',
      },
    });
    // add the pins for cans that are not staged /inUse
    this._map.addLayer({
      id: 'unclustered-cans-suspended',
      type: 'symbol',
      source: 'suspended',
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': 'markerGreenStagingImg',
      },
    });
    // add first circle cluster layer for border style
    this._map.addLayer({
      id: 'cluster-pinscolor',
      type: 'circle',
      source: 'pins',
      filter: ['all', ['has', 'point_count']],
      paint: {
        'circle-color': {
          type: 'interval',
          property: 'point_count',
          stops: [
            [0, '#95d86f'],
            [10, '#f0cb3e'],
            [100, '#f39859'],
          ],
        },
        'circle-radius': 24,
        'circle-opacity': 0.4,
      },
    });
    // set colors based upon count number when clustering workorders
    this._map.addLayer({
      id: 'cluster-pins',
      type: 'circle',
      source: 'pins',
      filter: ['all', ['has', 'point_count']],
      paint: {
        'circle-color': {
          type: 'interval',
          property: 'point_count',
          stops: [
            [0, '#95d86f'],
            [10, '#f0cb3e'],
            [100, '#f39859'],
          ],
        },
        'circle-radius': 18,
        'circle-opacity': 0.8,
      },
    });
    // add count numbers on top of cluster circles
    this._map.addLayer({
      id: 'cluster-pins-count',
      type: 'symbol',
      source: 'pins',
      layout: {
        'text-field': '{point_count}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    });
  }

  onMouseClickActiveWorkorder = (e) => {
    const workordersPin = this._map.queryRenderedFeatures(e.point, {
      layers: ['unclustered-cans-suspended', 'unclustered-cans-not'],
    });
    const { lat } = workordersPin[0].properties;
    const { lon } = workordersPin[0].properties;
    const workorder = {};
    workorder.action = workordersPin[0].properties.action;
    workorder.id = workordersPin[0].properties.id;
    workorder.location1 = { location: { lon, lat } };
    const workorderActive = workorder;
    this.props.onPointClick(workorderActive);
  };

  handleUpdateMap() {
    const suspendedWO = this.props.workOrders.filter((wo) =>
      arrayContains(wo.action, suspendResumeActions),
    );

    const nonSuspendedWO = this.props.workOrders.filter(
      (workorder) => workorder.suspensionLocation.id === null,
    );

    const features = this.props.workOrders.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description:
          listing.action === 'SPOT'
            ? `DELIVERY #${listing.id}`
            : `${listing.action} #${listing.id}`,
        action: listing.action,
        lat: listing.location1.location.lat,
        lon: listing.location1.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location1.location.lon, listing.location1.location.lat],
      },
    }));
    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    const featuresSuspended = suspendedWO.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description:
          listing.action === 'SPOT'
            ? `DELIVERY #${listing.id}`
            : `${listing.action} #${listing.id}`,
        action: listing.action,
        lat: listing.location1.location.lat,
        lon: listing.location1.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location1.location.lon, listing.location1.location.lat],
      },
    }));
    const geojsonSuspended = {
      type: 'FeatureCollection',
      features: featuresSuspended,
    };

    const featuresNotSuspended = nonSuspendedWO.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description:
          listing.action === 'SPOT'
            ? `DELIVERY #${listing.id}`
            : `${listing.action} #${listing.id}`,
        action: listing.action,
        lat: listing.location1.location.lat,
        lon: listing.location1.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location1.location.lon, listing.location1.location.lat],
      },
    }));
    const geojsonNotSuspended = {
      type: 'FeatureCollection',
      features: featuresNotSuspended,
    };

    this._map.getSource('pins').setData(geojson);
    this._map.getSource('suspended').setData(geojsonSuspended);
    this._map.getSource('notSuspended').setData(geojsonNotSuspended);
  }

  onMouseClick = (e) => {
    if (this.popup) {
      this.popup.remove();
    }

    const features = this._map.queryRenderedFeatures(e.point, {
      layers: ['cluster-pins'],
    });
    if (!features.length) {
      // eslint-disable-next-line
      return;
    }
    this._spiderifier.unspiderfy();
    this._map
      .getSource('pins')
      .getClusterLeaves(features[0].properties.cluster_id, 100, 0, (err, leafFeatures) => {
        if (err) {
          console.error('error while getting leaves of a cluster', err);
        }
        const markers = map(leafFeatures, (leafFeature) => leafFeature.properties);
        this._spiderifier.spiderfy(features[0].geometry.coordinates, markers);
      });
  };

  render() {
    return (
      <div style={{ width: '100%', height: 'calc(100vh - 62px)' }}>
        <div id="workorders-map" style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }
}
export default WorkOrdersMap;
