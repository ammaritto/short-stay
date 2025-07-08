import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle, ArrowLeft, X } from 'lucide-react';

// TypeScript interfaces
interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
  communities: number[];
}

interface Rate {
  rateId: number;
  rateName: string;
  currency: string;
  currencySymbol: string;
  totalPrice: number;
  avgNightlyRate: number;
  nights: number;
  description?: string;
}

interface Unit {
  buildingId: number;
  buildingName: string;
  inventoryTypeId: number;
  inventoryTypeName: string;
  rates: Rate[];
}

interface SelectedUnit extends Unit {
  selectedRate: Rate;
}

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface PaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

interface BookingDetails {
  bookingId: number;
  bookingReference: string;
  status: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  paymentReference?: string;
  paymentAmount?: number;
}

// Payment Form Component
const PaymentForm: React.FC<{
  totalAmount: number;
  currency: string;
  onPaymentSubmit: (paymentDetails: PaymentDetails) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  bookingDetails: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    propertyName: string;
    nights: number;
  };
}> = ({ totalAmount, currency, onPaymentSubmit, onBack, loading, bookingDetails }) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentDetails(prev => ({ ...prev, cardNumber: formatted }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!paymentDetails.cardNumber || paymentDetails.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentDetails.expiryMonth) {
      newErrors.expiryMonth = 'Required';
    }

    if (!paymentDetails.expiryYear) {
      newErrors.expiryYear = 'Required';
    }

    if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!paymentDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onPaymentSubmit(paymentDetails);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="mr-3 p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Property</span>
              <span className="text-gray-900 text-right flex-1 ml-2">{bookingDetails.propertyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guest</span>
              <span className="text-gray-900">{bookingDetails.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in</span>
              <span className="text-gray-900">{formatDateWithWeekday(bookingDetails.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out</span>
              <span className="text-gray-900">{formatDateWithWeekday(bookingDetails.checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nights</span>
              <span className="text-gray-900">{bookingDetails.nights}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Amount</span>
                <span className="font-bold text-lg text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
              <p className="text-xs text-gray-500 text-right">(VAT incl.)</p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Payment Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                value={paymentDetails.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={paymentDetails.expiryMonth}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryYear ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={paymentDetails.expiryYear}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={String(year).slice(-2)}>
                        {String(year).slice(-2)}
                      </option>
                    );
                  })}
                </select>
                {errors.expiryYear && <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cvv ? 'border-red-300' : 'border-gray-300'
                }`}
                value={paymentDetails.cvv}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                }`}
                value={paymentDetails.cardholderName}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                placeholder="John Doe"
              />
              {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {formatCurrency(totalAmount)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Main state
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 1,
    communities: []
  });
  const [availability, setAvailability] = useState<Unit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  // Community data from the API
  const communities = [
    { id: 13, name: "Ängby Aces", area: "Ängby" },
    { id: 3, name: "Bromma Friends", area: "Bromma" }
  ];

  // Photo mapping based on inventoryTypeId
  const getPropertyImage = (inventoryTypeId: number): string => {
    const imageMap: { [key: number]: string } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png',
      10: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03bc52fbd20a5ad097a7c_1-p-1600.jpg',
    };
    
    return imageMap[inventoryTypeId] || 'https://via.placeholder.com/400x240/e5e7eb/9ca3af?text=Photo+Coming+Soon';
  };

  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    setSearchParams({
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: dayAfter.toISOString().split('T')[0],
      guests: 1,
      communities: []
    });
  }, []);

  // Simple currency formatter
  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  // Calculate nights based on search params
  const calculateNights = (): number => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Calculate nights for last search
  const calculateLastSearchNights = (): number => {
    if (!lastSearchParams?.startDate || !lastSearchParams?.endDate) return 0;
    const start = new Date(lastSearchParams.startDate);
    const end = new Date(lastSearchParams.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Format date with weekday (shorter for mobile)
  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  // Format date for display (dd/mm/yyyy)
  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Get minimum end date (always 1 day after check-in)
  const getMinEndDate = (): string => {
    if (!searchParams.startDate) return '';
    const minDate = new Date(searchParams.startDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  // Auto-update checkout date when checkin changes
  useEffect(() => {
    if (searchParams.startDate) {
      const checkIn = new Date(searchParams.startDate);
      const checkOut = new Date(searchParams.endDate);
      
      if (!searchParams.endDate || checkOut <= checkIn) {
        const newCheckOut = new Date(checkIn);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setSearchParams(prev => ({
          ...prev,
          endDate: newCheckOut.toISOString().split('T')[0]
        }));
      }
    }
  }, [searchParams.startDate]);

  // Toggle community filter
  const toggleCommunity = (communityId: number): void => {
    setSearchParams(prev => ({
      ...prev,
      communities: prev.communities.includes(communityId)
        ? prev.communities.filter(id => id !== communityId)
        : [...prev.communities, communityId]
    }));
  };

  // Search for availability
  const searchAvailability = async (): Promise<void> => {
    if (!searchParams.startDate || !searchParams.endDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        guests: searchParams.guests.toString()
      });
      
      if (searchParams.communities.length > 0) {
        params.append('communities', searchParams.communities.join(','));
      }
      
      console.log('Searching with params:', params.toString());
      
      const response = await fetch(`${API_BASE_URL}/availability/search?${params}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.data) {
        const searchNights = calculateNights();
        
        const transformedData = data.data.map((property: any) => {
          return {
            buildingId: property.buildingId || 0,
            buildingName: property.buildingName || 'Unknown Building',
            inventoryTypeId: property.inventoryTypeId || 0,
            inventoryTypeName: property.inventoryTypeName || 'Unknown Unit',
            rates: (property.rates || []).map((rate: any) => {
              const avgNightlyRate = parseFloat(rate.avgNightlyRate || '0');
              const totalPrice = avgNightlyRate * searchNights;
              
              return {
                rateId: rate.rateId || 0,
                rateName: rate.rateName || 'Standard Rate',
                currency: rate.currency || 'SEK',
                currencySymbol: rate.currencySymbol || 'SEK',
                totalPrice: totalPrice,
                avgNightlyRate: avgNightlyRate,
                nights: searchNights,
                description: rate.description || ''
              };
            })
          };
        });
        
        setAvailability(transformedData);
        setLastSearchParams({ ...searchParams });
        setHasSearched(true);
      } else {
        console.error('API returned error:', data);
        setError(data.message || 'No availability found');
        setAvailability([]);
        setLastSearchParams({ ...searchParams });
        setHasSearched(true);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Failed to search availability: ${err.message}`);
      setAvailability([]);
      setLastSearchParams({ ...searchParams });
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Select unit and rate
  const selectUnit = (unit: Unit, rate: Rate): void => {
    setSelectedUnit({ ...unit, selectedRate: rate });
    setShowBookingForm(true);
  };

  // Handle guest details submission
  const handleGuestDetailsSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setShowBookingForm(false);
    setShowPaymentForm(true);
  };

  // Handle payment submission
  const handlePaymentSubmit = async (paymentDetails: PaymentDetails): Promise<void> => {
    if (!selectedUnit || !lastSearchParams) return;

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        guestDetails,
        stayDetails: {
          startDate: lastSearchParams.startDate,
          endDate: lastSearchParams.endDate,
          guests: lastSearchParams.guests
        },
        unitDetails: {
          rateId: selectedUnit.selectedRate.rateId,
          inventoryTypeId: selectedUnit.inventoryTypeId
        },
        paymentDetails: {
          amount: selectedUnit.selectedRate.totalPrice,
          cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
          cardholderName: paymentDetails.cardholderName,
          expiryMonth: paymentDetails.expiryMonth,
          expiryYear: paymentDetails.expiryYear,
          cvv: paymentDetails.cvv
        }
      };

      console.log('Creating booking with payment:', bookingData);

      const response = await fetch(`${API_BASE_URL}/booking/create-with-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      
      if (data.success) {
        setBookingDetails(data.data);
        setBookingComplete(true);
        setShowPaymentForm(false);
      } else {
        console.error('Booking with payment failed:', data);
        setError(data.message || 'Failed to process payment and create booking');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle back from payment form
  const handleBackFromPayment = (): void => {
    setShowPaymentForm(false);
    setShowBookingForm(true);
  };

  // Reset to search
  const resetToSearch = (): void => {
    setBookingComplete(false);
    setShowPaymentForm(false);
    setShowBookingForm(false);
    setSelectedUnit(null);
    setGuestDetails({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setError('');
  };

  // Show payment form
  if (showPaymentForm && selectedUnit && lastSearchParams) {
    return (
      <PaymentForm
        totalAmount={selectedUnit.selectedRate.totalPrice}
        currency={selectedUnit.selectedRate.currency}
        onPaymentSubmit={handlePaymentSubmit}
        onBack={handleBackFromPayment}
        loading={loading}
        bookingDetails={{
          guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
          checkIn: lastSearchParams.startDate,
          checkOut: lastSearchParams.endDate,
          propertyName: `${selectedUnit.inventoryTypeName} - ${selectedUnit.buildingName}`,
          nights: selectedUnit.selectedRate.nights
        }}
      />
    );
  }

  // Booking confirmation screen
  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p><strong>Reference:</strong> {bookingDetails?.bookingReference}</p>
              <p><strong>Guest:</strong> {bookingDetails?.guestName}</p>
              <p><strong>Check-in:</strong> {bookingDetails && formatDisplayDate(bookingDetails.checkIn)}</p>
              <p><strong>Check-out:</strong> {bookingDetails && formatDisplayDate(bookingDetails.checkOut)}</p>
              {bookingDetails?.paymentReference && (
                <p><strong>Payment Ref:</strong> {bookingDetails.paymentReference}</p>
              )}
              {bookingDetails?.paymentAmount && (
                <p><strong>Amount Paid:</strong> {formatCurrency(bookingDetails.paymentAmount)}</p>
              )}
            </div>
            <button
              onClick={resetToSearch}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Make Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guest details form (mobile fullscreen)
  if (showBookingForm && selectedUnit && lastSearchParams) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center p-4">
            <button onClick={() => setShowBookingForm(false)} className="mr-3 p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Guest Details</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Booking Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">{selectedUnit.inventoryTypeName} - {selectedUnit.buildingName}</p>
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="text-gray-900">{formatDateWithWeekday(lastSearchParams.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="text-gray-900">{formatDateWithWeekday(lastSearchParams.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span className="text-gray-900">{selectedUnit.selectedRate.nights}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="font-bold text-lg text-blue-600">{formatCurrency(selectedUnit.selectedRate.totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500 text-right">(VAT incl.)</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Guest Details Form */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Your Details</h3>
            
            <form onSubmit={handleGuestDetailsSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.firstName}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.lastName}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.email}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.phone}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+46 70 123 4567"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mt-6"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Continue to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main search interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900">Short Stay Booking</h1>
          <p className="text-gray-600 text-sm mt-1">Find your perfect accommodation</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="space-y-4">
            {/* Date Inputs - Stack on mobile */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="startDate"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchParams.startDate}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="endDate"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchParams.endDate}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                    min={getMinEndDate()}
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  id="guests"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Community Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Community
              </label>
              <div className="flex flex-wrap gap-2">
                {communities.map(community => (
                  <button
                    key={community.id}
                    onClick={() => toggleCommunity(community.id)}
                    className={`px-3 py-2 text-xs rounded-full border transition-colors ${
                      searchParams.communities.includes(community.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {community.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={searchAvailability}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && availability.length > 0 && lastSearchParams && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Available Properties ({availability.length})
            </h2>

            <div className="space-y-4">
              {availability.map((unit, index) => (
                <div key={`${unit.buildingId}-${unit.inventoryTypeId}-${index}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img 
                    src={getPropertyImage(unit.inventoryTypeId)} 
                    alt={unit.inventoryTypeName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{unit.buildingName}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{unit.inventoryTypeName}</p>
                    
                    <div className="space-y-3">
                      {unit.rates.map((rate, rateIndex) => (
                        <div key={`${rate.rateId}-${rateIndex}`} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="text-xs text-gray-600 space-y-1">
                                <div><span className="font-medium">From:</span> {formatDateWithWeekday(lastSearchParams.startDate)}</div>
                                <div><span className="font-medium">To:</span> {formatDateWithWeekday(lastSearchParams.endDate)}</div>
                                <div className="text-gray-500">{rate.nights} {rate.nights === 1 ? 'night' : 'nights'}</div>
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <p className="font-bold text-lg text-blue-600">{formatCurrency(rate.totalPrice)}</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(rate.avgNightlyRate)}/night
                              </p>
                              <p className="text-xs text-gray-500">(VAT incl.)</p>
                            </div>
                          </div>
                          <button
                            onClick={() => selectUnit(unit, rate)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Select & Book
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {hasSearched && !loading && availability.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search criteria or dates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
