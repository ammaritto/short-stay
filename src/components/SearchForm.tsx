import React from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { SearchParams } from '../hooks/useBookingState';

interface SearchFormProps {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams | ((prev: SearchParams) => SearchParams)) => void;
  onSearch: () => void;
  loading: boolean;
  getMinEndDate: () => string;
  toggleCommunity: (communityId: number) => void;
}

const communities = [
  { id: 13, name: "Ängby Aces", area: "Ängby" },
  { id: 3, name: "Bromma Friends", area: "Bromma" }
];

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate,
  toggleCommunity
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Check-in Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              id="startDate"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              id="endDate"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
              min={getMinEndDate()}
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              id="guests"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchParams.guests}
              onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={onSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Community Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Community (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {communities.map(community => (
            <button
              key={community.id}
              onClick={() => toggleCommunity(community.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                searchParams.communities.includes(community.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              {community.name} ({community.area})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;