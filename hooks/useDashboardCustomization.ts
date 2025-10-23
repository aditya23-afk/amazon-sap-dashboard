import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  toggleWidgetVisibility,
  reorderWidgets,
  saveLayout,
  loadLayout,
  deleteLayout,
  resetToDefaultLayout,
  updateUserPreferences,
  setRefreshInterval,
  loadFromLocalStorage,
  saveToLocalStorage,
} from '../store/slices/dashboardSlice';
import { setTheme } from '../store/slices/uiSlice';
import PreferencesService from '../services/preferencesService';

export const useDashboardCustomization = () => {
  const dispatch = useDispatch();
  const dashboardState = useSelector((state: RootState) => state.dashboard);
  const uiState = useSelector((state: RootState) => state.ui);

  // Load preferences on mount
  useEffect(() => {
    if (PreferencesService.isAvailable()) {
      dispatch(loadFromLocalStorage());
    }
  }, [dispatch]);

  // Auto-save preferences when state changes
  const autoSave = useCallback(() => {
    if (PreferencesService.isAvailable()) {
      dispatch(saveToLocalStorage());
    }
  }, [dispatch]);

  const customization = {
    // Widget visibility
    toggleWidgetVisibility: useCallback((widgetId: string) => {
      dispatch(toggleWidgetVisibility(widgetId));
      autoSave();
    }, [dispatch, autoSave]),

    // Widget reordering
    moveWidget: useCallback((widgetId: string, direction: 'up' | 'down') => {
      const { layout } = dashboardState;
      const currentIndex = layout.findIndex(w => w.id === widgetId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= layout.length) return;

      const newLayout = [...layout];
      const [movedWidget] = newLayout.splice(currentIndex, 1);
      newLayout.splice(newIndex, 0, movedWidget);

      const newOrder = newLayout.map(widget => widget.id);
      dispatch(reorderWidgets(newOrder));
      autoSave();
    }, [dispatch, autoSave, dashboardState.layout]),

    reorderWidgets: useCallback((newOrder: string[]) => {
      dispatch(reorderWidgets(newOrder));
      autoSave();
    }, [dispatch, autoSave]),

    // Layout management
    saveLayout: useCallback((name: string) => {
      dispatch(saveLayout({ name }));
      autoSave();
    }, [dispatch, autoSave]),

    loadLayout: useCallback((layoutId: string) => {
      dispatch(loadLayout(layoutId));
      autoSave();
    }, [dispatch, autoSave]),

    deleteLayout: useCallback((layoutId: string) => {
      dispatch(deleteLayout(layoutId));
      autoSave();
    }, [dispatch, autoSave]),

    resetToDefault: useCallback(() => {
      dispatch(resetToDefaultLayout());
      autoSave();
    }, [dispatch, autoSave]),

    // User preferences
    updatePreferences: useCallback((preferences: any) => {
      dispatch(updateUserPreferences(preferences));
      autoSave();
    }, [dispatch, autoSave]),

    setRefreshInterval: useCallback((interval: number) => {
      dispatch(setRefreshInterval(interval));
      autoSave();
    }, [dispatch, autoSave]),

    setTheme: useCallback((theme: 'light' | 'dark') => {
      dispatch(setTheme(theme));
      dispatch(updateUserPreferences({ theme }));
      autoSave();
    }, [dispatch, autoSave]),

    // Manual save/load
    saveToStorage: useCallback(() => {
      dispatch(saveToLocalStorage());
    }, [dispatch]),

    loadFromStorage: useCallback(() => {
      dispatch(loadFromLocalStorage());
    }, [dispatch]),

    // Clear all preferences
    clearPreferences: useCallback(() => {
      PreferencesService.clear();
      dispatch(resetToDefaultLayout());
    }, [dispatch]),
  };

  return {
    ...customization,
    state: {
      dashboard: dashboardState,
      ui: uiState,
    },
    isStorageAvailable: PreferencesService.isAvailable(),
  };
};

export default useDashboardCustomization;