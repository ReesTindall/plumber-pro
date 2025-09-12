interface PlaceResult {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
}

export interface PlaceDetails {
  formatted_address: string;
  place_id: string;
  components: AddressComponents;
  lat: number;
  lng: number;
}

let isGoogleMapsLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps can only be loaded in the browser'));
      return;
    }

    if (window.google && window.google.maps) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const parseAddressComponents = (place: google.maps.places.PlaceResult): AddressComponents => {
  const components: AddressComponents = {};

  if (place.address_components) {
    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes('street_number')) {
        components.street_number = component.long_name;
      } else if (types.includes('route')) {
        components.route = component.long_name;
      } else if (types.includes('locality')) {
        components.locality = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.administrative_area_level_1 = component.short_name;
      } else if (types.includes('postal_code')) {
        components.postal_code = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
      }
    });
  }

  return components;
};

export const formatAddress = (components: AddressComponents): string => {
  const parts = [];
  
  if (components.street_number && components.route) {
    parts.push(`${components.street_number} ${components.route}`);
  } else if (components.route) {
    parts.push(components.route);
  }
  
  if (components.locality) {
    parts.push(components.locality);
  }
  
  if (components.administrative_area_level_1) {
    parts.push(components.administrative_area_level_1);
  }
  
  if (components.postal_code) {
    parts.push(components.postal_code);
  }

  return parts.join(', ');
};

export const geocodeAddress = async (address: string): Promise<PlaceDetails | null> => {
  await loadGoogleMaps();

  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const components = parseAddressComponents(result);
        
        resolve({
          formatted_address: result.formatted_address || '',
          place_id: result.place_id || '',
          components,
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
        });
      } else {
        resolve(null);
      }
    });
  });
};

declare global {
  interface Window {
    google: typeof google;
  }
}