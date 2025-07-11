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

  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <div className="card-modern group relative">
      {/* Image Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={getPropertyImage(unit.inventoryTypeId)} 
          alt={unit.inventoryTypeName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
          {/* Rating Badge */}
          <div className="glass-effect px-4 py-2 rounded-xl flex items-center space-x-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-800">4.9</span>
          </div>
          
        </div>

      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">
              {unit.buildingName}
            </h3>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {formatCurrency(unit.rates[0]?.avgNightlyRate || 0)}
              </div>
              <div className="text-xs text-gray-500">per night</div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-2">{unit.inventoryTypeName}</p>
        </div>
        
        {/* Booking Details */}
        {unit.rates.map((rate, rateIndex) => (
          <div key={`${rate.rateId}-${rateIndex}`} className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-4 mb-2">
                  <span>{formatDateWithWeekday(lastSearchParams.startDate)}</span>
                  <span>→</span>
                  <span>{formatDateWithWeekday(lastSearchParams.endDate)}</span>
                </div>
                <div>{rate.nights} {rate.nights === 1 ? 'night' : 'nights'} • {lastSearchParams.guests} {lastSearchParams.guests === 1 ? 'guest' : 'guests'}</div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(rate.totalPrice)}
                </div>
                <div className="text-xs text-gray-500">total</div>
              </div>
            </div>
            
            <button
              onClick={() => onSelectUnit(unit, rate)}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 px-4 rounded-lg font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Book This Stay
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyCard;