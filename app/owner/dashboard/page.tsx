'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Calendar, 
  Users, 
  TrendingUp, 
  MapPin, 
  Settings,
  Plus,
  BarChart3,
  Clock,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

function OwnerDashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // ProtectedRoute will handle this
  }

  // Placeholder data - In real app, this would come from API
  const dashboardStats = {
    totalTurfs: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    pendingBookings: 0,
    activeBookings: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-2 mr-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-600">TurfBook</h1>
                  <p className="text-xs text-gray-500">Owner Dashboard</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.businessName || 'Turf Owner'}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Owner
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="text-gray-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Manage your turf facilities and bookings from your dashboard.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Turfs</CardTitle>
              <Building className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalTurfs}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.totalTurfs === 0 ? 'No turfs added yet' : 'Active facilities'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                All-time bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeBookings}</div>
              <p className="text-xs text-muted-foreground">
                Current bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with managing your turf business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Building className="h-4 w-4 mr-2" />
                Add New Turf
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Bookings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates on your turfs and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.totalTurfs === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No activity yet</p>
                    <p className="text-sm">Add your first turf to get started!</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        {dashboardStats.totalTurfs === 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🚀 Getting Started</CardTitle>
              <CardDescription className="text-blue-700">
                Welcome to TurfBook! Here's how to set up your turf business:
              </CardDescription>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ol className="list-decimal list-inside space-y-2">
                <li>Add your first turf facility with photos and details</li>
                <li>Set pricing and availability hours</li>
                <li>Configure booking rules and policies</li>
                <li>Start receiving bookings from customers!</li>
              </ol>
              <div className="mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Turf
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute requireRole="owner">
      <OwnerDashboard />
    </ProtectedRoute>
  );
}