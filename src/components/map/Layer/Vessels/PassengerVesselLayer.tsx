import { IconLayer, TextLayer } from "@deck.gl/layers";
import { useVesselPosition } from "@/hooks/useVesselData";
import type ViewportBounds from "@/interfaces/ViewportBounds";
import { GetIcon, GetAngle, GetSize } from "@/lib/vesselUtils";

const VesselTypes = "60,61,62,63,64,65,66,67,68,69";

function PassengerVesselLayer({ 
    visible = true, 
    viewportBounds,
    showNames = false,
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
        id: "passenger-vessel-layer",
        data: vessels,
        visible,
        pickable: true,
        getPosition: (d) => [d.Longitude, d.Latitude],
        getIcon: (d) => GetIcon(d),
        getAngle: (d) => GetAngle(d),
        getSize: (d) => GetSize(d),
    });

    const textLayer = new TextLayer({
        id: "passenger-vessel-names",
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

export default PassengerVesselLayer;