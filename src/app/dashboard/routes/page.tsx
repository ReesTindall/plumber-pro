'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSession } from '@/components/session-provider';
import { optimizeRoute, type RouteStop, type OptimizedRoute } from '@/lib/route-optimizer';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Users,
  ExternalLink,
  Loader2,
  Calendar,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Job {
  id: string;
  scheduled_date: string;
  time_window: string;
  type: string;
  status: string;
  customers?: {
    name: string;
    address: string;
  };
  quick_customer?: {
    name: string;
    address: string;
  };
}

export default function RoutesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessAddress, setBusinessAddress] = useState<string>('');

  const router = useRouter();
  const supabase = createClient();
  const { user: sessionUser, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (sessionLoading) return;
    
    if (!sessionUser) {
      router.push('/login');
      return;
    }

    loadJobsForDate();
    loadBusinessAddress();
  }, [sessionUser, sessionLoading, router, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBusinessAddress = async () => {
    if (!sessionUser) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('users')
        .select('business_address')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.error('Error loading business address:', error);
      } else if (data?.business_address) {
        setBusinessAddress(data.business_address);
      }
    } catch (err) {
      console.error('Error loading business address:', err);
    }
  };

  const loadJobsForDate = async () => {
    if (!sessionUser) return;

    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('jobs')
        .select(`
          id,
          scheduled_date,
          time_window,
          type,
          status,
          customers (
            name,
            address
          ),
          quick_customer
        `)
        .eq('user_id', sessionUser.id)
        .eq('scheduled_date', selectedDate)
        .neq('status', 'cancelled')
        .order('time_window');

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const optimizeJobRoute = async () => {
    if (jobs.length === 0) return;

    setOptimizing(true);
    setError(null);

    try {
      const stops: RouteStop[] = jobs.map(job => {
        const customerName = job.customers?.name || job.quick_customer?.name || 'Unknown Customer';
        const address = job.customers?.address || job.quick_customer?.address || '';
        
        return {
          id: job.id,
          address,
          customerName,
          timeWindow: job.time_window,
          jobType: job.type,
          estimatedDuration: 60 // Default 1 hour per job
        };
      }).filter(stop => stop.address); // Only include jobs with addresses

      if (stops.length === 0) {
        setError('No jobs with valid addresses found for this date');
        return;
      }

      const result = await optimizeRoute(stops, {
        startLocation: businessAddress || undefined,
        endLocation: businessAddress || undefined,
        avoidTolls: false,
        optimizeFor: 'time'
      });

      if (result) {
        setOptimizedRoute(result);
      } else {
        setError('Failed to optimize route. Please try again.');
      }
    } catch (err) {
      console.error('Error optimizing route:', err);
      setError(err instanceof Error ? err.message : 'Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (meters: number): string => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
  };

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">
          {sessionLoading ? 'Checking authentication...' : 'Loading jobs...'}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Route Optimization</h1>
          <p className="mt-1 text-sm text-gray-600">
            Optimize your daily routes to save time and fuel costs.
          </p>
        </div>

        {/* Date and Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={loadJobsForDate}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Jobs
              </button>
              
              <button
                onClick={optimizeJobRoute}
                disabled={optimizing || jobs.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {optimizing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Optimize Route
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs scheduled</h3>
            <p className="text-gray-500 mb-4">
              No jobs found for {new Date(selectedDate).toLocaleDateString()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Jobs List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Scheduled Jobs ({jobs.length})
                </h3>
                
                <div className="space-y-3">
                  {jobs.map((job, index) => {
                    const customerName = job.customers?.name || job.quick_customer?.name || 'Unknown Customer';
                    const address = job.customers?.address || job.quick_customer?.address || 'No address';
                    
                    return (
                      <div key={job.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{customerName}</p>
                          <p className="text-sm text-gray-500">{job.type}</p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {job.time_window}
                          </div>
                          {address && (
                            <div className="flex items-start text-xs text-gray-400 mt-1">
                              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="break-all">{address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Optimized Route */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Optimized Route
                  </h3>
                  {optimizedRoute && (
                    <a
                      href={optimizedRoute.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in Maps
                    </a>
                  )}
                </div>

                {!optimizedRoute ? (
                  <div className="text-center py-8">
                    <Navigation className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click "Optimize Route" to calculate the best route for your jobs.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Route Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <Navigation className="h-5 w-5 text-blue-600" />
                          <div className="ml-2">
                            <p className="text-xs text-gray-600">Total Distance</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {optimizedRoute.totalDistance > 0 
                                ? formatDistance(optimizedRoute.totalDistance)
                                : 'Calculating...'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-green-600" />
                          <div className="ml-2">
                            <p className="text-xs text-gray-600">Estimated Time</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDuration(optimizedRoute.totalDuration)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optimized Stop List */}
                    <div className="space-y-3">
                      {businessAddress && (
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                            S
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">Start: Business Location</p>
                            <div className="flex items-start text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="break-all">{businessAddress}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {optimizedRoute.stops.map((stop, index) => (
                        <div key={stop.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-md">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{stop.customerName}</p>
                            <p className="text-sm text-gray-500">{stop.jobType}</p>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {stop.timeWindow} • {formatDuration(stop.estimatedDuration)}
                            </div>
                            {stop.address && (
                              <div className="flex items-start text-xs text-gray-400 mt-1">
                                <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span className="break-all">{stop.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {businessAddress && (
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                            E
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">End: Return to Base</p>
                            <div className="flex items-start text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="break-all">{businessAddress}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}