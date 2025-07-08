import React from 'react';
import { useBookingState, Unit, Rate } from './hooks/useBookingState';
import { useSearchLogic } from './hooks/useSearchLogic';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import GuestDetailsForm from './components/GuestDetailsForm';
import PaymentForm from './components/PaymentForm';
import BookingConfirmation from './components/BookingConfirmation';

interface PaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

const App: React.FC = () => {
  const {
    currentStep,
    searchParams,
    availability,
    hasSearched,
    selectedUnit,
    guestDetails,
    bookingDetails,
    error,
    loading,
    setSearchParams,
    setAvailability,
    setHasSearched,
    setSelectedUnit,
    setGuestDetails,
    setBookingDetails,
    setError,
    setLoading,
    resetBooking,
    goToStep
  } = useBookingState();

  const {
    calculateNights,
    getMinEndDate,
    toggleCommunity,
    searchAvailability
  } = useSearchLogic(
    searchParams,
    setSearchParams,
    setAvailability,
    setHasSearched,
    setError,
    setLoading,
    hasSearched
  );

  // Select unit and rate
  const selectUnit = (unit: Unit, rate: Rate): void => {
    setSelectedUnit({ ...unit, selectedRate: rate });
    goToStep('guest-details');
  };

  // Handle guest details submission
  const handleGuestDetailsSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    goToStep('payment');
  };

  // Handle payment submission
  const handlePaymentSubmit = async (paymentDetails: PaymentDetails): Promise<void> => {
    if (!selectedUnit) return;

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        guestDetails,
        stayDetails: {
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          guests: searchParams.guests
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
        goToStep('confirmation');
      } else {
        setError(data.message || 'Failed to process payment and create booking');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Render based on current step
  switch (currentStep) {
    case 'guest-details':
      if (!selectedUnit) {
        goToStep('search');
        return null;
      }
      return (
        <GuestDetailsForm
          selectedUnit={selectedUnit}
          searchParams={searchParams}
          guestDetails={guestDetails}
          setGuestDetails={setGuestDetails}
          onSubmit={handleGuestDetailsSubmit}
          onBack={() => goToStep('search')}
          error={error}
          calculateNights={calculateNights}
        />
      );

    case 'payment':
      if (!selectedUnit) {
        goToStep('search');
        return null;
      }
      return (
        <PaymentForm
          totalAmount={selectedUnit.selectedRate.totalPrice}
          currency={selectedUnit.selectedRate.currency}
          onPaymentSubmit={handlePaymentSubmit}
          onBack={() => goToStep('guest-details')}
          loading={loading}
          bookingDetails={{
            guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
            checkIn: searchParams.startDate,
            checkOut: searchParams.endDate,
            propertyName: `${selectedUnit.inventoryTypeName} - ${selectedUnit.buildingName}`,
            nights: calculateNights()
          }}
        />
      );

    case 'confirmation':
      if (!bookingDetails) {
        goToStep('search');
        return null;
      }
      return (
        <BookingConfirmation
          bookingDetails={bookingDetails}
          onReset={resetBooking}
        />
      );

    default:
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-gray-900">Short Stay Booking</h1>
              <p className="text-gray-600 mt-2">Find and book your perfect short-term accommodation</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <SearchForm
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              onSearch={searchAvailability}
              loading={loading}
              getMinEndDate={getMinEndDate}
              toggleCommunity={toggleCommunity}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <SearchResults
              availability={availability}
              hasSearched={hasSearched}
              searchParams={searchParams}
              onSelectUnit={selectUnit}
              calculateNights={calculateNights}
            />
          </div>
        </div>
      );
  }
};

export default App;