import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  bookingDetails: {
    guestName: string;
    checkIn: string;
    checkOut: string;
    propertyName: string;
    nights: number;
  };
}

const CheckoutForm: React.FC<{
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  totalAmount: number;
  currency: string;
  bookingDetails: any;
}> = ({ onPaymentSuccess, onBack, totalAmount, currency, bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);

  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

  const createPaymentIntent = async () => {
    try {
      setProcessing(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency,
          bookingDetails: bookingDetails
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setClientSecret(data.clientSecret);
        setPaymentIntentCreated(true);
      } else {
        setError(data.error || 'Failed to initialize payment');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // If payment intent hasn't been created yet, create it first
    if (!paymentIntentCreated) {
      await createPaymentIntent();
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/booking-complete',
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    } else {
      setError('Payment was not successful. Please try again.');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Show PaymentElement only after payment intent is created */}
      {paymentIntentCreated && clientSecret && (
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: '',
                phone: '',
              }
            }
          }}
        />
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
        <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>Your payment is secured by Stripe</span>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline" />
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {paymentIntentCreated ? 'Processing Payment...' : 'Initializing Payment...'}
            </div>
          ) : (
            `Pay ${formatCurrency(totalAmount)}`
          )}
        </button>
      </div>
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  totalAmount,
  currency,
  onPaymentSuccess,
  onBack,
  bookingDetails
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDateWithWeekday = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Basic Stripe Elements options (no client secret needed initially)
  const options = {
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
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
              <Lock className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
            </div>

            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm 
                onPaymentSuccess={onPaymentSuccess}
                onBack={onBack}
                totalAmount={totalAmount}
                currency={currency}
                bookingDetails={bookingDetails}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;
