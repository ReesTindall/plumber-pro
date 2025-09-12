'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppError, ErrorCodes } from '@/lib/errors';
import { Search, X, Calendar, Clock } from 'lucide-react';
import AddressAutocomplete from '@/components/ui/address-autocomplete';
import { type PlaceDetails } from '@/lib/google-maps';

interface Customer {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

interface QuickCustomer {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

interface JobFormData {
  // Customer fields
  customerId?: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  saveCustomer: boolean;
  
  // Job fields
  scheduledDate: string;
  timeWindow: string;
  type: string;
  notes: string;
  
  // Address details from Google Places
  placeDetails?: PlaceDetails;
}

const JOB_TYPES = [
  'Drain Cleaning',
  'Leak Repair',
  'Toilet Repair',
  'Faucet Installation',
  'Water Heater Service',
  'Pipe Repair',
  'Emergency Call',
  'Inspection',
  'Other'
];

const TIME_WINDOWS = [
  'Morning (8am-12pm)',
  'Afternoon (12pm-5pm)', 
  'Evening (5pm-8pm)',
  'All Day',
  'Emergency (ASAP)'
];

export default function NewJobPage() {
  const [formData, setFormData] = useState<JobFormData>({
    customerId: undefined,
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    saveCustomer: false,
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindow: 'Afternoon (12pm-5pm)',
    type: '',
    notes: ''
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState<string>('');
  
  const router = useRouter();
  const supabase = createClient();

  // Load customers for search
  useEffect(() => {
    loadCustomers();
    loadAutoSavedData();
  }, []);

  // Auto-save form data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.customerName || formData.type) {
        localStorage.setItem('newJobForm', JSON.stringify(formData));
        setAutoSave('Auto-saved');
        setTimeout(() => setAutoSave(''), 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  const loadCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadAutoSavedData = () => {
    const saved = localStorage.getItem('newJobForm');
    if (saved) {
      setFormData(JSON.parse(saved));
      setAutoSave('Previous data restored');
      setTimeout(() => setAutoSave(''), 3000);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectCustomer = (customer: Customer) => {
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
      customerAddress: customer.address,
      customerPhone: customer.phone || '',
      customerEmail: customer.email || '',
      saveCustomer: false
    });
    setShowCustomerSearch(false);
    setSearchTerm('');
  };

  const clearCustomerSelection = () => {
    setFormData({
      ...formData,
      customerId: undefined,
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      customerEmail: '',
      saveCustomer: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new AppError(ErrorCodes.AUTH_UNAUTHORIZED, 'Please sign in');
      }

      // Prepare job data
      const jobData = {
        user_id: user.id,
        customer_id: formData.customerId || null,
        quick_customer: formData.customerId ? null : {
          name: formData.customerName,
          address: formData.customerAddress,
          phone: formData.customerPhone || null,
          email: formData.customerEmail || null
        },
        scheduled_date: formData.scheduledDate,
        time_window: formData.timeWindow,
        type: formData.type,
        notes: formData.notes || null,
        status: 'scheduled'
      };

      // If saving customer and not using existing customer
      if (formData.saveCustomer && !formData.customerId && formData.customerName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: customerData, error: customerError } = await (supabase as any)
          .from('customers')
          .insert([{
            user_id: user.id,
            name: formData.customerName,
            address: formData.customerAddress,
            phone: formData.customerPhone || null,
            email: formData.customerEmail || null
          }])
          .select()
          .single();

        if (customerError) {
          console.error('Customer creation error:', customerError);
          // Continue with quick customer if customer creation fails
        } else if (customerData) {
          jobData.customer_id = customerData.id;
          jobData.quick_customer = null;
        }
      }

      // Create the job
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: jobError } = await (supabase as any)
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (jobError) throw jobError;

      // Clear auto-saved data
      localStorage.removeItem('newJobForm');
      
      // Redirect to jobs list
      router.push('/dashboard/jobs');
    } catch (error) {
      console.error('Job creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Schedule New Job</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a new job and customer in one simple form.
            {autoSave && (
              <span className="ml-2 text-green-600 text-xs">
                ✓ {autoSave}
              </span>
            )}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
              <button
                type="button"
                onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Search className="h-4 w-4 mr-1" />
                Search Existing
              </button>
            </div>

            {showCustomerSearch && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomerSearch(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {filteredCustomers.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left p-3 bg-white rounded border hover:bg-gray-50"
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.address}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No customers found. Start typing below to create a new one.
                  </p>
                )}
              </div>
            )}

            {formData.customerId && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                <span className="text-sm text-green-700">
                  Using existing customer: {formData.customerName}
                </span>
                <button
                  type="button"
                  onClick={clearCustomerSelection}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <AddressAutocomplete
                  value={formData.customerAddress}
                  onChange={(address, placeDetails) => {
                    setFormData({ 
                      ...formData, 
                      customerAddress: address,
                      placeDetails
                    });
                  }}
                  placeholder="Start typing an address..."
                  required
                  className="mt-1"
                />
                {formData.placeDetails && (
                  <p className="mt-1 text-xs text-gray-500">
                    📍 Verified address with GPS coordinates
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {!formData.customerId && (
                <div className="flex items-center">
                  <input
                    id="saveCustomer"
                    type="checkbox"
                    checked={formData.saveCustomer}
                    onChange={(e) => setFormData({ ...formData, saveCustomer: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveCustomer" className="ml-2 block text-sm text-gray-900">
                    Save as permanent customer
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Job Details Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Job Details</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="scheduledDate"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="timeWindow" className="block text-sm font-medium text-gray-700">
                  Time Window *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="timeWindow"
                    required
                    value={formData.timeWindow}
                    onChange={(e) => setFormData({ ...formData, timeWindow: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {TIME_WINDOWS.map((window) => (
                      <option key={window} value={window}>
                        {window}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Service Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select service type...</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes & Special Instructions
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional details about the job..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}