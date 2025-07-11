import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, Lock, ArrowLeft, Shield, CreditCard, Sparkles } from 'lucide-react';

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
}> = ({ onPaymentSuccess, onBack, totalAmount, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Payment Element Container */}
      <div className="card-elegant p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
        </div>
        
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
          className="mb-4"
        />
      </div>

      {/* Security Notice */}
      <div className="flex items-center text-sm text-gray-600 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
        <Shield className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
        <div>
          <div className="font-medium text-green-800">Secure Payment</div>
          <div className="text-green-600 text-xs">Your payment is protected by 256-bit SSL encryption and Stripe security</div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Payment Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="order-2 sm:order-1 btn-secondary flex-1 py-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Details
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="order-1 sm:order-2 btn-primary flex-1 group py-4 shadow-lg"
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Complete Payment {formatCurrency(totalAmount)}
            </>
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
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

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

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
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
        setShowPaymentForm(true);
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '6px',
        borderRadius: '12px',
        focusBoxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    },
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 py-8 px-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply animate-float opacity-20"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply animate-float opacity-20" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply animate-float opacity-20" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-2xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your booking with confidence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="space-y-6">
            <div className="card-elegant p-8 animate-slide-up">
              <div className="flex items-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Booking Summary</h2>
              </div>
              

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-100">
                  <div className="font-semibold text-gray-800 mb-2">{bookingDetails.propertyName}</div>
                  <div className="text-sm text-gray-600">
                    Premium short-stay accommodation in Stockholm
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Guest</div>
                    <div className="text-gray-600">{bookingDetails.guestName}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Duration</div>
                    <div className="text-gray-600">{bookingDetails.nights} {bookingDetails.nights === 1 ? 'night' : 'nights'}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Check-in:</span>
                    <span className="text-gray-600">{formatDateWithWeekday(bookingDetails.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Check-out:</span>
                    <span className="text-gray-600">{formatDateWithWeekday(bookingDetails.checkOut)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</div>
                      <div className="text-xs text-gray-500">VAT included</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="card-elegant p-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start animate-fade-in">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Payment Error</div>
                    <div className="text-sm mt-1">{error}</div>
                  </div>
                </div>
              )}

              {!showPaymentForm ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Complete Your Booking?</h2>
                    <p className="text-gray-600">Click below to proceed with secure payment</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Secure Payment by Stripe</div>
                        <div className="text-green-600">Your payment information is encrypted and secure</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleInitiatePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 px-6 rounded-xl font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center group shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Initializing Payment...
                      </div>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        Proceed to Payment - {formatCurrency(totalAmount)}
                      </>
                    )}
                  </button>

                  <button
                    onClick={onBack}
                    disabled={loading}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center mt-3"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Guest Details
                  </button>
                </div>
              ) : (
                clientSecret && options && (
                  <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm 
                      onPaymentSuccess={onPaymentSuccess}
                      onBack={onBack}
                      totalAmount={totalAmount}
                      currency={currency}
                    />
                  </Elements>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;