'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Wifi, 
  Car, 
  Zap, 
  WashingMachine,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
// Import PaymentModal component
import PaymentModal from '@/components/booking/PaymentModal';

interface TurfData {
  _id: string;
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  turfImages: Array<{
    url: string;
    public_id: string;
  }>;
  sportsOffered: string[];
  customSport?: string;
  amenities: string[];
  about: string;
  pricing: number;
  location: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  availableSlots: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }>;
  upiQrCode: {
    url: string;
    public_id: string;
  };
}

interface TurfDetailsPageProps {
  turfId: string;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Floodlights': <Zap className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Washroom': <WashingMachine className="w-4 h-4" />,
  'Equipment': <Users className="w-4 h-4" />,
  'WiFi': <Wifi className="w-4 h-4" />
};

export default function TurfDetailsPage({ turfId }: TurfDetailsPageProps) {
  const [turf, setTurf] = useState<TurfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchTurfDetails();
  }, [turfId]);

  const fetchTurfDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/turfs/${turfId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch turf details');
      }

      const data = await response.json();
      setTurf(data.turf);
    } catch (error) {
      console.error('Error fetching turf details:', error);
      setError('Failed to load turf details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: { day: string; startTime: string; endTime: string }) => {
    setSelectedSlot(slot);
  };

  const handleProceedToPayment = () => {
    if (selectedSlot) {
      setShowPaymentModal(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowPaymentModal(false);
    setSelectedSlot(null);
    // Refresh turf details to update slot availability
    fetchTurfDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading turf details...</p>
        </div>
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            {error || 'Turf not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Group slots by day
  const slotsByDay = turf.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, typeof turf.availableSlots>);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{turf.businessName}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{turf.location.address}, {turf.location.city}, {turf.location.state} - {turf.location.pincode}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              <span className="text-sm">{turf.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              <span className="text-sm">{turf.email}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {turf.turfImages.slice(0, 4).map((image, index) => (
                    <div key={index} className={`relative ${index === 0 ? 'md:row-span-2' : ''} h-64 md:h-48 ${index === 0 ? 'md:h-96' : ''}`}>
                      <Image
                        src={image.url}
                        alt={`${turf.businessName} - Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About This Turf</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{turf.about}</p>
              </CardContent>
            </Card>

            {/* Sports & Amenities */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sports Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {turf.sportsOffered.map((sport) => (
                      <Badge key={sport} variant="secondary">
                        {sport}
                      </Badge>
                    ))}
                    {turf.customSport && (
                      <Badge variant="secondary">{turf.customSport}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {turf.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        {amenityIcons[amenity] || <Users className="w-4 h-4" />}
                        <span className="ml-2">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Slots */}
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {daysOrder.map((day) => {
                    const daySlots = slotsByDay[day] || [];
                    if (daySlots.length === 0) return null;

                    return (
                      <div key={day}>
                        <h3 className="font-medium text-gray-900 mb-3">{day}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {daySlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={
                                selectedSlot?.day === slot.day &&
                                selectedSlot?.startTime === slot.startTime &&
                                selectedSlot?.endTime === slot.endTime
                                  ? "default"
                                  : "outline"
                              }
                              disabled={slot.isBooked}
                              className={`text-sm ${slot.isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => !slot.isBooked && handleSlotSelect(slot)}
                            >
                              {slot.startTime} - {slot.endTime}
                              {slot.isBooked && (
                                <span className="ml-1 text-xs">(Booked)</span>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Summary</span>
                  <span className="text-2xl font-bold text-green-600">₹{turf.pricing}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSlot ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Selected Slot</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{selectedSlot.day}</p>
                        <p className="text-sm text-gray-600">
                          {selectedSlot.startTime} - {selectedSlot.endTime}
                        </p>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₹{turf.pricing}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Select a time slot to continue</p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    disabled={!selectedSlot}
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSlot && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          turf={turf}
          selectedSlot={selectedSlot}
          totalAmount={turf.pricing}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
