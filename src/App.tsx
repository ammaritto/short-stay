import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle } from 'lucide-react';

// TypeScript interfaces
interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
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

interface BookingDetails {
  bookingId: number;
  bookingReference: string;
  status: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

const App: React.FC = () => {
  // Your existing state declarations
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
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 1
  });

  // Additional state for search results
  const [availability, setAvailability] = useState<Unit[]>([]);

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
      guests: 1
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

  // Calculate nights
  const calculateNights = (): number => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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

  // Handle start date change
  const handleStartDateChange = (newStartDate: string) => {
    const startDate = new Date(newStartDate);
    const currentEndDate = new Date(searchParams.endDate);
    
    if (currentEndDate <= startDate) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setSearchParams({
        ...searchParams,
        startDate: newStartDate,
        endDate: newEndDate.toISOString().split('T')[0]
      });
    } else {
      setSearchParams({...searchParams, startDate: newStartDate});
    }
  };

  // Get minimum end date
  const getMinEndDate = (): string => {
    if (!searchParams.startDate) return '';
    const minDate = new Date(searchParams.startDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  // Search for availability
  const searchAvailability = async (): Promise<void> => {
    console.log('Starting search...');
    
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
      
      console.log('Search URL:', `${API_BASE_URL}/availability/search?${params}`);
      
      const response = await fetch(`${API_BASE_URL}/availability/search?${params}`);
      const data = await response.json();
      
      console.log('Raw API response:', data);
      
      if (data.success && data.data) {
        // Transform data and filter for short stay rates
        const transformedData = data.data.map((property: any) => {
          // Filter rates to only show "Short stay rates" with valid pricing
          const shortStayRates = (property.rates || []).filter((rate: any) => {
            const hasShortStayName = rate.rateName?.toLowerCase().includes('short stay') || 
                                   rate.description?.toLowerCase().includes('short stay');
            const hasValidPrice = parseFloat(rate.avgNightlyRate) > 0;
            return hasShortStayName && hasValidPrice;
          });

          return {
            buildingId: property.buildingId || 0,
            buildingName: property.buildingName || 'Unknown Building',
            inventoryTypeId: property.inventoryTypeId || 0,
            inventoryTypeName: property.inventoryTypeName || 'Unknown Unit',
            rates: shortStayRates.map((rate: any) => ({
              rateId: rate.rateId || 0,
              rateName: rate.rateName || 'Short Stay Rate',
              currency: rate.currency || 'SEK',
              currencySymbol: rate.currencySymbol || 'SEK',
              totalPrice: parseFloat(rate.totalPrice) || 0,
              avgNightlyRate: parseFloat(rate.avgNightlyRate) || 0,
              nights: parseInt(rate.nights) || calculateNights(),
              description: rate.description || ''
            }))
          };
        }).filter((property: any) => property.rates && property.rates.length > 0);
        
        console.log('Transformed data:', transformedData);
        setAvailability(transformedData);
      } else {
        console.error('API returned error:', data);
        setError(data.error || 'No short stay rates available');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Select unit for booking
  const selectUnit = (unit: Unit, rate: Rate) => {
    setSelectedUnit({
      ...unit,
      selectedRate: rate
    });
    setShowBookingForm(true);
  };

  // Your existing booking submit function
  const handleBookingSubmit = async (): Promise<void> => {
    if (!selectedUnit || !guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        guestDetails,
        stayDetails: {
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          inventoryTypeId: parseInt(selectedUnit.inventoryTypeId.toString()),
          rateId: parseInt(selectedUnit.selectedRate.rateId.toString()),
          adults: parseInt(searchParams.guests.toString()),
          children: 0,
          infants: 0
        }
      };

      console.log('Creating booking with data:', bookingData);

      const response = await fetch(`${API_BASE_URL}/booking/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Booking response status:', response.status);
      
      const data = await response.json();
      console.log('Booking response data:', data);
      
      if (data.success) {
        setBookingDetails(data.data);
        setBookingComplete(true);
        setShowBookingForm(false);
      } else {
        console.error('Booking failed:', data);
        setError(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Booking confirmation screen
  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Booking Reference:</strong> {bookingDetails?.bookingReference}</p>
            <p><strong>Guest:</strong> {bookingDetails?.guestName}</p>
            <p><strong>Check-in:</strong> {bookingDetails && formatDisplayDate(bookingDetails.checkIn)}</p>
            <p><strong>Check-out:</strong> {bookingDetails && formatDisplayDate(bookingDetails.checkOut)}</p>
          </div>
          <button
            onClick={() => {
              setBookingComplete(false);
              setSelectedUnit(null);
              setAvailability([]);
              setGuestDetails({ firstName: '', lastName: '', email: '', phone: '' });
            }}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2 text-center">Short Stay Booking</h1>
          <p className="text-gray-600 text-center mb-8">Find your perfect studio in Stockholm</p>
          
          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchParams.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchParams.endDate}
                    onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
                    min={getMinEndDate()}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <select
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={searchAvailability}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Search className="h-5 w-5" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {availability.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-gray-900">Available Studios ({availability.length})</h2>
              {availability.map((unit) => (
                <div key={`${unit.buildingId}-${unit.inventoryTypeId}`} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-light text-gray-900 mb-2">{unit.inventoryTypeName}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{unit.buildingName}</span>
                        </div>
                      </div>
                    </div>
                    
                    {unit.rates.length > 0 && (
                      <div className="space-y-4">
                        {unit.rates.map((rate) => (
                          <div key={rate.rateId} className="border border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-all duration-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <h5 className="text-lg font-medium text-gray-900 mb-3">{rate.rateName}</h5>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full">{calculateNights()} nights</span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-sm">{formatDisplayDate(searchParams.startDate)} - {formatDisplayDate(searchParams.endDate)}</span>
                                </div>
                              </div>
                              <div className="text-right ml-8">
                                <p className="text-3xl font-light text-gray-900 mb-1">
                                  {formatCurrency(rate.avgNightlyRate * calculateNights())}
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                  {formatCurrency(rate.avgNightlyRate)}/night
                                </p>
                                <button
                                  onClick={() => selectUnit(unit, rate)}
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Form Modal */}
          {showBookingForm && selectedUnit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                <div className="p-8">
                  <h3 className="text-2xl font-light text-gray-900 mb-6">Complete Your Booking</h3>
                  
                  {/* Booking Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mb-6 border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-4">Booking Summary</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Studio:</strong> {selectedUnit.inventoryTypeName}</p>
                      <p><strong>Building:</strong> {selectedUnit.buildingName}</p>
                      <p><strong>Rate:</strong> {selectedUnit.selectedRate.rateName}</p>
                      <p><strong>Check-in:</strong> {formatDisplayDate(searchParams.startDate)}</p>
                      <p><strong>Check-out:</strong> {formatDisplayDate(searchParams.endDate)}</p>
                      <p><strong>Guests:</strong> {searchParams.guests}</p>
                      <p className="text-lg font-medium text-gray-900 pt-2 border-t border-gray-200">
                        <strong>Total: {formatCurrency(selectedUnit.selectedRate.avgNightlyRate * calculateNights())}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Guest Details Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={guestDetails.firstName}
                            onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={guestDetails.lastName}
                            onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={guestDetails.email}
                          onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          value={guestDetails.phone || ''}
                          onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBookingSubmit}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <CreditCard className="h-4 w-4" />
                        {loading ? 'Booking...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
