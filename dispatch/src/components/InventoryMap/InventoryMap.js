/* eslint-disable react/prop-types */
/* eslint-disable max-lines */
import { PureComponent } from 'react';
import MapboxglSpiderifier from '@starlightpro/mapboxgl-spiderifier';
import mapboxgl from '@starlightpro/mapboxgl';
import isEqual from 'lodash/isEqual';
import MapboxTraffic from '@mapbox/mapbox-gl-traffic';
import { styleSwitcherControl } from '@root/helpers/mapboxStyleSwitcher';
import {
  MAPBOX_API_KEY,
  MAP_DEFAULT_POSITION,
  MAP_DEFAULT_ZOOM,
  MAPBOX_STYLE_URL,
} from '@root/helpers/config';
import workOrderPinImg from '@root/static/images/workorderPin.png';
import markerGreenStagingImg from '@root/static/images/marker-green-staging-small-2.png';

// export type Props = {
//   cans: $ReadOnlyArray<Object>,
//   onBoundsChange?: Function,
//   setting: Object,
//   onPointClick: Object => void,
// };

class InventoryMap extends PureComponent {
  static defaultProps = {
    cans: [],
    setting: {},
  };

  constructor(props) {
    super(props);
    this.handleUpdateMap = this.handleUpdateMap.bind(this);
    this.traffic = new MapboxTraffic();
    this.nav = new mapboxgl.NavigationControl();
    this.styleSwitcher = new styleSwitcherControl();
    this.fullscreen = new mapboxgl.FullscreenControl();
  }

