import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api_url } from '@/config';

export const useVesselSelection = (allLayers: any[], setViewState: any) => {
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const findVesselInLayers = useCallback((mmsi: string) => {
    if (!allLayers || allLayers.length === 0) return null;

    for (const layer of allLayers) {
      const data = (layer && (layer.props?.data ?? layer.props?.getData?.()));
      if (!Array.isArray(data)) continue;

      const found = data.find((d: any) => {
        if (!d) return false;
        const vesselMMSI = d.MMSI ?? d.mmsi ?? d.MMSI?.toString?.();
        return vesselMMSI?.toString() === mmsi.toString();
      });

      if (found) return found;
    }

    return null;
  }, [allLayers]);

  const fetchVesselByMMSI = useCallback(async (mmsi: string) => {
    try {
      const response = await fetch(`${api_url}/v1/vessels/position/${mmsi}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch vessel by MMSI:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const vesselMMSI = searchParams.get('selectedVessel');
    
    if (!vesselMMSI) {
      setSelectedVessel(null);
      setSidebarOpen(false);
      return;
    }

    let cancelled = false;

    const findAndSelect = async () => {
      try {
        const localVessel = findVesselInLayers(vesselMMSI);
        if (cancelled) return;

        if (localVessel) {
          setSelectedVessel(localVessel);
          setSidebarOpen(true);
          return;
        }

        const vesselData = await fetchVesselByMMSI(vesselMMSI);
        if (cancelled || !vesselData) return;

        if (vesselData.Latitude != null && vesselData.Longitude != null) {
          setViewState((prev: any) => ({
            ...prev,
            latitude: vesselData.Latitude,
            longitude: vesselData.Longitude,
            zoom: Math.max(prev.zoom, 10)
          }));
        }

        setSelectedVessel(vesselData);
        setSidebarOpen(true);
      } catch (err) {
        console.error('Error selecting vessel from search params:', err);
      }
    };

    findAndSelect();

    return () => { cancelled = true; };
  }, [searchParams, fetchVesselByMMSI, findVesselInLayers, setViewState]);

  const handleVesselSelect = useCallback((info: any) => {
    const isVesselClick = info.object && (info.layer?.id?.includes('vessel') || info.layer?.id?.includes('craft'));
    
    if (isVesselClick) {
      setSelectedVessel(info.object);
      setSearchParams({ selectedVessel: info.object.MMSI.toString() });
      setSidebarOpen(true);
    } else if (sidebarOpen) {
      setSearchParams({});
      setSelectedVessel(null);
      setSidebarOpen(false);
    }
  }, [setSearchParams, sidebarOpen]);

  const closeVesselSidebar = useCallback(() => {
    setSearchParams({});
    setSelectedVessel(null);
    setSidebarOpen(false);
  }, [setSearchParams]);

  return {
    selectedVessel,
    sidebarOpen,
    handleVesselSelect,
    closeVesselSidebar
  };
};