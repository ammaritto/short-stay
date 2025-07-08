import { useState } from 'react';

export interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
  communities: number[];
}

export interface Rate {
  rateId: number;
  rateName: string;
  currency: string;
  currencySymbol: string;
  totalPrice: number;
  avgNightlyRate: number;
  nights: number;
  description?: string;
}

export interface Unit {
  buildingId: number;
  buildingName: string;
  inventoryTypeId: number;
  inventoryTypeName: string;
  rates: Rate[];
}

export interface SelectedUnit extends Unit {
  selectedRate: Rate;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface BookingDetails {
  bookingId: number;
  bookingReference: string;
  status: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  paymentReference?: string;
  paymentAmount?: number;
}

export type BookingStep = 'search' | 'guest-details' | 'payment' | 'confirmation';

export const useBookingState = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  
  // Separate search form state from confirmed booking state
  const [searchFormParams, setSearchFormParams] = useState<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 1,
    communities: []
  });
  
  // Confirmed search parameters (only updated when search is performed)
  const [confirmedSearchParams, setConfirmedSearchParams] = useState<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 1,
    communities: []
  });
  
  const [availability, setAvailability] = useState<Unit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetBooking = () => {
    setCurrentStep('search');
    setSelectedUnit(null);
    setGuestDetails({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setBookingDetails(null);
    setError('');
  };

  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
    setError('');
  };

  return {
    // State
    currentStep,
    searchFormParams,
    confirmedSearchParams,
    availability,
    hasSearched,
    selectedUnit,
    guestDetails,
    bookingDetails,
    error,
    loading,
    
    // Actions
    setSearchFormParams,
    setConfirmedSearchParams,
    setAvailability,
    setHasSearched,
    setSelectedUnit,
    setGuestDetails,
    setBookingDetails,
    setError,
    setLoading,
    resetBooking,
    goToStep
  };
};