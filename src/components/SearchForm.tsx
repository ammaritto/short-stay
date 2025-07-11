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
    <div className="py-12 bg-white" id="search-section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Find Your <span className="text-gradient-accent">Stay</span>
          </h2>
          <p className="text-lg text-gray-600">
            Tell us when you're looking for a stay
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <input
                  type="date"
                  id="startDate"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchParams.startDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <input
                  type="date"
                  id="endDate"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                  min={getMinEndDate()}
                />
              </div>
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <select
                  id="guests"
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={onSearch}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-semibold hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
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