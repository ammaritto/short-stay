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
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
          {/* Rating Badge */}
          <div className="glass-effect px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">4.9</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {unit.buildingName}
            </h3>
            <div className="text-right">
              <div className="text-lg md:text-xl font-bold text-gray-900">
                {formatCurrency(unit.rates[0]?.avgNightlyRate || 0)}
              </div>
              <div className="text-xs text-gray-600">per night</div>
            </div>
          </div>
          
          <p className="text-gray-700 text-lg font-medium">{unit.inventoryTypeName}</p>
        </div>
        
        {/* Booking Details */}
        {unit.rates.map((rate, rateIndex) => (
          <div key={`${rate.rateId}-${rateIndex}`} className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-5 md:p-6 mb-6 border border-gray-100">
            <div className="space-y-4">
              {/* Date Range */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{formatDateWithWeekday(lastSearchParams.startDate)}</span>
                    </div>
                    <span className="hidden sm:inline text-gray-400">→</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500 sm:hidden" />
                      <span className="font-medium">{formatDateWithWeekday(lastSearchParams.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{rate.nights} {rate.nights === 1 ? 'night' : 'nights'} • {lastSearchParams.guests} {lastSearchParams.guests === 1 ? 'guest' : 'guests'}</span>
                  </div>
                </div>
              </div>
              
              {/* Price and Book Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-right">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                    {formatCurrency(rate.totalPrice)}
                  </div>
                  <div className="text-sm text-gray-500">total price (VAT included)</div>
                </div>
                
                <button
                  onClick={() => onSelectUnit(unit, rate)}
                  className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 px-8 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group"
                >
                  Book This Stay
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyCard;