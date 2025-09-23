import { IconLayer } from "@deck.gl/layers";
import { useEffect, useState, useRef, useCallback } from "react";

import type { VesselPosition } from "@/types/VesselTypes";

import { api_url } from "@/config";

interface ViewportBounds {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

function CargoVesselLayer({ 
    visible = true, 
    viewportBounds 
}: { 
    visible?: boolean;
    viewportBounds?: ViewportBounds;
} = {}): IconLayer {
    
    const [ CargoVessels, setCargoVessels ] = useState<VesselPosition[]>([]);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentViewportBoundsRef = useRef<ViewportBounds | undefined>(viewportBounds);

    const fetchCargoVessels = useCallback((bounds: ViewportBounds) => {
        const params = new URLSearchParams({
            minLat: bounds.minLat.toString(),
            maxLat: bounds.maxLat.toString(),
            minLon: bounds.minLon.toString(),
            maxLon: bounds.maxLon.toString(),
            vesselTypes: "70,71,72,73,74,75,76,77,78,79" // Cargo Vessels (types 70-79)
        });

        fetch(`${api_url}/v1/vessels/position/all?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setCargoVessels(data))
            .catch(error => console.error('Error fetching Cargo Vessels:', error));
    }, []);

    // Update current bounds reference
    currentViewportBoundsRef.current = viewportBounds;

    // Handle viewport changes with debouncing
    useEffect(() => {
        if (!visible || !viewportBounds) return;

        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout to fetch data after user stops moving
        debounceTimeoutRef.current = setTimeout(() => {
            if (currentViewportBoundsRef.current) {
                fetchCargoVessels(currentViewportBoundsRef.current);
            }
        }, 250); // Wait 250ms after user stops moving

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [visible, viewportBounds, fetchCargoVessels]);

    // Handle periodic updates
    useEffect(() => {
        if (!visible || !viewportBounds) return;

        const interval = setInterval(() => {
            if (currentViewportBoundsRef.current) {
                fetchCargoVessels(currentViewportBoundsRef.current);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [visible, fetchCargoVessels]);
        

    return new IconLayer({
        id: "cargo-vessel-layer",
        data: CargoVessels,
        visible,
        pickable: true,
        getPosition: (d) => [d.Longitude, d.Latitude],
        getIcon: () => ({
            url: '/Ship-Icon.png',
            height: 512,
            width: 360,
        }),
        getAngle: (d) => d.TrueHeading == 511 ? 0: 360 - (d.TrueHeading || 0),
        getSize: 40,
    });
}

export default CargoVesselLayer;