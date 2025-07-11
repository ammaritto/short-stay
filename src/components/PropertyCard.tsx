import React from 'react';
import { ArrowRight } from 'lucide-react';

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
  // Format date for card display (e.g., "Saturday 12 Jul 2025")
  const formatCardDate = (dateString: string): { weekday: string; day: string; month: string; year: string } => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear().toString()
    };
  };

  const startDate = formatCardDate(lastSearchParams.startDate);
  const endDate = formatCardDate(lastSearchParams.endDate);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={getPropertyImage(unit.inventoryTypeId)} 
          alt={unit.inventoryTypeName}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {unit.buildingName}
            </h3>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {Math.round(unit.rates[0]?.avgNightlyRate || 0)} SEK
              </div>
              <div className="text-sm text-gray-500">per night</div>
            </div>
          </div>
          <p className="text-gray-600">{unit.inventoryTypeName}</p>
        </div>
        
        {/* Booking Details */}
        {unit.rates.map((rate, rateIndex) => (
          <div key={`${rate.rateId}-${rateIndex}`} className="space-y-4">
            {/* Date Display */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-800">{startDate.weekday} {startDate.day}</div>
                <div className="text-gray-600">{startDate.month} {startDate.year}</div>
              </div>
              
              <div className="flex items-center px-4">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-800">{endDate.weekday} {endDate.day}</div>
                <div className="text-gray-600">{endDate.month} {endDate.year}</div>
              </div>
            </div>
            
            {/* Duration and Guest Info */}
            <div className="text-center text-sm text-gray-600">
              {rate.nights} night{rate.nights !== 1 ? 's' : ''} • {lastSearchParams.guests} guest{lastSearchParams.guests !== 1 ? 's' : ''}
            </div>
            
            {/* Price and Book Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(rate.totalPrice)}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  SEK
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  total
                </div>
              </div>
              
              <button
                onClick={() => onSelectUnit(unit, rate)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 px-6 rounded-xl font-bold hover:scale-105 transition-all duration-300 flex items-center shadow-md hover:shadow-lg group"
              >
                Book This Stay
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyCard;