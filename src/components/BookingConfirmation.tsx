import React from 'react';
import { CheckCircle } from 'lucide-react';
import { BookingDetails } from '../hooks/useBookingState';

interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onReset: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingDetails,
  onReset
}) => {
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('sv-SE')} SEK`;
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Confirmed & Paid!</h2>
        <div className="space-y-2 text-gray-600">
          <p><strong>Booking Reference:</strong> {bookingDetails.bookingReference}</p>
          <p><strong>Guest:</strong> {bookingDetails.guestName}</p>
          <p><strong>Check-in:</strong> {formatDisplayDate(bookingDetails.checkIn)}</p>
          <p><strong>Check-out:</strong> {formatDisplayDate(bookingDetails.checkOut)}</p>
          {bookingDetails.paymentReference && (
            <p><strong>Payment Reference:</strong> {bookingDetails.paymentReference}</p>
          )}
          {bookingDetails.paymentAmount && (
            <p><strong>Amount Paid:</strong> {formatCurrency(bookingDetails.paymentAmount)}</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Make Another Booking
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;