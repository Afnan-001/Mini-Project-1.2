'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, User, Building, IndianRupee, MapPin, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import our custom components
import { UpiUploader } from '@/components/owner/UpiUploader';
import { TurfImagesUploader } from '@/components/owner/TurfImagesUploader';
import { SportsSelection } from '@/components/owner/SportsSelection';
import { AmenitiesSelector } from '@/components/owner/AmenitiesSelector';
import { AboutSection } from '@/components/owner/AboutSection';
import { SlotManager } from '@/components/owner/SlotManager';

interface CloudinaryImage {
  url: string;
  public_id: string;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface OwnerFormData {
  businessName: string;
  phone: string;
  upiQrCode: CloudinaryImage | null;
  turfImages: CloudinaryImage[];
  sportsOffered: string[];
  customSport: string;
  amenities: string[];
  about: string;
  availableSlots: TimeSlot[];
  pricing: number;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

function TurfOwnerDashboard() {
  const { user, firebaseUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OwnerFormData>({
    businessName: '',
    phone: '',
    upiQrCode: null,
    turfImages: [],
    sportsOffered: [],
    customSport: '',
    amenities: [],
    about: '',
    availableSlots: [],
    pricing: 0,
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  // Load existing owner data on component mount
  useEffect(() => {
    const loadOwnerData = async () => {
      if (!firebaseUser) return;
      
      setLoading(true);
      try {
        const idToken = await firebaseUser.getIdToken();
        
        // Try to load from the new Turf collection first
        const turfResponse = await fetch('/api/turfs/manage', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (turfResponse.ok) {
          const turfData = await turfResponse.json();
          const turf = turfData.turf;
          
          setFormData({
            businessName: turf.name || turf.contactInfo.businessName || '',
            phone: turf.contactInfo.phone || '',
            upiQrCode: turf.paymentInfo.upiQrCode || null,
            turfImages: turf.images || [],
            sportsOffered: turf.sportsOffered || [],
            customSport: turf.customSport || '',
            amenities: turf.amenities || [],
            about: turf.description || '',
            availableSlots: turf.availableSlots || [],
            pricing: turf.pricing || 0,
            location: {
              address: turf.location?.address || '',
              city: turf.location?.city || '',
              state: turf.location?.state || '',
              pincode: turf.location?.pincode || ''
            }
          });
        } else {
          // Fallback to User collection
          const userResponse = await fetch('/api/owner/update', {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            const ownerData = userData.user;
            
            setFormData({
              businessName: ownerData.businessName || '',
              phone: ownerData.phone || '',
              upiQrCode: ownerData.upiQrCode || null,
              turfImages: ownerData.turfImages || [],
              sportsOffered: ownerData.sportsOffered || [],
              customSport: ownerData.customSport || '',
              amenities: ownerData.amenities || [],
              about: ownerData.about || '',
              availableSlots: ownerData.availableSlots || [],
              pricing: ownerData.pricing || 0,
              location: {
                address: ownerData.location?.address || '',
                city: ownerData.location?.city || '',
                state: ownerData.location?.state || '',
                pincode: ownerData.location?.pincode || ''
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading owner data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOwnerData();
  }, [firebaseUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const validateForm = (): boolean => {
    // Reset previous messages
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    if (!formData.upiQrCode) {
      setError('UPI QR code is required');
      return false;
    }

    if (formData.turfImages.length === 0) {
      setError('At least one turf image is required');
      return false;
    }

    if (formData.sportsOffered.length === 0) {
      setError('At least one sport must be selected');
      return false;
    }

    if (formData.sportsOffered.includes('Other') && !formData.customSport.trim()) {
      setError('Custom sport name is required when "Other" is selected');
      return false;
    }

    if (!formData.about.trim()) {
      setError('About section is required');
      return false;
    }

    if (formData.availableSlots.length === 0) {
      setError('At least one time slot is required');
      return false;
    }

    if (!formData.pricing || formData.pricing <= 0) {
      setError('Valid pricing is required');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!firebaseUser) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const idToken = await firebaseUser.getIdToken();
      
      // First, save/update the user profile
      const userResponse = await fetch('/api/owner/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!userResponse.ok) {
        const userData = await userResponse.json();
        setError(userData.error || 'Failed to update user profile');
        return;
      }

      // Then, create/update the turf entry
      const turfData = {
        name: formData.businessName || 'My Turf',
        description: formData.about,
        images: formData.turfImages,
        sportsOffered: formData.sportsOffered,
        customSport: formData.customSport,
        amenities: formData.amenities,
        availableSlots: formData.availableSlots,
        pricing: formData.pricing,
        location: formData.location,
        upiQrCode: formData.upiQrCode
      };

      // Check if turf exists first
      const turfCheckResponse = await fetch('/api/turfs/manage', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const turfMethod = turfCheckResponse.ok ? 'PUT' : 'POST';
      
      const turfResponse = await fetch('/api/turfs/manage', {
        method: turfMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(turfData),
      });

      if (!turfResponse.ok) {
        const turfError = await turfResponse.json();
        console.warn('Turf save failed:', turfError);
        // Don't fail completely if turf save fails - user profile is still saved
      }

      setSuccess('Owner profile updated successfully!');
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error saving owner data:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage your turf business</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Owner
                </Badge>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
=======
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle, Edit, Calendar, Bell, Download, MapPin, User, DollarSign, Zap, Eye, CheckCircle, XCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

/*
  TurfOwnerDashboardPage (UPDATED with Payment Screenshot functionality)
  - ProtectedRoute(requireRole="owner")
  - Mocked data + UI actions (approve/reject/complete bookings, add/edit turf)
  - New: mock payment screenshot (data URL SVG) for bookings that players upload as payment proof
  - Owner can view screenshot in modal, Verify Payment or Request Refund
  - TODO: Replace mocked fetches with real API calls to:
      - GET /api/owner/summary
      - GET /api/owner/turfs
      - GET /api/owner/turfs/:id/bookings
      - GET /api/owner/notifications
      - POST /api/owner/turfs
      - PUT /api/owner/turfs/:id
      - PATCH /api/owner/bookings/:id/status
      - POST /api/owner/bookings/:id/verify-payment
      - POST /api/owner/bookings/:id/request-refund
*/

const DUMMY_PAYMENT_SVG = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
    <rect width='100%' height='100%' fill='#f3f4f6'/>
    <g transform='translate(40,40)'>
      <rect x='0' y='0' width='720' height='120' rx='12' fill='#10b981' />
      <text x='20' y='75' font-size='34' font-family='Arial' fill='white' font-weight='700'>TurfBook Payment Receipt</text>
    </g>
    <g transform='translate(60,180)' font-family='Arial' fill='#111827'>
      <text x='0' y='0' font-size='18'>Paid by: Rahul</text>
      <text x='0' y='30' font-size='18'>Transaction ID: pay_123</text>
      <text x='0' y='60' font-size='18'>Amount: ₹800</text>
      <text x='0' y='100' font-size='16' fill='#6b7280'>Date: 03 Oct 2025</text>
    </g>
    <g transform='translate(60,320)'>
      <rect width='720' height='120' rx='8' fill='#ffffff' stroke='#e5e7eb' />
      <text x='20' y='55' font-size='16' font-family='Arial' fill='#374151'>This is a mock payment screenshot for demo purposes — replace with real player-uploaded images in production.</text>
    </g>
  </svg>
`);

const DUMMY_PAYMENT_DATAURL = `data:image/svg+xml;utf8,${DUMMY_PAYMENT_SVG}`;

const MOCK_SUMMARY = {
  totalBookingsToday: 4,
  upcomingBookings: 9,
  pendingApprovals: 2,
  earningsToday: 3200,
  earningsMonth: 58750
};

const MOCK_TURFS = [
  {
    _id: 'turf_1',
    ownerId: 'owner_1',
    name: 'Greenway Turf',
    description: 'Full-size synthetic turf with lights and locker rooms.',
    address: 'Sector 21B, Sangli',
    location: { lat: 16.8583, lng: 74.5758 },
    images: [],
    amenities: ['Lights', 'Changing Room', 'Parking'],
    turfType: 'synthetic',
    pricePerHour: 800,
    maxPlayers: 22,
    timeSlots: [{ day: 'Mon-Sun', start: '06:00', end: '22:00' }],
    bufferMins: 15,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'turf_2',
    ownerId: 'owner_1',
    name: 'Stadium Arena',
    description: 'Premium turf with seating for spectators.',
    address: 'MG Road, Sangli',
    location: { lat: 16.8589, lng: 74.5770 },
    images: [],
    amenities: ['Seating', 'Lights'],
    turfType: 'grass',
    pricePerHour: 1200,
    maxPlayers: 22,
    timeSlots: [{ day: 'Mon-Sun', start: '07:00', end: '21:00' }],
    bufferMins: 10,
    status: 'paused',
    createdAt: new Date().toISOString()
  }
];

// Now some bookings include a paymentProof (data URL) and paymentVerified flag
const MOCK_BOOKINGS = [
  {
    _id: 'b_1',
    turfId: 'turf_1',
    userName: 'Rahul',
    phone: '9999999999',
    startTime: '2025-10-03T10:00:00Z',
    endTime: '2025-10-03T11:00:00Z',
    price: 800,
    status: 'confirmed',
    paymentId: 'pay_123',
    paymentProof: DUMMY_PAYMENT_DATAURL,
    paymentVerified: true
  },
  {
    _id: 'b_2',
    turfId: 'turf_1',
    userName: 'Asha',
    phone: '8888888888',
    startTime: '2025-10-03T12:00:00Z',
    endTime: '2025-10-03T13:00:00Z',
    price: 800,
    status: 'pending',
    paymentId: null,
    paymentProof: DUMMY_PAYMENT_DATAURL, // simulate player uploaded screenshot but owner hasn't verified
    paymentVerified: false
  },
  {
    _id: 'b_3',
    turfId: 'turf_2',
    userName: 'Vikram',
    phone: '7777777777',
    startTime: '2025-10-04T18:00:00Z',
    endTime: '2025-10-04T19:30:00Z',
    price: 1800,
    status: 'cancelled',
    paymentId: 'pay_456',
    paymentProof: null,
    paymentVerified: false
  }
];

const MOCK_NOTIFICATIONS = [
  { _id: 'n_1', ownerId: 'owner_1', type: 'booking_created', title: 'New booking request', body: 'Asha requested 12:00 - 13:00, Oct 3', meta: { bookingId: 'b_2' }, read: false, createdAt: '2025-10-02T16:10:00Z' },
  { _id: 'n_2', ownerId: 'owner_1', type: 'booking_cancelled', title: 'Booking cancelled', body: 'Vikram cancelled Oct 4 slot', meta: { bookingId: 'b_3' }, read: false, createdAt: '2025-10-01T09:00:00Z' }
];

const REVENUE_DATA = [
  { date: '2025-09-24', revenue: 2000 },
  { date: '2025-09-25', revenue: 3400 },
  { date: '2025-09-26', revenue: 1800 },
  { date: '2025-09-27', revenue: 4200 },
  { date: '2025-09-28', revenue: 2600 },
  { date: '2025-09-29', revenue: 3000 },
  { date: '2025-09-30', revenue: 2100 }
];

function formatCurrency(n) {
  if (n == null) return '₹0';
  return `₹${n.toLocaleString('en-IN')}`;
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function OwnerDashboard() {
  const { user, logout } = useAuth();

  // states
  const [summary, setSummary] = useState(null);
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);
  const [turfForm, setTurfForm] = useState({
    name: '', description: '', address: '', location: { lat: null, lng: null }, images: [], amenities: [], turfType: 'synthetic', pricePerHour: 0, maxPlayers: 6, timeSlots: [], bufferMins: 15, status: 'active'
  });
  const [isSaving, setIsSaving] = useState(false);

  // payment screenshot modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [isProcessingPaymentAction, setIsProcessingPaymentAction] = useState(false);

  // initial load (mocked)
  useEffect(() => {
    // TODO: replace with: await fetch('/api/owner/summary') etc.
    setTimeout(() => {
      setSummary(MOCK_SUMMARY);
      setTurfs(MOCK_TURFS);
      setNotifications(MOCK_NOTIFICATIONS);
    }, 200);
  }, []);

  // when a turf is selected, load bookings
  useEffect(() => {
    if (!selectedTurf) {
      setBookings([]);
      return;
    }
    // TODO: GET /api/owner/turfs/:id/bookings
    const turfBookings = MOCK_BOOKINGS.filter(b => b.turfId === selectedTurf._id);
    setBookings(turfBookings);
  }, [selectedTurf]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const openAddModal = () => {
    setEditingTurf(null);
    setTurfForm({
      name: '', description: '', address: '', location: { lat: null, lng: null }, images: [], amenities: [], turfType: 'synthetic', pricePerHour: 0, maxPlayers: 6, timeSlots: [], bufferMins: 15, status: 'active'
    });
    setShowAddEditModal(true);
  };

  const openEditModal = (turf) => {
    setEditingTurf(turf);
    setTurfForm({ ...turf });
    setShowAddEditModal(true);
  };

  async function saveTurf(e) {
    e.preventDefault();
    setIsSaving(true);
    // TODO: if editingTurf -> PUT /api/owner/turfs/:id else POST /api/owner/turfs
    await new Promise(r => setTimeout(r, 700));
    if (editingTurf) {
      setTurfs(prev => prev.map(t => (t._id === editingTurf._id ? { ...t, ...turfForm } : t)));
    } else {
      const newT = { ...turfForm, _id: `turf_${Date.now()}`, ownerId: user?.uid || 'owner_1', createdAt: new Date().toISOString() };
      setTurfs(prev => [newT, ...prev]);
    }
    setIsSaving(false);
    setShowAddEditModal(false);
  }

  // Booking actions: approve/reject/complete (UI-only for now)
  async function updateBookingStatus(bookingId, newStatus) {
    // optimistic UI update
    setBookings(prev => prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b)));
    // TODO: PATCH /api/owner/bookings/:id/status { status: newStatus }
    await new Promise(r => setTimeout(r, 400));
    // optionally update notifications or summary after server confirms
  }

  function markNotificationRead(id) {
    setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    // TODO: POST /api/owner/notifications/mark-read
  }

  // PAYMENT: open payment proof modal
  function openPaymentProof(booking) {
    setPaymentModalBooking(booking);
    setPaymentModalOpen(true);
  }

  // PAYMENT: verify payment (owner action)
  async function verifyPayment(bookingId) {
    setIsProcessingPaymentAction(true);
    // optimistic UI update locally
    setBookings(prev => prev.map(b => (b._id === bookingId ? { ...b, paymentVerified: true } : b)));
    // TODO: POST /api/owner/bookings/:id/verify-payment -> { verified: true }
    await new Promise(r => setTimeout(r, 600));
    // add a notification or update summary as needed
    setIsProcessingPaymentAction(false);
    setPaymentModalOpen(false);
  }

  // PAYMENT: request refund (owner action) - marks booking cancelled and creates refund flow stub
  async function requestRefund(bookingId) {
    setIsProcessingPaymentAction(true);
    // optimistic UI update locally
    setBookings(prev => prev.map(b => (b._id === bookingId ? { ...b, status: 'cancelled' } : b)));
    // TODO: initiate refund via payment gateway / PATCH booking status
    await new Promise(r => setTimeout(r, 600));
    setIsProcessingPaymentAction(false);
    setPaymentModalOpen(false);
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-green-500 rounded-lg p-2 mr-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TurfBook</h1>
                  <p className="text-xs text-gray-500">Owner Dashboard</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="relative">
                <button title="Notifications" className="p-2 rounded-full hover:bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
                )}
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-red-600">
>>>>>>> 06fb1a4e293b0c626a6da5ad1f36056390f37f21
                Logout
              </Button>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="business-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business-info">Business Info</TabsTrigger>
            <TabsTrigger value="turf-details">Turf Details</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="business-info" className="space-y-6">
            {/* Basic Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Your turf business name"
                      value={formData.businessName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        businessName: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Contact phone number"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        phone: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricing" className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Pricing per Hour *
                  </Label>
                  <Input
                    id="pricing"
                    type="number"
                    placeholder="Enter hourly rate"
                    value={formData.pricing || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: Number(e.target.value)
                    })}
                    className="max-w-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* UPI QR Code Upload */}
            <UpiUploader 
              value={formData.upiQrCode}
              onChange={(image) => setFormData({
                ...formData,
                upiQrCode: image
              })}
            />
          </TabsContent>

          <TabsContent value="turf-details" className="space-y-6">
            {/* Turf Images Upload */}
            <TurfImagesUploader 
              value={formData.turfImages}
              onChange={(images) => setFormData({
                ...formData,
                turfImages: images
              })}
            />

            {/* Sports Selection */}
            <SportsSelection 
              value={formData.sportsOffered}
              customSport={formData.customSport}
              onSportsChange={(sports) => setFormData({
                ...formData,
                sportsOffered: sports
              })}
              onCustomSportChange={(sport) => setFormData({
                ...formData,
                customSport: sport
              })}
            />

            {/* Amenities */}
            <AmenitiesSelector 
              value={formData.amenities}
              onChange={(amenities) => setFormData({
                ...formData,
                amenities
              })}
            />

            {/* About Section */}
            <AboutSection 
              value={formData.about}
              onChange={(about) => setFormData({
                ...formData,
                about
              })}
            />
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            {/* Time Slots Management */}
            <SlotManager 
              value={formData.availableSlots}
              onChange={(slots) => setFormData({
                ...formData,
                availableSlots: slots
              })}
            />
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={formData.location?.address || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: e.target.value
                      }
                    })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.location?.city || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.location?.state || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          state: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      value={formData.location?.pincode || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          pincode: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-green-500 hover:bg-green-600 min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
=======
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.name} 👋</h2>
          <p className="text-gray-600 mt-1">Manage your turfs, bookings and payouts from here.</p>
        </div>

        {/* Summary & Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total bookings today</p>
                    <p className="text-2xl font-semibold">{summary ? summary.totalBookingsToday : '—'}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <p className="text-xs text-gray-500 mt-1">Quick</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Pending approvals</p>
                    <p className="text-2xl font-semibold">{summary ? summary.pendingApprovals : '—'}</p>
                  </div>
                  <div>
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-xs text-gray-500">Earnings (Today)</p>
                <p className="text-2xl font-semibold">{summary ? formatCurrency(summary.earningsToday) : '—'}</p>
                <p className="text-xs text-gray-400 mt-2">Monthly: {summary ? formatCurrency(summary.earningsMonth) : '—'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-xs text-gray-500">Upcoming bookings</p>
                <p className="text-2xl font-semibold">{summary ? summary.upcomingBookings : '—'}</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Revenue (last 7 days)</p>
              <button className="text-sm text-indigo-600">Export CSV</button>
            </div>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Turfs list and right panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">My Turfs</h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">{turfs.length} items</div>
                <Button onClick={openAddModal} className="inline-flex items-center" size="sm">
                  <PlusCircle className="mr-2" /> Add Turf
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {turfs.map(t => (
                <div key={t._id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400">🏟️</div>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.address} • {t.turfType} • {t.maxPlayers} players</div>
                      <div className="text-xs text-gray-500 mt-1">₹{t.pricePerHour}/hr • {t.status}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => { setSelectedTurf(t); }} className="text-indigo-600 text-sm">View bookings</button>
                    <button onClick={() => openEditModal(t)} title="Edit" className="p-2 rounded hover:bg-gray-100"><Edit className="h-4 w-4 text-gray-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Bookings & Notifications */}
          <aside className="bg-white p-4 rounded shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Bookings</h4>
              <div className="text-xs text-gray-500">{selectedTurf ? selectedTurf.name : 'Select a turf'}</div>
            </div>

            <div className="space-y-2 max-h-64 overflow-auto">
              {selectedTurf ? (
                bookings.length === 0 ? (
                  <div className="text-sm text-gray-400">No bookings for this turf.</div>
                ) : (
                  bookings.map(b => (
                    <div key={b._id} className="border rounded p-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{b.userName} • {new Date(b.startTime).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{b.status} • {formatCurrency(b.price)}</div>
                          <div className="text-xs text-gray-500 mt-1">Contact: {b.phone}</div>

                          {/* Payment info */}
                          <div className="mt-2 flex items-center gap-2">
                            {b.paymentProof ? (
                              <>
                                <img
                                  src={b.paymentProof}
                                  alt="payment proof thumbnail"
                                  className="w-28 h-16 object-cover rounded border cursor-pointer"
                                  onClick={() => openPaymentProof(b)}
                                />
                                <div className="text-xs">
                                  {b.paymentVerified ? (
                                    <div className="flex items-center gap-1 text-green-700"><CheckCircle className="h-4 w-4" /> Payment verified</div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-yellow-700"><XCircle className="h-4 w-4" /> Payment pending verification</div>
                                  )}
                                  <div className="text-gray-500">Txn: {b.paymentId || '—'}</div>
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">No payment proof uploaded</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {b.status === 'pending' && (
                            <>
                              <Button size="xs" onClick={() => updateBookingStatus(b._id, 'confirmed')}>Approve</Button>
                              <Button size="xs" variant="ghost" onClick={() => updateBookingStatus(b._id, 'cancelled')}>Reject</Button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <>
                              <Button size="xs" onClick={() => updateBookingStatus(b._id, 'completed')}>Mark completed</Button>
                              <Button size="xs" variant="ghost" onClick={() => updateBookingStatus(b._id, 'cancelled')}>Cancel</Button>
                            </>
                          )}
                          {b.status === 'cancelled' && <Badge>Cancelled</Badge>}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="text-sm text-gray-400">Select a turf to see bookings and manage them.</div>
              )}
            </div>

            <div className="mt-4 border-t pt-3">
              <h5 className="text-sm font-semibold mb-2">Notifications</h5>
              <div className="space-y-2 max-h-44 overflow-auto">
                {notifications.map(n => (
                  <div key={n._id} className={`p-2 rounded ${n.read ? 'bg-gray-50' : 'bg-indigo-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-gray-500">{n.body}</div>
                      </div>
                      <div className="text-xs text-gray-400">{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && <div className="mt-2 text-right"><button onClick={() => markNotificationRead(n._id)} className="text-xs text-indigo-600">Mark read</button></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Button variant="ghost" size="sm" className="w-full inline-flex items-center justify-center">
                <Download className="mr-2" /> Export Reports
              </Button>
            </div>
          </aside>
        </section>

        <footer className="text-xs text-gray-400 mt-6">Tip: For realtime updates connect a WebSocket/Pusher channel `owner:{user.uid}` and save incoming events to /api/owner/notifications.</footer>
      </main>

      {/* Add / Edit Turf Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl p-6 overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{editingTurf ? 'Edit Turf' : 'Add Turf'}</h3>
              <button onClick={() => setShowAddEditModal(false)} className="text-gray-500">Close</button>
            </div>

            <form onSubmit={saveTurf} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Name</label>
                  <input required value={turfForm.name} onChange={e => setTurfForm(f => ({ ...f, name: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Price per hour (₹)</label>
                  <input type="number" value={turfForm.pricePerHour} onChange={e => setTurfForm(f => ({ ...f, pricePerHour: Number(e.target.value) }))} className="w-full mt-1 p-2 border rounded" />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Max players</label>
                  <input type="number" value={turfForm.maxPlayers} onChange={e => setTurfForm(f => ({ ...f, maxPlayers: Number(e.target.value) }))} className="w-full mt-1 p-2 border rounded" />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Status</label>
                  <select value={turfForm.status} onChange={e => setTurfForm(f => ({ ...f, status: e.target.value }))} className="w-full mt-1 p-2 border rounded">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Address</label>
                  <input value={turfForm.address} onChange={e => setTurfForm(f => ({ ...f, address: e.target.value }))} className="w-full mt-1 p-2 border rounded" />
                  <p className="text-xs text-gray-400 mt-1">Tip: Replace with Google Places or Algolia autocomplete in production.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Description</label>
                  <textarea value={turfForm.description} onChange={e => setTurfForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 p-2 border rounded" rows={3} />
                </div>

                <div>
                  <label className="text-xs text-gray-600">Turf type</label>
                  <select value={turfForm.turfType} onChange={e => setTurfForm(f => ({ ...f, turfType: e.target.value }))} className="w-full mt-1 p-2 border rounded">
                    <option value="synthetic">Synthetic</option>
                    <option value="grass">Grass</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600">Buffer between bookings (mins)</label>
                  <input type="number" value={turfForm.bufferMins} onChange={e => setTurfForm(f => ({ ...f, bufferMins: Number(e.target.value) }))} className="w-full mt-1 p-2 border rounded" />
                </div>

                {/* Amenities input (simple CSV input for mock) */}
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Amenities (comma separated)</label>
                  <input value={turfForm.amenities.join(', ')} onChange={e => setTurfForm(f => ({ ...f, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full mt-1 p-2 border rounded" />
                </div>

                {/* Time slots - simple textbox for mock; replace with a repeatable UI later */}
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Available time slots (example: Mon-Fri 06:00-22:00)</label>
                  <input value={turfForm.timeSlots.map(ts => `${ts.day} ${ts.start}-${ts.end}`).join('; ')} onChange={e => {
                    const raw = e.target.value;
                    // naive parser for mock usage
                    const slots = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
                      const [day, times] = s.split(' ');
                      const [start, end] = times ? times.split('-') : ['06:00', '22:00'];
                      return { day, start, end };
                    });
                    setTurfForm(f => ({ ...f, timeSlots: slots }));
                  }} className="w-full mt-1 p-2 border rounded" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded border" onClick={() => setShowAddEditModal(false)}>Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded bg-indigo-600 text-white">{isSaving ? 'Saving...' : (editingTurf ? 'Save changes' : 'Create Turf')}</button>
              </div>
            </form>

            <div className="mt-4 text-xs text-gray-400">Notes: Implement image uploader (S3), address autocomplete, and time-slot builder in backend-connected version.</div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {paymentModalOpen && paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 overflow-auto max-h-[92vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Payment screenshot — {paymentModalBooking.userName}</h3>
                <p className="text-xs text-gray-500">Booking: {new Date(paymentModalBooking.startTime).toLocaleString()} • {formatCurrency(paymentModalBooking.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                {paymentModalBooking.paymentVerified ? (
                  <div className="text-green-700 flex items-center gap-2"><CheckCircle /> Verified</div>
                ) : (
                  <div className="text-yellow-700 flex items-center gap-2"><XCircle /> Not verified</div>
                )}
                <button onClick={() => { setPaymentModalOpen(false); setPaymentModalBooking(null); }} className="text-sm text-gray-500">Close</button>
              </div>
            </div>

            <div className="border rounded p-4 mb-4">
              {paymentModalBooking.paymentProof ? (
                <img src={paymentModalBooking.paymentProof} alt="payment proof" className="w-full h-[420px] object-contain rounded" />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded text-gray-400">No screenshot uploaded</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              {!paymentModalBooking.paymentVerified && paymentModalBooking.paymentProof && (
                <>
                  <Button onClick={() => verifyPayment(paymentModalBooking._id)} disabled={isProcessingPaymentAction} className="inline-flex items-center">
                    <CheckCircle className="mr-2" /> Verify Payment
                  </Button>
                  <Button variant="ghost" onClick={() => requestRefund(paymentModalBooking._id)} disabled={isProcessingPaymentAction}>
                    <XCircle className="mr-2" /> Request Refund
                  </Button>
                </>
              )}

              {paymentModalBooking.paymentVerified && (
                <div className="text-sm text-gray-500">Payment already verified — no action needed.</div>
              )}
            </div>
          </div>
        </div>
      )}
>>>>>>> 06fb1a4e293b0c626a6da5ad1f36056390f37f21
    </div>
  );
}

// Page wrapper
export default function TurfOwnerDashboardPage() {
  return (
    <ProtectedRoute requireRole="owner">
      <OwnerDashboard />
    </ProtectedRoute>
  );
}
