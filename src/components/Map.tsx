import React, { useState, useMemo, useCallback, useEffect } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { FaLayerGroup } from "react-icons/fa";

import DeckGL from '@deck.gl/react';
import { MapView, WebMercatorViewport } from '@deck.gl/core';

import useIsMobile from '@/hooks/isMobile';

import { createOSMLayer } from './mapLayers/Maps/OpenStreetMapLayer';

import WIGVesselLayer from './mapLayers/Vessels/WIGVesselLayer';
import FishingVesselLayer from './mapLayers/Vessels/FishingVesselLayer';
import TowingVesselLayer from './mapLayers/Vessels/TowingVesselLayer';
import MilitaryVesselLayer from './mapLayers/Vessels/MilitaryVesselLayer';
import PleasureCraftLayer from './mapLayers/Vessels/PleasureCraftLayer';
import HSCLayer from './mapLayers/Vessels/HSCLayer';
import TugLayer from './mapLayers/Vessels/TugLayer';
import LawEnforcementVesselLayer from './mapLayers/Vessels/LawEnforcementVesselLayer';
import MedicalTransportLayer from './mapLayers/Vessels/MedicalTransportLayer';
import PassengerVesselLayer from './mapLayers/Vessels/PassengerVesselLayer';
import CargoVesselLayer from './mapLayers/Vessels/CargoVesselLayer';
import TankerVesselLayer from './mapLayers/Vessels/TankerVesselLayer';
import SailingVesselLayer from './mapLayers/Vessels/SailingVesselLayer';
import OtherVesselLayer from './mapLayers/Vessels/OtherVesselLayer';

// Vessel Layer Configuration
const VESSEL_LAYER_CONFIG = [
  { key: 'wigVessels' as const, Component: WIGVesselLayer, label: 'Wing in Ground Vessels' },
  { key: 'fishingVessels' as const, Component: FishingVesselLayer, label: 'Fishing Vessels' },
  { key: 'towingVessels' as const, Component: TowingVesselLayer, label: 'Towing Vessels' },
  { key: 'militaryVessels' as const, Component: MilitaryVesselLayer, label: 'Military Vessels' },
  { key: 'sailingVessels' as const, Component: SailingVesselLayer, label: 'Sailing Vessels' },
  { key: 'pleasureCrafts' as const, Component: PleasureCraftLayer, label: 'Pleasure Crafts' },
  { key: 'highSpeedCrafts' as const, Component: HSCLayer, label: 'High Speed Crafts' },
  { key: 'tugs' as const, Component: TugLayer, label: 'Tugs' },
  { key: 'lawEnforcement' as const, Component: LawEnforcementVesselLayer, label: 'Law Enforcement' },
  { key: 'medicalTransport' as const, Component: MedicalTransportLayer, label: 'Medical Transport' },
  { key: 'passengerVessels' as const, Component: PassengerVesselLayer, label: 'Passenger Vessels' },
  { key: 'cargoVessels' as const, Component: CargoVesselLayer, label: 'Cargo Vessels' },
  { key: 'tankerVessels' as const, Component: TankerVesselLayer, label: 'Tankers' },
  { key: 'otherVessels' as const, Component: OtherVesselLayer, label: 'Other Vessels' },
];

