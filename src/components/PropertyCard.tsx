import React from 'react';
import { MapPin, Calendar, Users, Star, Heart, Wifi, Car, Coffee, Bath, Bed, CheckCircle, ArrowRight } from 'lucide-react';

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

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

interface PropertyCardProps {
  unit: Unit;
  lastSearchParams: SearchParams;
  onSelectUnit: (unit: Unit, rate: Rate) => void;
  getPropertyImage: (inventoryTypeId: number) => string;
  formatCurrency: (amount: number) => string;
  formatDateWithWeekday: (dateString: string) => string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  unit,
  lastSearchParams,
  onSelectUnit,
  getPropertyImage,
  formatCurrency,
  formatDateWithWeekday
}) => {
  return (
    <div className="card-modern group relative overflow-hidden">
      {/* Image Section */}
      <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
        <img 
          src={getPropertyImage(unit.inventoryTypeId)} 
          alt={unit.inventoryTypeName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {unit.buildingName}
          </h3>
          <p className="text-gray-600">{unit.inventoryTypeName}</p>
        </div>
        
        {/* Booking Details */}
        {unit.rates.map((rate, rateIndex) => (
          <div key={`${rate.rateId}-${rateIndex}`} className="bg-gray-50 rounded-lg p-4 mb-4">
            {/* Date and Guest Info */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600 mb-4">
              <div>
                <div className="font-medium text-gray-800">Saturday</div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                  <span>{new Date(lastSearchParams.startDate).getDate()} {new Date(lastSearchParams.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div>{new Date(lastSearchParams.startDate).getFullYear()}</div>
              </div>
              
              <div className="flex items-center justify-center">
                <span className="text-gray-400">→</span>
              </div>
              
              <div>
                <div className="font-medium text-gray-800">Sunday</div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                  <span>{new Date(lastSearchParams.endDate).getDate()} {new Date(lastSearchParams.endDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div>{new Date(lastSearchParams.endDate).getFullYear()}</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-center">
                <Users className="w-3 h-3 mr-1 text-blue-500" />
                <span>{rate.nights} {rate.nights === 1 ? 'night' : 'nights'} • {lastSearchParams.guests} {lastSearchParams.guests === 1 ? 'guest' : 'guests'}</span>
              </div>
            </div>
            
            {/* Price and Book Button */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.round(rate.totalPrice)}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  SEK
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  total price<br/>(VAT included)
                </div>
              </div>
              
              <button
                onClick={() => onSelectUnit(unit, rate)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 px-6 rounded-2xl font-bold hover:scale-105 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl group"
              >
                Book<br/>This<br/>Stay
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyCard;