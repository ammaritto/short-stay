import React from 'react';
import { Search, Calendar, Users } from 'lucide-react';

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}


interface SearchFormProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  loading: boolean;
  getMinEndDate: () => string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate
}) => {
  return (
    <div className="py-16 md:py-20 bg-gradient-to-br from-white to-blue-50/30" id="search-section">
      <div className="container-modern">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find Your <span className="text-gradient-accent">Stay</span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto">
            Tell us when you're looking for the perfect stay in Stockholm
          </p>
        </div>

        <div className="card-elegant p-6 md:p-8 animate-slide-up max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-800 mb-3">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <input
                  type="date"
                  id="startDate"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 font-medium"
                  value={searchParams.startDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-800 mb-3">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <input
                  type="date"
                  id="endDate"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 font-medium"
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                  min={getMinEndDate()}
                />
              </div>
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-semibold text-gray-800 mb-3">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <select
                  id="guests"
                  className="w-full pl-12 pr-8 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200 text-gray-800 font-medium"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">&nbsp;</label>
              <button
                onClick={onSearch}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-md font-bold hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;