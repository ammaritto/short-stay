import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

const ShortStayBooking = () => {
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    guests: 1
  });
  
  const [availability, setAvailability] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Set default dates (today + 1 day for checkin, +3 days for checkout)
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

  // Update end date when start date changes
  const handleStartDateChange = (newStartDate: string) => {
    const startDate = new Date(newStartDate);
    const currentEndDate = new Date(searchParams.endDate);
    
    // If end date is not after start date, set it to start date + 1 day
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

  // Format date for display (dd/mm/yyyy)
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get minimum date for end date (start date + 1 day)
  const getMinEndDate = (): string => {
    if (!searchParams.startDate) return '';
    const minDate = new Date(searchParams.startDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/availability/buildings`);
      const data = await response.json();
      if (data.success) {
        setBuildings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch buildings:', err);
    }
  };

  const searchAvailability = async () => {
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
      
      const response = await fetch(`${API_BASE_URL}/availability/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailability(data.data);
      } else {
        setError(data.error || 'Failed to search availability');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
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
          inventoryTypeId: selectedUnit.inventoryTypeId,
          rateId: selectedUnit.selectedRate.rateId,
          adults: searchParams.guests,
          children: 0,
          infants: 0
        }
      };

      const response = await fetch(`${API_BASE_URL}/booking/create`, {
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
        setShowBookingForm(false);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const selectUnit = (unit, rate) => {
    setSelectedUnit({
      ...unit,
      selectedRate: rate
    });
    setShowBookingForm(true);
  };

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.name : `Building ${buildingId}`;
  };

  const formatCurrency = (amount, currency = 'GBP', symbol = '£') => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateNights = () => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Booking Reference:</strong> {bookingDetails.bookingReference}</p>
            <p><strong>Guest:</strong> {bookingDetails.guestName}</p>
            <p><strong>Check-in:</strong> {new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> {new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Short Stay Booking</h1>
          
          {/* Search Form */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={searchParams.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Can't select past dates
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={searchParams.endDate}
                    onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
                    min={getMinEndDate()} // End date must be after start date
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Available Units */}
          {availability.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Available Units ({availability.length})</h2>
              {availability.map((unit) => (
                <div key={`${unit.buildingId}-${unit.inventoryTypeId}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{unit.inventoryTypeName}</h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{getBuildingName(unit.buildingId)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{calculateNights()} nights</p>
                        {unit.rates.length > 0 && (
                          <div className="mt-1">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(unit.rates[0].totalPrice, unit.rates[0].currency, unit.rates[0].currencySymbol)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(unit.rates[0].avgNightlyRate, unit.rates[0].currency, unit.rates[0].currencySymbol)}/night
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {unit.rates.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Short Stay Rates:</h4>
                        {unit.rates.map((rate) => (
                          <div key={rate.rateId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800">{rate.rateName}</h5>
                                {rate.description && (
                                  <p className="text-sm text-gray-600 mt-1">{rate.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>{rate.nights} nights</span>
                                  <span>Rate ID: {rate.rateId}</span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-2xl font-bold text-green-600">
                                  {formatCurrency(rate.totalPrice, rate.currency, rate.currencySymbol)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatCurrency(rate.avgNightlyRate, rate.currency, rate.currencySymbol)}/night
                                </p>
                                <button
                                  onClick={() => selectUnit(unit, rate)}
                                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Your Booking</h3>
                  
                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Unit:</strong> {selectedUnit.inventoryTypeName}</p>
                      <p><strong>Building:</strong> {getBuildingName(selectedUnit.buildingId)}</p>
                      <p><strong>Rate:</strong> {selectedUnit.selectedRate.rateName}</p>
                      <p><strong>Check-in:</strong> {formatDisplayDate(searchParams.startDate)}</p>
                      <p><strong>Check-out:</strong> {formatDisplayDate(searchParams.endDate)}</p>
                      <p><strong>Guests:</strong> {searchParams.guests}</p>
                      <p className="text-lg font-bold text-green-600">
                        <strong>Total: {formatCurrency(selectedUnit.selectedRate.totalPrice, selectedUnit.selectedRate.currency, selectedUnit.selectedRate.currencySymbol)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Guest Details Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={guestDetails.firstName}
                            onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={guestDetails.lastName}
                            onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={guestDetails.email}
                          onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          value={guestDetails.phone}
                          onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBookingSubmit}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

export default ShortStayBooking;
