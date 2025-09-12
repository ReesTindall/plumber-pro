'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useSession } from '@/components/session-provider';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  Filter,
  Search,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  scheduled_date: string;
  time_window: string;
  type: string;
  status: string;
  notes?: string;
  customers?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  quick_customer?: {
    name: string;
    address: string;
    phone?: string;
  };
}

const STATUS_COLORS = {
  'scheduled': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Jobs' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const router = useRouter();
  const supabase = createClient();
  const { user: sessionUser, loading: sessionLoading } = useSession();

  useEffect(() => {
    // Wait for session to load
    if (sessionLoading) return;
    
    // If no user after session loads, redirect to login
    if (!sessionUser) {
      router.push('/login');
      return;
    }

    // User is authenticated, load jobs data
    console.log('Loading jobs for user:', sessionUser.email);
    loadJobs(sessionUser);
  }, [sessionUser, sessionLoading, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter, dateFilter]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadJobs = async (user: any) => {
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
          notes,
          quick_customer,
          customers (
            id,
            name,
            address,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => {
        const customerName = job.customers?.name || job.quick_customer?.name || '';
        const customerAddress = job.customers?.address || job.quick_customer?.address || '';
        const customerPhone = job.customers?.phone || job.quick_customer?.phone || '';
        
        return (
          customerName.toLowerCase().includes(search) ||
          customerAddress.toLowerCase().includes(search) ||
          customerPhone.toLowerCase().includes(search) ||
          job.type.toLowerCase().includes(search) ||
          job.notes?.toLowerCase().includes(search)
        );
      });
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(job => job.scheduled_date === dateFilter);
    }

    setFilteredJobs(filtered);
  };

  const getCustomerInfo = (job: Job) => {
    if (job.customers) {
      return {
        name: job.customers.name,
        address: job.customers.address,
        phone: job.customers.phone
      };
    } else if (job.quick_customer) {
      return {
        name: job.quick_customer.name,
        address: job.quick_customer.address,
        phone: job.quick_customer.phone
      };
    }
    return { name: 'Unknown Customer', address: 'No address', phone: undefined };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const jobDate = date.toDateString();
    const todayString = today.toDateString();
    const tomorrowString = tomorrow.toDateString();
    
    if (jobDate === todayString) return 'Today';
    if (jobDate === tomorrowString) return 'Tomorrow';
    if (date < today) return 'Past';
    return 'Upcoming';
  };

  // Group jobs by date
  const groupedJobs = filteredJobs.reduce((groups: { [key: string]: Job[] }, job) => {
    const group = getDateGroup(job.scheduled_date);
    if (!groups[group]) groups[group] = [];
    groups[group].push(job);
    return groups;
  }, {});

  const groupOrder = ['Today', 'Tomorrow', 'Upcoming', 'Past'];
  const orderedGroups = groupOrder.filter(group => groupedJobs[group]?.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your scheduled jobs and service calls.
            </p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by customer, type, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="statusFilter" className="sr-only">Filter by status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dateFilter" className="sr-only">Filter by date</label>
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {orderedGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || dateFilter
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first job.'}
            </p>
            <Link
              href="/dashboard/jobs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orderedGroups.map((group) => (
              <div key={group} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">
                    {group} ({groupedJobs[group].length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {groupedJobs[group].map((job) => {
                    const customer = getCustomerInfo(job);
                    return (
                      <Link
                        key={job.id}
                        href={`/dashboard/jobs/${job.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-blue-600 truncate">
                                  {customer.name}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[job.status as keyof typeof STATUS_COLORS]}`}>
                                    {job.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {formatDate(job.scheduled_date)}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {job.time_window}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {job.type}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p className="truncate max-w-xs">{customer.address}</p>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}