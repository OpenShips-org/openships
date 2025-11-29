import { useState, useCallback, useEffect } from 'react';
import { WebMercatorViewport } from '@deck.gl/core';
import { debounce } from '@/lib/debounce';
import type ViewportBounds from '@/interfaces/ViewportBounds';

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

const loadInitialViewState = (): ViewState => {
  const savedPosition = localStorage.getItem('mapPosition');
  if (savedPosition) {
    try {
      const { latitude, longitude, zoom } = JSON.parse(savedPosition);
      return { latitude, longitude, zoom, pitch: 0, bearing: 0 };
    } catch (err) {
      console.error('Failed to parse saved map position:', err);
    }
  }
  return { latitude: 20, longitude: 0, zoom: 2, pitch: 0, bearing: 0 };
};

export const useMapPosition = () => {
  const [viewState, setViewState] = useState<ViewState>(loadInitialViewState);
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds>();

  const savePositionToLocalStorage = useCallback(
    debounce((newViewState: ViewState) => {
      const positionToSave = {
        longitude: newViewState.longitude,
        latitude: newViewState.latitude,
        zoom: newViewState.zoom,
      };
      localStorage.setItem('mapPosition', JSON.stringify(positionToSave));
    }, 300),
    []
  );

  const updateViewportBounds = useCallback((vs: ViewState) => {
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

  useEffect(() => {
    updateViewportBounds(viewState);
  }, [viewState, updateViewportBounds]);

  const onViewStateChange = useCallback(({ viewState: newViewState }: any) => {
    setViewState(newViewState);
    savePositionToLocalStorage(newViewState);
    updateViewportBounds(newViewState);
  }, [savePositionToLocalStorage, updateViewportBounds]);

  return { viewState, setViewState, viewportBounds, onViewStateChange };
};