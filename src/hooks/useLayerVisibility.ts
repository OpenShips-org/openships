import { useState, useCallback, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getUserSettings, saveUserSettings } from '@/services/userSettingService';

export interface LayerVisibility {
  osm: boolean;
  wigVessels: boolean;
  fishingVessels: boolean;
  towingVessels: boolean;
  militaryVessels: boolean;
  pleasureCrafts: boolean;
  highSpeedCrafts: boolean;
  tugs: boolean;
  lawEnforcement: boolean;
  medicalTransport: boolean;
  passengerVessels: boolean;
  cargoVessels: boolean;
  tankerVessels: boolean;
  sailingVessels: boolean;
  otherVessels: boolean;
  vesselNames: boolean;
  lighthouse: boolean;
}

const DEFAULT_VISIBILITY: LayerVisibility = {
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
};

export const useLayerVisibility = (isLoggedIn: boolean) => {
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(DEFAULT_VISIBILITY);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (isLoggedIn) {
          const settings = await getUserSettings('mapLayerVisibility');
          if (settings) {
            setLayerVisibility(prev => ({ ...prev, ...settings }));
          }
        } else {
          const savedSettings = localStorage.getItem('mapLayerVisibility');
          if (savedSettings) {
            setLayerVisibility(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
          }
        }
      } catch (err) {
        console.error('Error loading layer visibility settings:', err);
      }
    };
    
    loadSettings();
  }, [isLoggedIn]);

  const toggleLayer = useCallback((layerName: keyof LayerVisibility) => {
    setLayerVisibility(prev => {
      const newVisibility = { ...prev, [layerName]: !prev[layerName] };

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser && isLoggedIn) {
          saveUserSettings('mapLayerVisibility', newVisibility)
            .catch(err => console.error('Failed to save user settings:', err));
        } else {
          localStorage.setItem('mapLayerVisibility', JSON.stringify(newVisibility));
        }
      } catch (err) {
        console.error('Error saving layer visibility:', err);
      }

      return newVisibility;
    });
  }, [isLoggedIn]);

  return { layerVisibility, toggleLayer };
};