  componentDidMount() {
    if (!mapboxgl) {
      return;
    }
    const { setting } = this.props;
    let position = MAP_DEFAULT_POSITION;
    let zoom = MAP_DEFAULT_ZOOM;
    if (setting.map && setting.map.lon) {
      position = [setting.map.lat, setting.map.lon];
      zoom = setting.map.zoom;
    }

    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
      container: 'inventory-map',
      style: MAPBOX_STYLE_URL,
      // LNG, LAT
      center: [parseFloat(position[1]), parseFloat(position[0])],
      zoom: Number(zoom),
      maxZoom: 23,
    });

    this._map = map;

    window.addEventListener('onBoundsChange', () => {
      this.props.onBoundsChange(this._map.getBounds());
    });

      this._map.on('load', () => {
        this.loadCustomMarkerImage();
        this.loadControls();
        this.initializeSpiderifier();
        this.initializeMapLayers();
        this.initializeMapActions();
        this._map.on('style.load', () => {
          this.loadCustomMarkerImage();
          this.initializeMapLayers();
          this.traffic.toggleTraffic();
          this.traffic.toggleTraffic();
        });
      });

  }

  componentDidUpdate(prevProps) {
    if (!this._map || (this._map && !this._map.getSource('pins'))) {
      return;
    }
    if (!isEqual(prevProps.cans, this.props.cans)) {
      this.handleUpdateMap();
    }
  }

  componentWillUnmount() {
    if (this._map) {
      this._map.remove();
    }
  }

  loadControls = () => {
    this._map.addControl(this.nav, 'top-left');
    this._map.addControl(this.traffic, 'top-left');
    this._map.addControl(this.styleSwitcher, 'top-left');
    this._map.addControl(this.fullscreen, 'top-left');
  };

  loadCustomMarkerImage = () => {
    if (!this._map) {
      return;
    }

    this._map.loadImage(workOrderPinImg, (error, image) => {
      if (error) {
        // harmless
      }
      // add workorder image
      this._map.addImage('wopin', image);
    });
    this._map.loadImage(markerGreenStagingImg, (error, image) => {
      if (error) {
        // harmless
      }
      this._map.addImage('markerGreenStagingImg', image);
    });
  };

  initializeSpiderifier() {
    const map = this._map;

    this._spiderifier = new MapboxglSpiderifier(map, {
      customPin: true,
      animate: true,
      initializeLeg: (spiderLeg) => {
        const pinElem = spiderLeg.elements.pin;

        pinElem.style.backgroundImage = `url(${workOrderPinImg})`;
        pinElem.style.cursor = 'pointer';

        spiderLeg.mapboxMarker.setPopup(this.popup);
      },
      onClick: (e, marker) => {
        const markerLngLat = marker.mapboxMarker.getLngLat();
        const item = marker.feature;
        const offset = MapboxglSpiderifier.popupOffsetForSpiderLeg(marker, 36);

        this.removePopup();
        this.popup = this.makePopup(item, markerLngLat, offset, false);
        if (typeof this.popup.addTo === 'function') {
          this.popup.addTo(map);

          this.props.onPointClick(item);

          this.popup.on('close', () => {
            this.popup = null;
          });
        }

        e.stopPropagation();
      },
    });
  }

  makePopup(item, lngLat, popupOffset, closeOnClick) {
    const popup = new mapboxgl.Popup({
      closeOnClick,
      closeButton: true,
      offset: popupOffset,
      anchor: 'bottom',
    });

    popup.setLngLat(lngLat);
    popup.setHTML(`<strong>${item.description}</strong>`);
    return popup;
  }

  initializeMapActions = () => {
    this._map.on('zoomstart', () => {
      this.removePopup();
      this._spiderifier.unspiderfy();
    });

    this._map.on('click', (e) => {
      this.removePopup();
      this._spiderifier.unspiderfy();

      const features = this._map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-cans', 'cluster-pins'],
      });
      // inUse
      const featuresInUse = this._map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-inUsecans', 'cluster-pins'],
      });

      if (features.length > 1) {
        e.originalEvent.cancelBubble = true;
      }

      if (featuresInUse.length > 1) {
        e.originalEvent.cancelBubble = true;
      }
    });

    this._map.on('click', 'unclustered-cans', (e) => {
      if (e.originalEvent.cancelBubble) {
        return;
      }

      this.removePopup();
      this._spiderifier.unspiderfy();

      const feature = e.features[0];
      if (!feature) {
        return;
      }

      const featureCenter = feature.geometry.coordinates;
      const featureLngLat = { lng: featureCenter[0], lat: featureCenter[1] };
      const item = feature.properties;

      this.popup = this.makePopup(item, featureLngLat, 36, true);
      if (typeof this.popup.addTo === 'function') {
        this.popup.addTo(this._map);
        this.onMouseClickActiveWorkorder(e);
      }
    });

    this._map.on('click', 'unclustered-inUsecans', (e) => {
      if (e.originalEvent.cancelBubble) {
        return;
      }

      this.removePopup();
      this._spiderifier.unspiderfy();

      const feature = e.features[0];
      if (!feature) {
        return;
      }

      const featureCenter = feature.geometry.coordinates;
      const featureLngLat = { lng: featureCenter[0], lat: featureCenter[1] };
      const item = feature.properties;

      this.popup = this.makePopup(item, featureLngLat, 36, true);
      if (typeof this.popup.addTo === 'function') {
        this.popup.addTo(this._map);
        this.onMouseClickActiveWorkorder(e);
      }
    });

    this._map.on('click', 'cluster-pins', (e) => {
      if (e.originalEvent.cancelBubble) {
        return;
      }

      const feature = e.features[0];
      if (!feature || !feature.properties.cluster) {
        return;
      }

      const featureCenter = feature.geometry.coordinates;
      this._map
        .getSource('pins')
        .getClusterLeaves(feature.properties.cluster_id, 100, 0, (err, leafFeatures) => {
          if (err) {
            console.error('error while getting leaves of a cluster', err);
          }
          const items = leafFeatures.map((x) => x.properties);
          this._spiderifier.spiderfy(featureCenter, items);
        });
    });

    this._map.on('zoomend', () => {
      this.props.onBoundsChange(this._map.getBounds());
    });

    this._map.on('mouseup', () => {
      this.props.onBoundsChange(this._map.getBounds());
    });

    // Change the cursor to a pointer when the mouse is over the pins layer.
    this._map.on('mouseenter', 'unclustered-cans', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', 'unclustered-cans', () => {
      this._map.getCanvas().style.cursor = '';
    });
    this._map.on('mouseenter', 'cluster-pins', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', 'cluster-pins', () => {
      this._map.getCanvas().style.cursor = '';
    });
    // Change the cursor to a pointer when the mouse is over the staged cans pins layer.
    this._map.on('mouseenter', 'unclustered-inUsecans', () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves the staged cans layer.
    this._map.on('mouseleave', 'unclustered-inUsecans', () => {
      this._map.getCanvas().style.cursor = '';
    });
  };

  removePopup() {
    if (this.popup) {
      this.popup.remove();
    }
  }

  initializeMapLayers() {
    // create the data structure with all cans for clustering, cluster counts, spiderifying (aka declustering)
    const features = this.props.cans.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description: `CAN ${listing.name}`,
        name: listing.name,
        action: listing.action,
        lat: listing.location.location.lat,
        lon: listing.location.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location.location.lon, listing.location.location.lat],
      },
    }));

    // create the data structure that separates the cans that are staged and not staged
    // this is necessary so there are 2 separate icons on the map
    const inUseCans = this.props.cans.filter((can) => can.inUse === 1);
    const notInUseCans = this.props.cans.filter((can) => can.inUse === 0);

    const featuresInUse = inUseCans.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description: `CAN ${listing.name}`,
        name: listing.name,
        action: listing.action,
        lat: listing.location.location.lat,
        lon: listing.location.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location.location.lon, listing.location.location.lat],
      },
    }));

    const featuresNotInUse = notInUseCans.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description: `CAN ${listing.name}`,
        name: listing.name,
        action: listing.action,
        lat: listing.location.location.lat,
        lon: listing.location.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location.location.lon, listing.location.location.lat],
      },
    }));

    // keep this source, this is for the clusters and the cluster counts as well as the spiderify
    this._map.addSource('pins', {
      type: 'geojson',
      // 'cluster' option to true. Mapbox-gl will add the point_count property to the source data.
      cluster: true,
      // Radius of each cluster when clustering points (defaults to 50)
      clusterRadius: 50,
      maxzoom: 25,
      // Max zoom to cluster points on
      clusterMaxZoom: 25,
      data: {
        type: 'FeatureCollection',
        features,
      },
    });

    // creaate the feature for the cans staged/inUse
    this._map.addSource('inUse', {
      type: 'geojson',
      // 'cluster' option to true. Mapbox-gl will add the point_count property to the source data.
      cluster: true,
      // Radius of each cluster when clustering points (defaults to 50)
      clusterRadius: 50,
      maxzoom: 25,
      // Max zoom to cluster points on
      clusterMaxZoom: 25,
      data: {
        type: 'FeatureCollection',
        features: featuresInUse,
      },
    });
    // create the feature for the cans not staged/inUse
    this._map.addSource('notInUse', {
      type: 'geojson',
      // 'cluster' option to true. Mapbox-gl will add the point_count property to the source data.
      cluster: true,
      // Radius of each cluster when clustering points (defaults to 50)
      clusterRadius: 50,
      maxzoom: 25,
      // Max zoom to cluster points on
      clusterMaxZoom: 25,
      data: {
        type: 'FeatureCollection',
        features: featuresNotInUse,
      },
    });

    this._map.addLayer({
      id: 'cluster-pinscolor',
      type: 'circle',
      source: 'pins',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          // create underlying circles of larger radius for opacity circle
          'step',
          ['get', 'point_count'],
          '#95d86f',
          10,
          '#f0cb3e',
          50,
          '#f39859',
        ],
        'circle-radius': 24,
        'circle-opacity': 0.4,
      },
    });
    this._map.addLayer({
      id: 'cluster-pins',
      type: 'circle',
      source: 'pins',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          // stops: [[0, '#95d86f'], [10, '#f0cb3e'], [100, '#f39859']],
          'step',
          ['get', 'point_count'],
          '#95d86f',
          10,
          '#f0cb3e',
          50,
          '#f39859',
        ],
        // expand the size of the cluster circle based on the number of markers
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
        'circle-opacity': 0.75,
      },
    });

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

    // add the pins for cans that are not staged /inUse
    this._map.addLayer({
      id: 'unclustered-cans',
      type: 'symbol',
      source: 'notInUse',
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': 'wopin',
      },
    });
    // add the pins for cans that are staged /inUse
    this._map.addLayer({
      id: 'unclustered-inUsecans',
      type: 'symbol',
      source: 'inUse',
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': 'markerGreenStagingImg',
      },
    });
  }

  onMouseClickActiveWorkorder = (e) => {
    const { onPointClick } = this.props;
    const cansPin = this._map.queryRenderedFeatures(e.point, {
      layers: ['unclustered-cans', 'unclustered-inUsecans'],
    });
    const { lat } = cansPin[0].properties;
    const { lon } = cansPin[0].properties;
    const can = {};
    can.action = cansPin[0].properties.action;
    can.id = cansPin[0].properties.id;
    can.location = { location: { lon, lat } };
    onPointClick(can);
  };

  handleUpdateMap() {
    // Keep this features as this is for clustering only
    const features = this.props.cans.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description: `CAN ${listing.name}`,
        action: listing.action,
        lat: listing.location.location.lat,
        lon: listing.location.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location.location.lon, listing.location.location.lat],
      },
    }));

    // filtered out cans not in use so that pins don't overlap
    const inUseCans = this.props.cans.filter((can) => can.inUse === 1);
    const notInUseCans = this.props.cans.filter((can) => can.inUse === 0);

    const featuresInUse = inUseCans.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description: `CAN ${listing.name}`,
        name: listing.name,
        action: listing.action,
        lat: listing.location.location.lat,
        lon: listing.location.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location.location.lon, listing.location.location.lat],
      },
    }));

    const featuresNotInUse = notInUseCans.map((listing) => ({
      type: 'Feature',
      properties: {
        id: listing.id,
        description: `CAN ${listing.name}`,
        name: listing.name,
        action: listing.action,
        lat: listing.location.location.lat,
        lon: listing.location.location.lon,
        size: listing.size,
        material: listing.material,
        filters: [],
      },
      geometry: {
        type: 'Point',
        coordinates: [listing.location.location.lon, listing.location.location.lat],
      },
    }));
    const geojson = {
      type: 'FeatureCollection',
      features,
    };

    const geojsonInUse = {
      type: 'FeatureCollection',
      features: featuresInUse,
    };

    const geojsonNotInUse = {
      type: 'FeatureCollection',
      features: featuresNotInUse,
    };

    // allows for searching and filtering to update the pins on the map and remove clusters
    this._map.getSource('pins').setData(geojson);
    this._map.getSource('inUse').setData(geojsonInUse);
    this._map.getSource('notInUse').setData(geojsonNotInUse);
  }

  render() {
    return (
      <div style={{ width: '100%', height: 'calc(100vh - 62px)' }}>
        <div id="inventory-map" style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }
}
export default InventoryMap;
