/* eslint-disable no-const-assign */
/* eslint-disable react/no-did-mount-set-state */
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as turf from '@turf/turf';
import mapboxgl from '@starlightpro/mapboxgl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/pro-regular-svg-icons';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';

class WorkOrderRouteMap extends Component {
  static displayName = 'WorkOrderRouteMap';

  static propTypes = {
    items: PropTypes.array,
    mapConfig: PropTypes.object,
  };

  static defaultProps = {
    items: [],
    mapConfig: {},
  };

  constructor(props) {
    super(props);

    this.markers = [];
    this.state = {
      rendered: false,
    };
  }

  componentDidMount() {
    if (this.state.rendered || this.props.items.length <= 1) {
      return;
    }
    let mapCenter;
    if (this.props.items[0] && this.props.items[0].location.location.lon !== null) {
      mapCenter = [
        parseFloat(this.props.items[0].location.location.lon),
        parseFloat(this.props.items[0].location.location.lat),
      ];
    } else {
      mapCenter = [parseFloat(this.props.mapConfig.lon), parseFloat(this.props.mapConfig.lat)];
    }

    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
      container: 'wo-route-map',
      style: MAPBOX_STYLE_URL,
      center: mapCenter,
      zoom: this.props.mapConfig.zoom,
      boxZoom: false,
      pitchWithRotate: false,
      dragRotate: false,
      interactive: true,
    });
    this.map = map;

    const coordinates = [];
    this.props.items.forEach((item) => {
      if (
        !!item.location.location.lat &&
        !!item.location.location.lon &&
        item.location.location.lon !== null
      ) {
        coordinates.push([item.location.location.lon, item.location.location.lat]);
      }
    });

    // need to reverse the coordinates here or the truck starts from the last point and goes to the start, we want to show the direction driver took
    coordinates.reverse();

    // if there are no coordinates, aka dispatcher was the only one who has updated the order we need to simply return to remove error
    if (coordinates.length < 2) {
      // exit if no cords in array
      return;
    }

    // A simple line from origin to destination.
    const route = turf.lineString(coordinates);

    // A single point that animates along the route.
    // Coordinates are initially set to origin.
    const point = turf.point(coordinates[0]);

    // Calculate the distance in kilometers between route start/end point.
    const lineDistance = turf.lineDistance(route, {
      units: 'kilometers',
    });

    const arc = [];
    let counter = 0;
    const steps = 500;

    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      const segment = turf.along(route, i, {
        units: 'kilometers',
      });
      arc.push(segment.geometry.coordinates);
    }

    if (this.props.items[0] && this.props.items[0].location.location.lon !== null) {
      const bounds = new mapboxgl.LngLatBounds();

      this.props.items.forEach((note) => {
        if (note.location.location.lat && note.location.location.lon) {
          bounds.extend([note.location.location.lon, note.location.location.lat]);
        }
      });

      map.fitBounds(bounds, { padding: 80 });
    }

    map.on('load', () => {
      map.loadImage(
        'https://starlight-asset.s3.amazonaws.com/dispatch/img/truck.png',
        (error, image) => {
          if (error) {
            throw error;
          }
          map.addImage('truck', image);
          map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'point',
            layout: {
              'icon-image': 'truck',
              'icon-size': 0.4,
              'icon-rotate': ['get', 'bearing'],
              'icon-rotation-alignment': 'map',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-offset': [0, -20],
            },
          });
        },
      );
      map.addSource('route', {
        type: 'geojson',
        data: route,
      });

      map.addSource('point', {
        type: 'geojson',
        data: point,
      });

      map.addLayer({
        id: 'route',
        source: 'route',
        type: 'line',
        paint: {
          'line-width': 2,
          'line-color': '#007cbf',
        },
      });

      function animate() {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc.

        if (counter >= 499) {
          return;
        }
        if (!point.geometry.coordinates || point.geometry.coordinates === undefined) {
          return;
        }
        if (arc.length === 0) {
          // exit if no cords in array
          return;
        }

        point.geometry.coordinates = arc[counter];

        // Calculate the bearing to ensure the icon is rotated to match the route arc
        // The bearing is calculate between the current point and the next point, except
        // at the end of the arc use the previous point and the current point
        point.properties.bearing = turf.bearing(arc[counter], arc[arc.length - 1]) - 90;

        // Update the source with this new data.
        map.getSource('point').setData(point);

        // Request the next frame of animation so long the end has not been reached.
        if (counter < steps) {
          requestAnimationFrame(animate);
        }
        counter += 1;
      }

      document.getElementById('replay').addEventListener('click', () => {
        // Set the coordinates of the original point back to origin
        // if you click on refresh and there is no route it will delete the can off the page
        if (!point.geometry.coordinates || point.geometry.coordinates === undefined) {
          return;
        }
        point.geometry.coordinates = origin;

        // Update the source layer
        map.getSource('point').setData(point);

        // Reset the counter
        counter = 0;

        // Restart the animation.
        animate(counter);
      });

      animate(counter);
    });
    this.setState({ rendered: true });
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }

  render() {
    return (
      <div style={{ width: '100%', minHeight: '425px' }}>
        {this.props.items.length > 1 ? <div
            id="wo-route-map"
            style={{
              position: 'absolute',
              top: 70,
              bottom: -30,
              left: 20,
              height: '400px',
              right: 20,
            }}
          /> : null}
        {this.props.items.length > 1 ? <div
            className="overlay"
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
            }}
          >
            <FontAwesomeIcon
              icon={faRedo}
              id="replay"
              style={{
                fontSize: 28,
                position: 'absolute',
                top: 80,
                left: 30,
                display: 'inline-block',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 3,
              }}
            />
          </div> : null}

        {this.props.items.length <= 1 ? <div className="form-error" style={{ position: 'absolute' }}>
            <h5 data-name="error-message">
              The work order has not yet been started and does not have an associated route.
            </h5>
          </div> : null}
      </div>
    );
  }
}

export default WorkOrderRouteMap;
