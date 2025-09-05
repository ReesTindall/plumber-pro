'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  todaysJobs: number;
  weeklyRevenue: number;
  activeCustomers: number;
  pendingEstimates: number;
}

interface UpcomingJob {
  id: string;
  customer_name: string;
  time_window: string;
  type: string;
  address: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaysJobs: 0,
    weeklyRevenue: 0,
    activeCustomers: 0,
    pendingEstimates: 0,
  });
  const [upcomingJobs, setUpcomingJobs] = useState<UpcomingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('business_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.business_name);
        }

        const today = new Date().toISOString().split('T')[0];
        
        const { count: todaysJobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('scheduled_date', today);

        const { data: todaysJobsData } = await supabase
          .from('jobs')
          .select(`
            id,
            time_window,
            type,
            customer_id,
            quick_customer,
            customers (
              name,
              address
            )
          `)
          .eq('user_id', user.id)
          .eq('scheduled_date', today)
          .order('time_window')
          .limit(5);

        const formattedJobs = todaysJobsData?.map(job => ({
          id: job.id,
          customer_name: job.customers?.name || (job.quick_customer as any)?.name || 'Unknown Customer',
          time_window: job.time_window,
          type: job.type,
          address: job.customers?.address || (job.quick_customer as any)?.address || 'No address',
        })) || [];

        setUpcomingJobs(formattedJobs);

        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('archived', false);

        const { count: pendingEstimatesCount } = await supabase
          .from('estimates')
          .select(`
            id,
            jobs!inner(user_id)
          `, { count: 'exact', head: true })
          .eq('jobs.user_id', user.id)
          .is('signed_at', null);

        setStats({
          todaysJobs: todaysJobsCount || 0,
          weeklyRevenue: 0,
          activeCustomers: customersCount || 0,
          pendingEstimates: pendingEstimatesCount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Today's Jobs",
      value: stats.todaysJobs,
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/dashboard/jobs',
    },
    {
      title: 'Weekly Revenue',
      value: `$${stats.weeklyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/dashboard/invoices',
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      icon: Users,
      color: 'bg-purple-500',
      link: '/dashboard/customers',
    },
    {
      title: 'Pending Estimates',
      value: stats.pendingEstimates,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/dashboard/estimates',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {userName || 'there'}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                href="/dashboard/jobs/new"
                className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">New Job</span>
                </div>
              </Link>
              
              <Link
                href="/dashboard/customers/new"
                className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">New Customer</span>
                </div>
              </Link>
              
              <Link
                href="/dashboard/routes"
                className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Optimize Routes</span>
                </div>
              </Link>
              
              <Link
                href="/dashboard/estimates/new"
                className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">New Estimate</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.link}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.title}
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Today's Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Today's Jobs
              </h3>
              <Link
                href="/dashboard/jobs"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {upcomingJobs.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No jobs scheduled for today</p>
                <Link
                  href="/dashboard/jobs/new"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Schedule a job
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {upcomingJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="block hover:bg-gray-50 px-4 py-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {job.customer_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {job.type} • {job.time_window}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {job.address}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}