interface ViewportBounds {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

// Debounce helper function
const debounce = (func: Function, delay: number) => {
  let timeoutId: number | undefined;
  return (...args: any[]) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

const Map = React.memo(({}) => {

    // Load initial view state from localStorage
    const [viewState, setViewState] = useState(() => {
        const savedPosition = localStorage.getItem('mapPosition');
        if (savedPosition) {
            try {
                const { latitude, longitude, zoom } = JSON.parse(savedPosition);
                return { latitude, longitude, zoom, pitch: 0, bearing: 0 };
            } catch (err) {
                console.error('Failed to parse saved map position:', err);
            }
        }
        return {
            latitude: 20,
            longitude: 0,
            zoom: 2,
            pitch: 0,
            bearing: 0
        };
    });

    const [layerVisibility, setLayerVisibility] = useState({
        osm: true,
        wigVessels: true,
        fishingVessels: true,
        towingVessels: true,
        militaryVessels: true,
        pleasureCrafts: true,
        highSpeedCrafts: true,
        tugs: true,
        lawEnforcement: true,
        medicalTransport: true,
        passengerVessels: true,
        cargoVessels: true,
        tankerVessels: true,
        sailingVessels: true,
        otherVessels: true,
        lighthouse: false,
    });

    const [viewportBounds, setViewportBounds] = useState<ViewportBounds>();
    
    // Debounced localStorage saving
    const savePositionToLocalStorage = useCallback(
        debounce((newViewState: any) => {
            const positionToSave = {
                longitude: newViewState.longitude,
                latitude: newViewState.latitude,
                zoom: newViewState.zoom,
            };
            localStorage.setItem('mapPosition', JSON.stringify(positionToSave));
        }, 300),
        []
    );

    // Update viewport bounds
    const updateViewportBounds = useCallback((vs: any) => {
        if (!vs) return;
        // WebMercatorViewport requires width/height for correct bounds calculation.
        // Use the current window size as DeckGL is full-screen in this app.
        try {
            const viewport = new WebMercatorViewport({
                ...vs,
                width: window.innerWidth,
                height: window.innerHeight
            });
            const bounds = viewport.getBounds();
            setViewportBounds({
                minLon: bounds[0],
                minLat: bounds[1],
                maxLon: bounds[2],
                maxLat: bounds[3]
            });
        } catch (err) {
            // Guard against any runtime errors from invalid view state
            console.error('Failed to update viewport bounds:', err);
        }
    }, []);

    // Initial viewport bounds
    useEffect(() => {
        updateViewportBounds(viewState);
    }, [viewState, updateViewportBounds]);

    // Memoized handler for view state changes
    const onViewStateChange = useCallback(({ viewState: newViewState }: { viewState: any }) => {
        setViewState(newViewState);
        savePositionToLocalStorage(newViewState);
        updateViewportBounds(newViewState);
    }, [savePositionToLocalStorage, updateViewportBounds]);

    // Create vessel layers dynamically based on configuration
    const vesselLayers = useMemo(() => 
        VESSEL_LAYER_CONFIG.map(({ key, Component }) => 
            Component({ visible: layerVisibility[key], viewportBounds })
        ), 
        [layerVisibility, viewportBounds]
    );

    // Memoize layers to prevent recreation on every render
    const layers = useMemo(() => {
        const visibleLayers = [];
        if (layerVisibility.osm) {
            visibleLayers.push(createOSMLayer());
        }
        if (layerVisibility.lighthouse) {
            // visibleLayers.push(createLighthouseLayer(lighthouses));
        }
        
        // Add all vessel layers based on visibility
        VESSEL_LAYER_CONFIG.forEach(({ key }, index) => {
            if (layerVisibility[key]) {
                visibleLayers.push(vesselLayers[index]);
            }
        });
        
        return visibleLayers;
    }, [layerVisibility, vesselLayers]);

    // Memoize controller options
    const controller = useMemo(() => ({
        scrollZoom: { smooth: true, speed: 0.1 },
        dragRotate: false,
        keyboard: true,
        touchRotate: false
    }), []);
    
    const toggleLayer = useCallback((layerName: keyof typeof layerVisibility) => {
        setLayerVisibility(prev => ({
            ...prev,
            [layerName]: !prev[layerName]
        }));
    }, []);

    const isMobile = useIsMobile();

    return (
        <>
            <DeckGL
                layers={layers} // Fixed unnecessary nesting
                views={new MapView({ repeat: true })}
                viewState={viewState}
                onViewStateChange={onViewStateChange}
                controller={controller}
                getTooltip={() => null}
                getCursor={() => 'grab'}
                style={{ position: 'absolute', width: '100vw', height: '100vh' }}
            >
                {/* Layer Control */}
                <div className={`absolute ${isMobile ? "top-6 right-6" : "top-20 right-4"} z-50`}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="bg-white/70 p-2.5 rounded-full cursor-pointer text-xl hover:bg-white/90 transition-colors dark:bg-gray-900 dark:text-white">
                                <FaLayerGroup />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-55 mr-3 mt-1">
                            <Accordion type="single" collapsible className="w-full">
                                
                                <AccordionItem value="layers">
                                    <AccordionTrigger className='cursor-pointer'>Maps</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-2 mt-2">
                                            
                                            {/* OpenStreetMap Layer */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="osm-layer"
                                                    checked={layerVisibility.osm}
                                                    onCheckedChange={() => toggleLayer('osm')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="osm-layer" className="text-sm">OpenStreetMap</label>
                                            </div>
                                        
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="buildings">
                                    <AccordionTrigger className='cursor-pointer'>Buildings</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-2 mt-2">
                                            
                                            {/* Ports */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="ports-layer"
                                                    checked={false}
                                                    onCheckedChange={() => {}}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor="ports-layer" className="text-sm">Ports</label>
                                            </div>

                                            {/* Lighthouses */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="lighthouse-layer"
                                                    checked={layerVisibility.lighthouse}
                                                    onCheckedChange={() => toggleLayer('lighthouse')}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor="lighthouse-layer" className="text-sm">Lighthouses</label>
                                            </div>
                                        
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="vessels">
                                    <AccordionTrigger className='cursor-pointer'>Vessels</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-2 mt-2">

                                            {VESSEL_LAYER_CONFIG.map(({ key, label }) => (
                                                <div key={key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${key}-layer`}
                                                        checked={layerVisibility[key]}
                                                        onCheckedChange={() => toggleLayer(key)}
                                                        className="cursor-pointer"
                                                    />
                                                    <label htmlFor={`${key}-layer`} className="text-sm">{label}</label>
                                                </div>
                                            ))}

                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>
                        </PopoverContent>
                    </Popover>
                </div>
            </DeckGL>
        </>
    );
});

export default Map;