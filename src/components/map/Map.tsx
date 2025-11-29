import React, { useState, useMemo, useEffect } from 'react';

// Deck.gl Imports
import DeckGL from '@deck.gl/react';
import { MapView } from '@deck.gl/core';
import useIsMobile from '@/hooks/isMobile';

// Hook Imports
import { useLayerVisibility } from '@/hooks/useLayerVisibility';
import { useMapPosition } from '@/hooks/useMapPosition';
import { useVesselSelection } from '@/hooks/useVesselSelection';

// Service Imports
import { IsLoggedIn } from '@/services/authService';

// Component Imports
import LayerControl from './LayerControl';
import VesselSidebar from './VesselSidebar';
import OsmWatermark from '../misc/osmWatermark';

// Import Vessel Layers
import WIGVesselLayer from './Vessels/WIGVesselLayer';
import FishingVesselLayer from './Vessels/FishingVesselLayer';
import TowingVesselLayer from './Vessels/TowingVesselLayer';
import MilitaryVesselLayer from './Vessels/MilitaryVesselLayer';
import PleasureCraftLayer from './Vessels/PleasureCraftLayer';
import HSCLayer from './Vessels/HSCLayer';
import TugLayer from './Vessels/TugLayer';
import LawEnforcementVesselLayer from './Vessels/LawEnforcementVesselLayer';
import MedicalTransportLayer from './Vessels/MedicalTransportLayer';
import PassengerVesselLayer from './Vessels/PassengerVesselLayer';
import CargoVesselLayer from './Vessels/CargoVesselLayer';
import TankerVesselLayer from './Vessels/TankerVesselLayer';
import SailingVesselLayer from './Vessels/SailingVesselLayer';
import OtherVesselLayer from './Vessels/OtherVesselLayer';

// Import Map Layers
import OpenStreetMapLayer from './Maps/OpenStreetMapLayer';

const Map = React.memo(() => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        IsLoggedIn()
            .then(setIsLoggedIn)
            .catch(() => setIsLoggedIn(false));
    }, []);

    const { layerVisibility, toggleLayer } = useLayerVisibility(isLoggedIn);
    const { viewState, setViewState, viewportBounds, onViewStateChange } = useMapPosition();

    const controller = useMemo(() => ({
        scrollZoom: { smooth: true, speed: 0.1 },
        dragRotate: false,
        keyboard: true,
        touchRotate: false
    }), []);

    // Call all map layer hooks at the top level
    const osmLayer = OpenStreetMapLayer({ visible: layerVisibility.osm });

    // Call all vessel layer hooks at the top level
    const wigVesselLayers = WIGVesselLayer({ visible: layerVisibility.wigVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const fishingVesselLayers = FishingVesselLayer({ visible: layerVisibility.fishingVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const towingVesselLayers = TowingVesselLayer({ visible: layerVisibility.towingVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const militaryVesselLayers = MilitaryVesselLayer({ visible: layerVisibility.militaryVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const sailingVesselLayers = SailingVesselLayer({ visible: layerVisibility.sailingVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const pleasureCraftLayers = PleasureCraftLayer({ visible: layerVisibility.pleasureCrafts, viewportBounds, showNames: layerVisibility.vesselNames });
    const hscLayers = HSCLayer({ visible: layerVisibility.highSpeedCrafts, viewportBounds, showNames: layerVisibility.vesselNames });
    const tugLayers = TugLayer({ visible: layerVisibility.tugs, viewportBounds, showNames: layerVisibility.vesselNames });
    const lawEnforcementLayers = LawEnforcementVesselLayer({ visible: layerVisibility.lawEnforcement, viewportBounds, showNames: layerVisibility.vesselNames });
    const medicalTransportLayers = MedicalTransportLayer({ visible: layerVisibility.medicalTransport, viewportBounds, showNames: layerVisibility.vesselNames });
    const passengerVesselLayers = PassengerVesselLayer({ visible: layerVisibility.passengerVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const cargoVesselLayers = CargoVesselLayer({ visible: layerVisibility.cargoVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const tankerVesselLayers = TankerVesselLayer({ visible: layerVisibility.tankerVessels, viewportBounds, showNames: layerVisibility.vesselNames });
    const otherVesselLayers = OtherVesselLayer({ visible: layerVisibility.otherVessels, viewportBounds, showNames: layerVisibility.vesselNames });

    // Combine all layers
    const allLayers = useMemo(() => {
        const layers: unknown[] = [];
        
        // Add OSM layer first (background)
        if (osmLayer) {
            layers.push(osmLayer);
        }
        
        // Add vessel layers
        const vesselLayerResults = [
            wigVesselLayers,
            fishingVesselLayers,
            towingVesselLayers,
            militaryVesselLayers,
            sailingVesselLayers,
            pleasureCraftLayers,
            hscLayers,
            tugLayers,
            lawEnforcementLayers,
            medicalTransportLayers,
            passengerVesselLayers,
            cargoVesselLayers,
            tankerVesselLayers,
            otherVesselLayers,
        ];

        vesselLayerResults.forEach(result => {
            if (Array.isArray(result)) {
                layers.push(...result);
            } else if (result) {
                layers.push(result);
            }
        });
        
        return layers;
    }, [
        osmLayer,
        wigVesselLayers,
        fishingVesselLayers,
        towingVesselLayers,
        militaryVesselLayers,
        sailingVesselLayers,
        pleasureCraftLayers,
        hscLayers,
        tugLayers,
        lawEnforcementLayers,
        medicalTransportLayers,
        passengerVesselLayers,
        cargoVesselLayers,
        tankerVesselLayers,
        otherVesselLayers,
    ]);

    const { selectedVessel, sidebarOpen, handleVesselSelect, closeVesselSidebar } = 
        useVesselSelection(allLayers, setViewState);

    return (
        <>
            <DeckGL
                layers={allLayers as any}
                views={new MapView({ repeat: true })}
                viewState={viewState}
                onViewStateChange={onViewStateChange}
                controller={controller}
                getTooltip={() => null}
                getCursor={() => 'grab'}
                style={{ position: 'absolute', width: '100vw', height: '100vh' }}
                onClick={handleVesselSelect}
            >
                {layerVisibility.osm && <OsmWatermark isMobile={isMobile} />}
                
                <LayerControl 
                    layerVisibility={layerVisibility}
                    toggleLayer={toggleLayer}
                    isMobile={isMobile}
                />
            </DeckGL>

            <VesselSidebar 
                vessel={selectedVessel}
                isOpen={sidebarOpen}
                onClose={closeVesselSidebar}
            />
        </>
    );
});

export default Map;