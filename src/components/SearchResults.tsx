import React from 'react';
import { Search } from 'lucide-react';
import { Unit, Rate, SearchParams } from '../hooks/useBookingState';

interface SearchResultsProps {
  availability: Unit[];
  hasSearched: boolean;
  searchParams: SearchParams;
  onSelectUnit: (unit: Unit, rate: Rate) => void;
  calculateNights: () => number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  availability,
  hasSearched,
  searchParams,
  onSelectUnit,
  calculateNights
}) => {
  const getPropertyImage = (inventoryTypeId: number): string => {
    const imageMap: { [key: number]: string } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png',
      10: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03bc52fbd20a5ad097a7c_1-p-1600.jpg',
    };
    
    return imageMap[inventoryTypeId] || 'https://via.placeholder.com/400x240/e5e7eb/9ca3af?text=Photo+Coming+Soon';
  };

  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  if (!hasSearched) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Available Properties ({availability.length})
      </h2>

      {availability.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or dates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availability.map((unit, index) => (
            <div key={`${unit.buildingId}-${unit.inventoryTypeId}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={getPropertyImage(unit.inventoryTypeId)} 
                alt={unit.inventoryTypeName}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{unit.buildingName}</h3>
                <p className="text-gray-600 mb-4">{unit.inventoryTypeName}</p>
                
                <div className="space-y-3">
                  {unit.rates.map((rate, rateIndex) => (
                    <div key={`${rate.rateId}-${rateIndex}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm text-gray-600">
                            <div><span className="font-medium">From:</span> {formatDateWithWeekday(searchParams.startDate)}</div>
                            <div><span className="font-medium">To:</span> {formatDateWithWeekday(searchParams.endDate)}</div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{rate.nights} {rate.nights === 1 ? 'night' : 'nights'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-blue-600">{formatCurrency(rate.totalPrice)}</p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(rate.avgNightlyRate)}/night
                          </p>
                          <p className="text-xs text-gray-500">(VAT incl.)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectUnit(unit, rate)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Select & Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;