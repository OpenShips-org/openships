import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

function OpenStreetMapLayer({ 
    visible = true 
}: { 
    visible?: boolean;
}) {
    const osmLayer = new TileLayer({
        id: 'osm-layer',
        data: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        maxRequests: 20,
        pickable: false,
        visible,
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        zoomOffset: devicePixelRatio === 1 ? -1 : 0,
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

    return osmLayer;
}

export default OpenStreetMapLayer;