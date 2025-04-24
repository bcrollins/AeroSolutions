import useLocalStorage from './useLocalStorage';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  enableNotifications?: boolean;
  enableSounds?: boolean;
  enableAnimations?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  dashboardLayout?: 'grid' | 'list';
  compactView?: boolean;
  savedFilters?: Record<string, unknown>;
  recentSearches?: string[];
  closedBanners?: string[];
  completedTours?: string[];
  sidebarCollapsed?: boolean;
  lastActivePage?: string;
  [key: string]: any; // Allow for custom preferences
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en-US',
  enableNotifications: true,
  enableSounds: true,
  enableAnimations: true,
  fontSize: 'medium',
  dashboardLayout: 'grid',
  compactView: false,
  savedFilters: {},
  recentSearches: [],
  closedBanners: [],
  completedTours: [],
  sidebarCollapsed: false,
};

/**
 * Hook for managing user preferences
 * @returns Tuple with preferences object and preference operations
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'rollinsx_user_preferences',
    defaultPreferences
  );

  /**
   * Update a specific preference
   */
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Reset all preferences to default values
   */
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  /**
   * Add an item to an array preference
   */
  const addToArrayPreference = <K extends keyof UserPreferences>(
    key: K,
    value: any,
    maxLength = 10
  ) => {
    setPreferences((prev) => {
      const currentArray = Array.isArray(prev[key]) ? prev[key] as any[] : [];
      
      // Remove the value if it already exists (to move it to the front)
      const filteredArray = currentArray.filter((item) => item !== value);
      
      // Add the new value to the front of the array
      const newArray = [value, ...filteredArray].slice(0, maxLength);
      
      return {
        ...prev,
        [key]: newArray,
      };
    });
  };

  /**
   * Remove an item from an array preference
   */
  const removeFromArrayPreference = <K extends keyof UserPreferences>(
    key: K,
    value: any
  ) => {
    setPreferences((prev) => {
      const currentArray = Array.isArray(prev[key]) ? prev[key] as any[] : [];
      
      // Remove the value from the array
      const newArray = currentArray.filter((item) => item !== value);
      
      return {
        ...prev,
        [key]: newArray,
      };
    });
  };

  /**
   * Check if an array preference contains a specific value
   */
  const arrayPreferenceIncludes = <K extends keyof UserPreferences>(
    key: K,
    value: any
  ): boolean => {
    const array = preferences[key];
    return Array.isArray(array) ? array.includes(value) : false;
  };

  /**
   * Mark a tour as completed
   */
  const completeTour = (tourId: string) => {
    addToArrayPreference('completedTours', tourId);
  };

  /**
   * Check if a tour has been completed
   */
  const isTourCompleted = (tourId: string): boolean => {
    return arrayPreferenceIncludes('completedTours', tourId);
  };

  /**
   * Close a banner by ID
   */
  const closeBanner = (bannerId: string) => {
    addToArrayPreference('closedBanners', bannerId);
  };

  /**
   * Check if a banner has been closed
   */
  const isBannerClosed = (bannerId: string): boolean => {
    return arrayPreferenceIncludes('closedBanners', bannerId);
  };

  /**
   * Add a recent search
   */
  const addRecentSearch = (search: string) => {
    // Don't add empty searches
    if (!search.trim()) return;
    
    addToArrayPreference('recentSearches', search, 5);
  };

  /**
   * Clear all recent searches
   */
  const clearRecentSearches = () => {
    updatePreference('recentSearches', []);
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    addToArrayPreference,
    removeFromArrayPreference,
    arrayPreferenceIncludes,
    completeTour,
    isTourCompleted,
    closeBanner,
    isBannerClosed,
    addRecentSearch,
    clearRecentSearches,
  };
}