import { useEffect } from 'react';
import { SearchParams, Unit } from './useBookingState';

const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

export const useSearchLogic = (
  searchParams: SearchParams,
  setSearchParams: (params: SearchParams | ((prev: SearchParams) => SearchParams)) => void,
  setAvailability: (units: Unit[]) => void,
  setHasSearched: (searched: boolean) => void,
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void,
  hasSearched: boolean
) => {
  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    setSearchParams({
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: dayAfter.toISOString().split('T')[0],
      guests: 1,
      communities: []
    });
  }, [setSearchParams]);

  // Auto-update checkout date when checkin changes (only if not searched yet)
  useEffect(() => {
    if (searchParams.startDate && !hasSearched) {
      const checkIn = new Date(searchParams.startDate);
      const checkOut = new Date(searchParams.endDate);
      
      if (!searchParams.endDate || checkOut <= checkIn) {
        const newCheckOut = new Date(checkIn);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setSearchParams(prev => ({
          ...prev,
          endDate: newCheckOut.toISOString().split('T')[0]
        }));
      }
    }
  }, [searchParams.startDate, searchParams.endDate, hasSearched, setSearchParams]);

  const calculateNights = (): number => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getMinEndDate = (): string => {
    if (!searchParams.startDate) return '';
    const minDate = new Date(searchParams.startDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  const toggleCommunity = (communityId: number): void => {
    setSearchParams(prev => ({
      ...prev,
      communities: prev.communities.includes(communityId)
        ? prev.communities.filter(id => id !== communityId)
        : [...prev.communities, communityId]
    }));
    if (hasSearched) {
      setAvailability([]);
      setHasSearched(false);
    }
  };

  const searchAvailability = async (): Promise<void> => {
    if (!searchParams.startDate || !searchParams.endDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        guests: searchParams.guests.toString()
      });
      
      if (searchParams.communities.length > 0) {
        params.append('communities', searchParams.communities.join(','));
      }
      
      const response = await fetch(`${API_BASE_URL}/availability/search?${params}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const transformedData = data.data.map((property: any) => {
          return {
            buildingId: property.buildingId || 0,
            buildingName: property.buildingName || 'Unknown Building',
            inventoryTypeId: property.inventoryTypeId || 0,
            inventoryTypeName: property.inventoryTypeName || 'Unknown Unit',
            rates: (property.rates || []).map((rate: any) => {
              const nights = calculateNights();
              const avgNightlyRate = parseFloat(rate.avgNightlyRate || '0');
              const totalPrice = avgNightlyRate * nights;
              
              return {
                rateId: rate.rateId || 0,
                rateName: rate.rateName || 'Standard Rate',
                currency: rate.currency || 'SEK',
                currencySymbol: rate.currencySymbol || 'SEK',
                totalPrice: totalPrice,
                avgNightlyRate: avgNightlyRate,
                nights: nights,
                description: rate.description || ''
              };
            })
          };
        });
        
        setAvailability(transformedData);
        setHasSearched(true);
      } else {
        setError(data.message || 'No availability found');
        setAvailability([]);
        setHasSearched(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search availability');
      setAvailability([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateNights,
    getMinEndDate,
    toggleCommunity,
    searchAvailability
  };
};