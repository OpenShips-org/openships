import { IconLayer, TextLayer } from "@deck.gl/layers";
import { useVesselPosition } from "@/hooks/useVesselData";
import type ViewportBounds from "@/interfaces/ViewportBounds";

const VesselTypes = "31,32";

function TowingVesselLayer({ 
    visible = true, 
    viewportBounds,
    showNames = false,
    iconSize = 40,
    textSize = 12
}: { 
    visible?: boolean;
    viewportBounds?: ViewportBounds;
    showNames?: boolean;
    iconSize?: number;
    textSize?: number;
}) {
    const { vessels } = useVesselPosition({
        visible,
        viewportBounds,
        vesselTypes: VesselTypes
    });

    const iconLayer = new IconLayer({
        id: "towing-vessel-layer",
        data: vessels,
        visible,
        pickable: true,
        getPosition: (d) => [d.Longitude, d.Latitude],
        getIcon: () => ({
            url: '/Ship-Icon.png',
            height: 512,
            width: 360,
        }),
        getAngle: (d) => d.TrueHeading === 511 ? 0 : 360 - (d.TrueHeading || 0),
        getSize: iconSize,
    });

    const textLayer = new TextLayer({
        id: "towing-vessel-names",
        data: vessels,
        visible: visible && showNames,
        pickable: false,
        getPosition: (d) => [d.Longitude, d.Latitude],
        getText: (d) => d.ShipName || "",
        getSize: textSize,
        getColor: [0, 0, 0, 255],
        getAngle: 0,
        getTextAnchor: "start",
        getAlignmentBaseline: "center",
        getPixelOffset: [10, -25],
        fontFamily: "Arial",
        fontWeight: "bold",
    });

    return [iconLayer, textLayer];
}

export default TowingVesselLayer;