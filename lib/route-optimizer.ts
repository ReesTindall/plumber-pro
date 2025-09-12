import { geocodeAddress, type PlaceDetails } from './google-maps';

export interface RouteStop {
  id: string;
  address: string;
  customerName: string;
  timeWindow: string;
  jobType: string;
  estimatedDuration: number; // in minutes
  lat?: number;
  lng?: number;
  placeDetails?: PlaceDetails;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number; // in meters
  totalDuration: number; // in minutes
  googleMapsUrl: string;
}

export interface RouteOptimizationOptions {
  startLocation?: string; // Starting address (business location)
  endLocation?: string; // Ending address (return to start if not provided)
  avoidTolls?: boolean;
  optimizeFor?: 'distance' | 'time';
}

export class RouteOptimizer {
  private directionsService: google.maps.DirectionsService | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.google) {
      this.directionsService = new google.maps.DirectionsService();
    }
  }

  async ensureDirectionsService(): Promise<void> {
    if (!this.directionsService) {
      const { loadGoogleMaps } = await import('./google-maps');
      await loadGoogleMaps();
      this.directionsService = new google.maps.DirectionsService();
    }
  }

  async geocodeStops(stops: RouteStop[]): Promise<RouteStop[]> {
    const geocodedStops = await Promise.all(
      stops.map(async (stop) => {
        if (stop.lat && stop.lng) {
          return stop; // Already has coordinates
        }

        try {
          const placeDetails = await geocodeAddress(stop.address);
          if (placeDetails) {
            return {
              ...stop,
              lat: placeDetails.lat,
              lng: placeDetails.lng,
              placeDetails
            };
          }
        } catch (error) {
          console.error(`Failed to geocode address: ${stop.address}`, error);
        }

        return stop; // Return original if geocoding fails
      })
    );

    return geocodedStops;
  }

  optimizeStopOrder(stops: RouteStop[], startLat?: number, startLng?: number): RouteStop[] {
    if (stops.length <= 1) return stops;

    // Filter stops that have coordinates
    const validStops = stops.filter(stop => stop.lat && stop.lng);
    const invalidStops = stops.filter(stop => !stop.lat || !stop.lng);

    if (validStops.length <= 1) {
      return stops; // Can't optimize with less than 2 valid coordinates
    }

    // Simple nearest neighbor algorithm for TSP approximation
    const optimized: RouteStop[] = [];
    const remaining = [...validStops];
    
    let currentLat = startLat || validStops[0].lat!;
    let currentLng = startLng || validStops[0].lng!;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = this.calculateDistance(
        currentLat, 
        currentLng, 
        remaining[0].lat!, 
        remaining[0].lng!
      );

      // Find the nearest unvisited stop
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(
          currentLat,
          currentLng,
          remaining[i].lat!,
          remaining[i].lng!
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = i;
        }
      }

      const nextStop = remaining.splice(nearestIndex, 1)[0];
      optimized.push(nextStop);
      currentLat = nextStop.lat!;
      currentLng = nextStop.lng!;
    }

    // Add back any stops that couldn't be geocoded at the end
    return [...optimized, ...invalidStops];
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula for calculating distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async calculateRouteDetails(
    stops: RouteStop[],
    options: RouteOptimizationOptions = {}
  ): Promise<OptimizedRoute | null> {
    await this.ensureDirectionsService();
    
    if (!this.directionsService || stops.length === 0) {
      return null;
    }

    // Geocode all stops first
    const geocodedStops = await this.geocodeStops(stops);
    
    // Find start location coordinates
    let startLat: number | undefined;
    let startLng: number | undefined;
    
    if (options.startLocation) {
      const startPlace = await geocodeAddress(options.startLocation);
      if (startPlace) {
        startLat = startPlace.lat;
        startLng = startPlace.lng;
      }
    }

    // Optimize stop order
    const optimizedStops = this.optimizeStopOrder(geocodedStops, startLat, startLng);
    
    // Filter valid stops for route calculation
    const validStops = optimizedStops.filter(stop => stop.lat && stop.lng);
    
    if (validStops.length === 0) {
      return {
        stops: optimizedStops,
        totalDistance: 0,
        totalDuration: 0,
        googleMapsUrl: this.generateGoogleMapsUrl(optimizedStops, options)
      };
    }

    try {
      const origin = options.startLocation || `${validStops[0].lat},${validStops[0].lng}`;
      const destination = options.endLocation || origin;
      
      // Use only middle stops as waypoints (Google Maps API limit is 25 waypoints)
      const waypoints = validStops.slice(0, -1).slice(0, 23).map(stop => ({
        location: `${stop.lat},${stop.lng}`,
        stopover: true
      }));

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        this.directionsService!.route({
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidTolls: options.avoidTolls || false,
        }, (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;

      result.routes[0].legs.forEach(leg => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      // Reorder stops based on Google's optimization
      let reorderedStops = [...optimizedStops];
      if (result.routes[0].waypoint_order) {
        const waypointOrder = result.routes[0].waypoint_order;
        reorderedStops = waypointOrder.map(index => validStops[index]);
      }

      return {
        stops: reorderedStops,
        totalDistance,
        totalDuration: totalDuration / 60, // Convert to minutes
        googleMapsUrl: this.generateGoogleMapsUrl(reorderedStops, options)
      };

    } catch (error) {
      console.error('Route calculation failed:', error);
      
      // Fallback: return optimized stops with estimated values
      const totalEstimatedDuration = optimizedStops.reduce((sum, stop) => sum + stop.estimatedDuration, 0);
      
      return {
        stops: optimizedStops,
        totalDistance: 0, // Would need to calculate manually
        totalDuration: totalEstimatedDuration,
        googleMapsUrl: this.generateGoogleMapsUrl(optimizedStops, options)
      };
    }
  }

  private generateGoogleMapsUrl(stops: RouteStop[], options: RouteOptimizationOptions): string {
    if (stops.length === 0) return '';

    const baseUrl = 'https://www.google.com/maps/dir/';
    const validStops = stops.filter(stop => stop.address);
    
    if (validStops.length === 0) return baseUrl;

    let url = baseUrl;
    
    // Add starting location if specified
    if (options.startLocation) {
      url += encodeURIComponent(options.startLocation) + '/';
    }
    
    // Add all stops
    validStops.forEach(stop => {
      url += encodeURIComponent(stop.address) + '/';
    });
    
    // Add ending location if specified and different from start
    if (options.endLocation && options.endLocation !== options.startLocation) {
      url += encodeURIComponent(options.endLocation) + '/';
    }

    // Add route options
    const params = [];
    if (options.avoidTolls) params.push('avoid=tolls');
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return url;
  }
}

// Utility function for quick route optimization
export async function optimizeRoute(
  stops: RouteStop[], 
  options: RouteOptimizationOptions = {}
): Promise<OptimizedRoute | null> {
  const optimizer = new RouteOptimizer();
  return optimizer.calculateRouteDetails(stops, options);
}