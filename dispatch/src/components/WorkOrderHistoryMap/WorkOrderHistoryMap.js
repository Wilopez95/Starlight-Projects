/* eslint-disable react/no-did-mount-set-state */
import { Component } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from '@starlightpro/mapboxgl';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';

class WorkOrderHistoryMap extends Component {
  static displayName = 'WorkOrderHistoryMap';

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
    if (this.state.rendered) {
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
      container: 'history-map',
      style: MAPBOX_STYLE_URL,
      center: mapCenter,
      zoom: this.props.mapConfig.zoom,
      boxZoom: false,
      pitchWithRotate: false,
      dragRotate: false,
      interactive: true,
    });
    this.map = map;

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
      this.createMarkers();
    });
    this.setState({ rendered: true });
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }

  createMarkers = () => {
    this.props.items.forEach((note) => {
      if (!note.location.location.lat || !note.location.location.lon) {
        return;
      }

      const marker = new mapboxgl.Marker();
      if (!this.markers.map((item) => item.note.id).includes(note.id)) {
        this.markers.push({
          marker,
          note,
          lat: note.location.location.lat,
          lon: note.location.location.lon,
        });
      }

      marker.setLngLat([note.location.location.lon, note.location.location.lat]);
      const date = new Date(Date.parse(note.createdDate));
      const html = `
        <div>
            <span style="display: block;">${date.getDay()}/${date.getMonth()}/${date.getFullYear()}</span>
            <span style="display: block;">${date.getHours()}:${
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
      }:${date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()} ${
        date.getHours() < 12 ? 'am' : 'pm'
      }</span>
            <span style="display: block;">${note.note.newState}</span>
        </div>
      `;
      const popup = new mapboxgl.Popup();
      marker.setPopup(popup.setHTML(html));
      marker.addTo(this.map);
    });
  };

  render() {
    return <div id="history-map" style={{ height: '350px', width: '100%' }} />;
  }
}

export default WorkOrderHistoryMap;
