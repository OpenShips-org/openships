import { useEffect, useState, useRef, useCallback } from "react";
import { api_url } from "@/config";
import type ViewportBounds from "@/interfaces/ViewportBounds";
import type { VesselPosition } from "@/types/VesselTypes";

interface UseVesselPositionOptions {
    visible: boolean;
    viewportBounds?: ViewportBounds;
    vesselTypes: string; // Comma-separated string of vessel type codes
    debounceMs?: number; // Optional debounce time in milliseconds
    refreshIntervalMs?: number; // Optional refresh interval in milliseconds
}

export function useVesselPosition({ 
    visible, 
    viewportBounds,
    vesselTypes,
    debounceMs = 250,
    refreshIntervalMs = 30000 
}: UseVesselPositionOptions) {
    const [vessels, setVessels] = useState<VesselPosition[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentViewportBoundsRef = useRef<ViewportBounds | undefined>(viewportBounds);

    const fetchVessels = useCallback(async (bounds: ViewportBounds) => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
            minLat: bounds.minLat.toString(),
            maxLat: bounds.maxLat.toString(),
            minLon: bounds.minLon.toString(),
            maxLon: bounds.maxLon.toString(),
            vesselTypes
        });

        try {
            const response = await fetch(`${api_url}/v1/vessels/position/all?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setVessels(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [vesselTypes]);

    currentViewportBoundsRef.current = viewportBounds;

    useEffect(() => {
        if (!visible || !viewportBounds) return;

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (currentViewportBoundsRef.current) {
                fetchVessels(currentViewportBoundsRef.current);
            }
        }, debounceMs);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [visible, viewportBounds, fetchVessels, debounceMs]);

    useEffect(() => {
        if (!visible || refreshIntervalMs <= 0) return;
        
        const intervalId = setInterval(() => {
            if (currentViewportBoundsRef.current) {
                fetchVessels(currentViewportBoundsRef.current);
            }
        }, refreshIntervalMs);
    
        return () => clearInterval(intervalId);
    }, [visible, fetchVessels, refreshIntervalMs]);

    return { vessels, isLoading, error };
}