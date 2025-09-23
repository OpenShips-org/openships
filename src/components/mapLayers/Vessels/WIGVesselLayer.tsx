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

function WIGVesselLayer({ 
    visible = true, 
    viewportBounds 
}: { 
    visible?: boolean;
    viewportBounds?: ViewportBounds;
} = {}): IconLayer {
    
    const [ WIGVessels, setWIGVessels ] = useState<VesselPosition[]>([]);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentViewportBoundsRef = useRef<ViewportBounds | undefined>(viewportBounds);

    const fetchWIGVessels = useCallback((bounds: ViewportBounds) => {
        const params = new URLSearchParams({
            minLat: bounds.minLat.toString(),
            maxLat: bounds.maxLat.toString(),
            minLon: bounds.minLon.toString(),
            maxLon: bounds.maxLon.toString(),
            vesselTypes: "20,21,22,23,24,25,26,27,28,29" // WIGVessels
        });

        fetch(`${api_url}/v1/vessels/position/all?${params}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setWIGVessels(data))
            .catch(error => console.error('Error fetching WIGVessels:', error));
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
                fetchWIGVessels(currentViewportBoundsRef.current);
            }
        }, 500); // Wait 500ms after user stops moving

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [visible, viewportBounds, fetchWIGVessels]);

    // Handle periodic updates
    useEffect(() => {
        if (!visible || !viewportBounds) return;

        const interval = setInterval(() => {
            if (currentViewportBoundsRef.current) {
                fetchWIGVessels(currentViewportBoundsRef.current);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [visible, fetchWIGVessels]);
        

    return new IconLayer({
        id: "wig-vessel-layer",
        data: WIGVessels,
        visible,
        pickable: true,
        getPosition: (d) => [d.longitude, d.latitude],
        getIcon: () => ({
            url: '/Ship-Icon.png',
            height: 1024,
            width: 720,
        }),
        getAngle: (d) => d.TrueHeading == 511 ? 0: 360 - (d.TrueHeading || 0),
        getSize: 40,
    });
}

export default WIGVesselLayer;