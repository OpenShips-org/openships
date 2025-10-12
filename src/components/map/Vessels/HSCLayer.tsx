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

function HSCLayer({ 
    visible = true, 
    viewportBounds 
}: { 
    visible?: boolean;
    viewportBounds?: ViewportBounds;
} = {}): IconLayer {
    
    const [ HighSpeedCrafts, setHighSpeedCrafts ] = useState<VesselPosition[]>([]);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentViewportBoundsRef = useRef<ViewportBounds | undefined>(viewportBounds);

    const fetchHighSpeedCrafts = useCallback((bounds: ViewportBounds) => {
        const params = new URLSearchParams({
            minLat: bounds.minLat.toString(),
            maxLat: bounds.maxLat.toString(),
            minLon: bounds.minLon.toString(),
            maxLon: bounds.maxLon.toString(),
            vesselTypes: "40,41,42,43,44,45,46,47,48,49" // High Speed Crafts
        });

        fetch(`${api_url}/v1/vessels/position/all?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setHighSpeedCrafts(data))
            .catch(error => console.error('Error fetching High Speed Crafts:', error));
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
                fetchHighSpeedCrafts(currentViewportBoundsRef.current);
            }
        }, 250); // Wait 500ms after user stops moving

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [visible, viewportBounds, fetchHighSpeedCrafts]);

    // Handle periodic updates
    useEffect(() => {
        if (!visible || !viewportBounds) return;

        const interval = setInterval(() => {
            if (currentViewportBoundsRef.current) {
                fetchHighSpeedCrafts(currentViewportBoundsRef.current);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [visible, fetchHighSpeedCrafts]);
        

    return new IconLayer({
        id: "hsc-layer",
        data: HighSpeedCrafts,
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

export default HSCLayer;