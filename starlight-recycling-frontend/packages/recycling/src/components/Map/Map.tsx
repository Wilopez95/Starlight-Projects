import React, { RefObject } from 'react';
import mapboxgl, { Marker } from 'mapbox-gl';

import { MAPBOX_ACCESS_TOKEN } from '../../constants';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MapProps {
  className: string;
  wrapClassName?: string;
  marker?: { lat: number; lng: number };
}

export default class Map extends React.PureComponent<MapProps> {
  map: any = null;
  marker: Marker | null = null;
  mapContainer: RefObject<HTMLDivElement>;

  constructor(props: MapProps) {
    super(props);

    this.mapContainer = React.createRef<HTMLDivElement>();
  }

  componentDidMount() {
    let center: [number, number] = [-100.716438, 36.2115201];

    if (this.props.marker) {
      const { lat, lng } = this.props.marker;
      center = [lng, lat];
    }

    this.map = new mapboxgl.Map({
      center,
      zoom: 2,
      container: this.mapContainer.current || '',
      style: 'mapbox://styles/mapbox/streets-v11',
    });

    if (this.props.marker) {
      this.marker = new mapboxgl.Marker().setLngLat(center).addTo(this.map);
    }
  }

  componentDidUpdate() {
    if (this.props.marker) {
      const { lat, lng } = this.props.marker;

      if (this.marker) {
        this.marker.remove();
      }

      this.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);

      this.map.flyTo({
        center: [lng, lat],
      });
    }
  }

  render() {
    return (
      <div className={this.props.wrapClassName}>
        <div ref={this.mapContainer} className={this.props.className} />
      </div>
    );
  }
}
