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

interface ViewportBounds {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

// Debounce helper function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Map = React.memo(({}) => {
    // Initial view state mit gespeicherten Werten oder Standardwerten
    const [viewState, setViewState] = useState(() => {
        // Versuchen, gespeicherte Koordinaten aus localStorage zu laden
        const savedPosition = localStorage.getItem('mapPosition');
        if (savedPosition) {
            try {
                return JSON.parse(savedPosition);
            } catch (e) {
                console.error('Fehler beim Parsen der gespeicherten Kartenposition:', e);
            }
        }
        
        // Standardwerte, falls keine gespeicherten Daten existieren
        return {
            longitude: 0,
            latitude: 0,
            zoom: 2,
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
    const updateViewportBounds = useCallback((viewState: any) => {
        const viewport = new WebMercatorViewport(viewState);
        const bounds = viewport.getBounds();
        
        setViewportBounds({
            minLon: bounds[0],
            minLat: bounds[1],
            maxLon: bounds[2],
            maxLat: bounds[3]
        });
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

    // Create vessel layers outside of useMemo to avoid hooks violation
    const wigVesselLayer = WIGVesselLayer({ visible: layerVisibility.wigVessels, viewportBounds });
    const fishingVesselLayer = FishingVesselLayer({ visible: layerVisibility.fishingVessels, viewportBounds });
    const towingVesselLayer = TowingVesselLayer({ visible: layerVisibility.towingVessels, viewportBounds });
    const militaryVesselLayer = MilitaryVesselLayer({ visible: layerVisibility.militaryVessels, viewportBounds });
    const pleasureCraftLayer = PleasureCraftLayer({ visible: layerVisibility.pleasureCrafts, viewportBounds });
    const hscLayer = HSCLayer({ visible: layerVisibility.highSpeedCrafts, viewportBounds });
    const tugLayer = TugLayer({ visible: layerVisibility.tugs, viewportBounds });
    const lawEnforcementLayer = LawEnforcementVesselLayer({ visible: layerVisibility.lawEnforcement, viewportBounds });
    const medicalTransportLayer = MedicalTransportLayer({ visible: layerVisibility.medicalTransport, viewportBounds });
    const passengerVesselLayer = PassengerVesselLayer({ visible: layerVisibility.passengerVessels, viewportBounds });
    const cargoVesselLayer = CargoVesselLayer({ visible: layerVisibility.cargoVessels, viewportBounds });
    const tankerVesselLayer = TankerVesselLayer({ visible: layerVisibility.tankerVessels, viewportBounds });
    const sailingVesselLayer = SailingVesselLayer({ visible: layerVisibility.sailingVessels, viewportBounds });
    const otherVesselLayer = OtherVesselLayer({ visible: layerVisibility.otherVessels, viewportBounds });

    // Memoize layers to prevent recreation on every render
    const layers = useMemo(() => {
        const visibleLayers = [];
        if (layerVisibility.osm) {
            visibleLayers.push(createOSMLayer());
        }
        if (layerVisibility.lighthouse) {
            // visibleLayers.push(createLighthouseLayer(lighthouses));
        }
        if (layerVisibility.wigVessels) {
            visibleLayers.push(wigVesselLayer);
        }
        if (layerVisibility.fishingVessels) {
            visibleLayers.push(fishingVesselLayer);
        }
        if (layerVisibility.towingVessels) {
            visibleLayers.push(towingVesselLayer);
        }
        if (layerVisibility.militaryVessels) {
            visibleLayers.push(militaryVesselLayer);
        }
        if (layerVisibility.pleasureCrafts) {
            visibleLayers.push(pleasureCraftLayer);
        }
        if (layerVisibility.highSpeedCrafts) {
            visibleLayers.push(hscLayer);
        }
        if (layerVisibility.tugs) {
            visibleLayers.push(tugLayer);
        }
        if (layerVisibility.lawEnforcement) {
            visibleLayers.push(lawEnforcementLayer);
        }
        if (layerVisibility.medicalTransport) {
            visibleLayers.push(medicalTransportLayer);
        }
        if (layerVisibility.passengerVessels) {
            visibleLayers.push(passengerVesselLayer);
        }
        if (layerVisibility.cargoVessels) {
            visibleLayers.push(cargoVesselLayer);
        }
        if (layerVisibility.tankerVessels) {
            visibleLayers.push(tankerVesselLayer);
        }
        if (layerVisibility.sailingVessels) {
            visibleLayers.push(sailingVesselLayer);
        }
        if (layerVisibility.otherVessels) {
            visibleLayers.push(otherVesselLayer);
        }
        return visibleLayers;
    }, [layerVisibility, wigVesselLayer, fishingVesselLayer, towingVesselLayer, militaryVesselLayer, pleasureCraftLayer, hscLayer, tugLayer, lawEnforcementLayer, medicalTransportLayer, passengerVesselLayer, cargoVesselLayer, tankerVesselLayer, sailingVesselLayer, otherVesselLayer]);

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
                            <div className="bg-white/70 p-2.5 rounded-full cursor-pointer text-xl hover:bg-white/90 transition-colors">
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

                                            {/* Wing in Ground Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="wig-vessel-layer"
                                                    checked={layerVisibility.wigVessels}
                                                    onCheckedChange={() => toggleLayer('wigVessels')}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor="wig-vessel-layer" className="text-sm">Wing in Ground Vessels</label>
                                            </div>

                                            {/* Fishing Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="fishing-vessel-layer"
                                                    checked={layerVisibility.fishingVessels}
                                                    onCheckedChange={() => toggleLayer('fishingVessels')}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor="fishing-vessel-layer" className="text-sm">Fishing Vessels</label>
                                            </div>      
                                            
                                            {/* Towing Vessels */}                                      {/* Towing Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="towing-vessel-layer"
                                                    checked={layerVisibility.towingVessels}
                                                    onCheckedChange={() => toggleLayer('towingVessels')}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor="towing-vessel-layer" className="text-sm">Towing Vessels</label>
                                            </div>

                                            {/* Military Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="military-vessel-layer"
                                                    checked={layerVisibility.militaryVessels}
                                                    onCheckedChange={() => toggleLayer('militaryVessels')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="military-vessel-layer" className="text-sm">Military Vessels</label>
                                            </div>

                                            {/* Sailing Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="sailing-vessel-layer"
                                                    checked={layerVisibility.sailingVessels}
                                                    onCheckedChange={() => toggleLayer('sailingVessels')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="sailing-vessel-layer" className="text-sm">Sailing Vessels</label>
                                            </div>

                                            {/* Pleasure Crafts */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="pleasure-craft-layer"
                                                    checked={layerVisibility.pleasureCrafts}
                                                    onCheckedChange={() => toggleLayer('pleasureCrafts')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="pleasure-craft-layer" className="text-sm">Pleasure Crafts</label>
                                            </div>

                                            {/* High Speed Crafts */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="hsc-layer"
                                                    checked={layerVisibility.highSpeedCrafts}
                                                    onCheckedChange={() => toggleLayer('highSpeedCrafts')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="hsc-layer" className="text-sm">High Speed Crafts</label>
                                            </div>

                                            {/* Tugs */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="tug-layer"
                                                    checked={layerVisibility.tugs}
                                                    onCheckedChange={() => toggleLayer('tugs')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="tug-layer" className="text-sm">Tugs</label>
                                            </div>

                                            {/* Law Enforcement */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="law-enforcement-layer"
                                                    checked={layerVisibility.lawEnforcement}
                                                    onCheckedChange={() => toggleLayer('lawEnforcement')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="law-enforcement-layer" className="text-sm">Law Enforcement</label>
                                            </div>

                                            {/* Medical Transport Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="medical-transport-layer"
                                                    checked={layerVisibility.medicalTransport}
                                                    onCheckedChange={() => toggleLayer('medicalTransport')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="medical-transport-layer" className="text-sm">Medical Transport</label>
                                            </div>

                                            {/* Passanger Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="passenger-vessel-layer"
                                                    checked={layerVisibility.passengerVessels}
                                                    onCheckedChange={() => toggleLayer('passengerVessels')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="passenger-vessel-layer" className="text-sm">Passenger Vessels</label>
                                            </div>

                                            {/* Cargo Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="cargo-vessel-layer"
                                                    checked={layerVisibility.cargoVessels}
                                                    onCheckedChange={() => toggleLayer('cargoVessels')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="cargo-vessel-layer" className="text-sm">Cargo Vessels</label>
                                            </div>
                                            
                                            {/* Tanker Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="tanker-vessel-layer"
                                                    checked={layerVisibility.tankerVessels}
                                                    onCheckedChange={() => toggleLayer('tankerVessels')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="tanker-vessel-layer" className="text-sm">Tankers</label>
                                            </div>
                                            
                                            {/* Other Vessels */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="other-vessel-layer"
                                                    checked={layerVisibility.otherVessels}
                                                    onCheckedChange={() => toggleLayer('otherVessels')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="other-vessel-layer" className="text-sm">Other Vessels</label>
                                            </div>

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