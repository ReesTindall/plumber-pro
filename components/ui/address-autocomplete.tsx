'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { loadGoogleMaps, parseAddressComponents, type PlaceDetails } from '@/lib/google-maps';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, placeDetails?: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address...",
  className = "",
  disabled = false,
  required = false
}: AddressAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        setIsLoading(true);
        await loadGoogleMaps();
        
        autocompleteService.current = new google.maps.places.AutocompleteService();
        
        // Create a map div for PlacesService (required but not displayed)
        const mapDiv = document.createElement('div');
        const map = new google.maps.Map(mapDiv, {
          center: { lat: 0, lng: 0 },
          zoom: 13
        });
        placesService.current = new google.maps.places.PlacesService(map);
        
        setIsGoogleMapsReady(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogleMaps();
  }, []);

  const fetchPredictions = async (input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }

    const request = {
      input,
      types: ['address'],
      componentRestrictions: { country: 'us' }, // Restrict to US addresses
    };

    autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setPredictions(predictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (isGoogleMapsReady) {
      fetchPredictions(newValue);
    }
  };

  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    const request = {
      placeId: prediction.place_id,
      fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const components = parseAddressComponents(place);
        const placeDetails: PlaceDetails = {
          formatted_address: place.formatted_address || '',
          place_id: place.place_id || '',
          components,
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
        };

        onChange(place.formatted_address || '', placeDetails);
        setShowPredictions(false);
        setPredictions([]);
      }
    });
  };

  const handleInputBlur = () => {
    // Delay hiding predictions to allow for selection
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          required={required}
          className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handlePredictionSelect(prediction)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-gray-900 font-medium">
                    {prediction.structured_formatting.main_text}
                  </span>
                  {prediction.structured_formatting.secondary_text && (
                    <span className="text-gray-500 ml-2">
                      {prediction.structured_formatting.secondary_text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading state for when Google Maps is not ready */}
      {!isGoogleMapsReady && !isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="text-xs text-gray-500">Loading Maps...</div>
        </div>
      )}
    </div>
  );
}