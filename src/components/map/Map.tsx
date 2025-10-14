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

import { createOSMLayer } from './Maps/OpenStreetMapLayer';

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

import { IsLoggedIn } from '@/services/authService';
import { getAuth } from 'firebase/auth';

import { getUserSettings, saveUserSettings } from '@/services/userSettingService';

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
        vesselNames: false,
        lighthouse: false,
    });

    const [viewportBounds, setViewportBounds] = useState<ViewportBounds>();

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const loggedIn = await IsLoggedIn();
                setIsLoggedIn(loggedIn);
            } catch (err) {
                console.error('Error checking login status:', err);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);
    
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

    // Memoize controller options
    const controller = useMemo(() => ({
        scrollZoom: { smooth: true, speed: 0.1 },
        dragRotate: false,
        keyboard: true,
        touchRotate: false
    }), []);
    
    const toggleLayer = useCallback((layerName: keyof typeof layerVisibility) => {
        setLayerVisibility(prev => {
            const newVisibility = { ...prev, [layerName]: !prev[layerName] };
            logStateChange('Toggle layer', { layerName, newState: !prev[layerName] });

            try {
                // Double-check current auth state directly
                const auth = getAuth(); // Import getAuth from firebase/auth at the top
                const currentUser = auth.currentUser;

                if (currentUser && isLoggedIn) {
                    saveUserSettings('mapLayerVisibility', newVisibility)
                        .then(() => logStateChange('Saved to Firestore', newVisibility))
                        .catch(err => console.error('Failed to save user settings:', err));
                } else {
                    localStorage.setItem('mapLayerVisibility', JSON.stringify(newVisibility));
                    logStateChange('Saved to localStorage', newVisibility);
                }
            } catch (err) {
                console.error('Error saving layer visibility:', err);
            }

            return newVisibility;
        });
    }, [isLoggedIn]);

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
        const layers: any[] = [];
        
        if (layerVisibility.osm) {
            layers.push(createOSMLayer());
        }
        
        // Add vessel layers (handle both single layer and array)
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
        layerVisibility.osm,
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

    const isMobile = useIsMobile();

    const logStateChange = (source: string, data: any) => {
        console.log(`[${source}]`, data);
    };

    // Load user Settings from firestore if logged in, otherwise use localStorage
    useEffect(() => {
    const loadSettings = async () => {
        try {
            if (isLoggedIn) {
                const settings = await getUserSettings('mapLayerVisibility');
                if (settings) {
                    logStateChange('Firestore settings loaded', settings);
                    setLayerVisibility(prev => ({ ...prev, ...settings }));
                } else {
                    logStateChange('No Firestore settings found', null);
                }
            } else {
                const savedSettings = localStorage.getItem('mapLayerVisibility');
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings);
                    logStateChange('LocalStorage settings loaded', parsedSettings);
                    setLayerVisibility(prev => ({ ...prev, ...parsedSettings }));
                } else {
                    logStateChange('No localStorage settings found', null);
                }
            }
        } catch (err) {
            console.error('Error loading layer visibility settings:', err);
        }
    };
    
    loadSettings();
}, [isLoggedIn]);

    return (
        <>
            <DeckGL
                layers={allLayers}
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
                                                <label htmlFor="osm-layer" className="text-sm cursor-pointer">OpenStreetMap</label>
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
                                                <label htmlFor="ports-layer" className="text-sm cursor-pointer">Ports</label>
                                            </div>

                                            {/* Lighthouses */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="lighthouse-layer"
                                                    checked={layerVisibility.lighthouse}
                                                    onCheckedChange={() => toggleLayer('lighthouse')}
                                                    className='cursor-pointer'
                                                />
                                                <label htmlFor="lighthouse-layer" className="text-sm cursor-pointer">Lighthouses</label>
                                            </div>
                                        
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="vessels">
                                    <AccordionTrigger className='cursor-pointer'>Vessels</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col space-y-2 mt-2">

                                            {/* Vessel Names Toggle */}
                                            <div className="flex items-center space-x-2 pb-2 border-b">
                                                <Checkbox
                                                    id="vessel-names-layer"
                                                    checked={layerVisibility.vesselNames}
                                                    onCheckedChange={() => toggleLayer('vesselNames')}
                                                    className="cursor-pointer"
                                                />
                                                <label htmlFor="vessel-names-layer" className="text-sm font-semibold cursor-pointer">Show Vessel Names</label>
                                            </div>

                                            <hr />

                                            {VESSEL_LAYER_CONFIG.map(({ key, label }) => (
                                                <div key={key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${key}-layer`}
                                                        checked={layerVisibility[key]}
                                                        onCheckedChange={() => toggleLayer(key)}
                                                        className="cursor-pointer"
                                                    />
                                                    <label htmlFor={`${key}-layer`} className="text-sm cursor-pointer">{label}</label>
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