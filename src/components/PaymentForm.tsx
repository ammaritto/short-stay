// OPTIONAL: Enhanced PaymentForm.tsx with better validation
// Replace your existing PaymentForm.tsx with this enhanced version

import React, { useState } from 'react';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

interface PaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentFormProps {
  totalAmount: number;
  currency: string;
  onPaymentSubmit: (paymentDetails: PaymentDetails) => void;
  onBack: () => void;
  loading: boolean;
  bookingDetails: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    propertyName: string;
    nights: number;
  };
}

// Enhanced card type detection
const detectCardType = (cardNumber: string) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (/^(4026|4508|4844|4913|4917)/.test(cleanNumber)) return 'VISA_ELECTRON';
  if (/^3[47]/.test(cleanNumber)) return 'AMERICAN_EXPRESS';
  if (/^3[0689]/.test(cleanNumber)) return 'DINERS_CLUB';
  if (/^35/.test(cleanNumber)) return 'JCB';
  if (/^(5[06-8]|6\d)/.test(cleanNumber)) return 'MAESTRO';
  if (/^5[1-5]/.test(cleanNumber)) return 'MASTERCARD';
  if (/^4/.test(cleanNumber)) return 'VISA_CREDIT';
  
  return 'UNKNOWN';
};

// Luhn algorithm validation
const isValidCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  let sum = 0;
  let alternate = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cleanNumber.charAt(i), 10);
    
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    
    sum += n;
    alternate = !alternate;
  }
  
  return (sum % 10) === 0;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  currency,
  onPaymentSubmit,
  onBack,
  loading,
  bookingDetails
}) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format date
  const formatDateWithWeekday = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
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

  // Enhanced validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardNumberClean = paymentDetails.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!isValidCardNumber(cardNumberClean)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Cardholder name validation
    if (!paymentDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (paymentDetails.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Name must be at least 2 characters';
    }

    // Expiry validation
    if (!paymentDetails.expiryMonth) {
      newErrors.expiryMonth = 'Month is required';
    }
    if (!paymentDetails.expiryYear) {
      newErrors.expiryYear = 'Year is required';
    }
    
    // Check if card is expired
    if (paymentDetails.expiryMonth && paymentDetails.expiryYear) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const expYear = parseInt(paymentDetails.expiryYear);
      const expMonth = parseInt(paymentDetails.expiryMonth);
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryYear = 'Card has expired';
      }
    }

    // CVV validation
    if (!paymentDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else {
      const cardType = detectCardType(paymentDetails.cardNumber);
      const cvvLength = paymentDetails.cvv.length;
      
      if (cardType === 'AMERICAN_EXPRESS' && cvvLength !== 4) {
        newErrors.cvv = 'Amex CVV must be 4 digits';
      } else if (cardType !== 'AMERICAN_EXPRESS' && cvvLength !== 3) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onPaymentSubmit(paymentDetails);
    }
  };

  const handleInputChange = (field: keyof PaymentDetails, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    }
    if (field === 'cvv') {
      const cardType = detectCardType(paymentDetails.cardNumber);
      const maxLength = cardType === 'AMERICAN_EXPRESS' ? 4 : 3;
      value = value.replace(/[^0-9]/g, '').substring(0, maxLength);
    }
    if (field === 'expiryMonth') {
      value = value.replace(/[^0-9]/g, '').substring(0, 2);
    }
    if (field === 'expiryYear') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    if (field === 'cardholderName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setPaymentDetails(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return <option key={month} value={month}>{month}</option>;
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => {
    const year = currentYear + i;
    return <option key={year} value={year}>{year}</option>;
  });

  // Get card type for display
  const cardType = detectCardType(paymentDetails.cardNumber);
  const getCardIcon = () => {
    switch (cardType) {
      case 'VISA_CREDIT':
      case 'VISA_ELECTRON':
        return '💳 Visa';
      case 'MASTERCARD':
        return '💳 Mastercard';
      case 'AMERICAN_EXPRESS':
        return '💳 Amex';
      case 'DINERS_CLUB':
        return '💳 Diners';
      case 'JCB':
        return '💳 JCB';
      case 'MAESTRO':
        return '💳 Maestro';
      default:
        return '💳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            disabled={loading}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Guest:</span>
                <span className="ml-2 text-gray-600">{bookingDetails.guestName}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Property:</span>
                <span className="ml-2 text-gray-600">{bookingDetails.propertyName}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Check-in:</span>
                <span className="ml-2 text-gray-600">{formatDateWithWeekday(bookingDetails.checkIn)}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Check-out:</span>
                <span className="ml-2 text-gray-600">{formatDateWithWeekday(bookingDetails.checkOut)}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-gray-600">{bookingDetails.nights} {bookingDetails.nights === 1 ? 'night' : 'nights'}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <div className="text-right">
                    <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                    <div className="text-xs text-gray-500 font-normal">(VAT incl.)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              {cardType !== 'UNKNOWN' && paymentDetails.cardNumber && (
                <span className="ml-auto text-sm text-gray-600">{getCardIcon()}</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardholderName"
                  value={paymentDetails.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                  disabled={loading}
                />
                {errors.cardholderName && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  disabled={loading}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    id="expiryMonth"
                    value={paymentDetails.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">MM</option>
                    {monthOptions}
                  </select>
                  {errors.expiryMonth && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="expiryYear"
                    value={paymentDetails.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">YYYY</option>
                    {yearOptions}
                  </select>
                  {errors.expiryYear && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiryYear}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={cardType === 'AMERICAN_EXPRESS' ? '1234' : '123'}
                    maxLength={cardType === 'AMERICAN_EXPRESS' ? 4 : 3}
                    disabled={loading}
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Your payment information is secure and encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${formatCurrency(totalAmount)}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
