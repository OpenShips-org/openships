import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

export const createOSMLayer = ({ visible = true } = {}) => {
  return new TileLayer({
    id: 'osm-layer', // ID für einfaches Identifizieren
    data: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    maxRequests: 20,
    pickable: false,
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    zoomOffset: devicePixelRatio === 1 ? -1 : 0,
    visible, // Layer-Sichtbarkeit
    renderSubLayers: (props) => {
      const [[west, south], [east, north]] = props.tile.boundingBox as [[number, number], [number, number]];
      const { data, ...otherProps } = props;

      return new BitmapLayer({
        ...otherProps,
        image: data,
        bounds: [west, south, east, north] as [number, number, number, number]
      });
    },
  });
};