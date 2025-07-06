const handleBookingSubmit = async (): Promise<void> => {
  if (!selectedUnit || !guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
    setError('Please fill in all required fields');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const bookingData = {
      guestDetails,
      stayDetails: {
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        inventoryTypeId: parseInt(selectedUnit.inventoryTypeId.toString()),
        rateId: parseInt(selectedUnit.selectedRate.rateId.toString()),
        adults: parseInt(searchParams.guests.toString()),
        children: 0,
        infants: 0
      }
    };

    console.log('Creating booking with data:', bookingData); // Debug log

    const response = await fetch(`${API_BASE_URL}/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log('Booking response status:', response.status); // Debug log
    
    const data = await response.json();
    console.log('Booking response data:', data); // Debug log
    
    if (data.success) {
      setBookingDetails(data.data);
      setBookingComplete(true);
      setShowBookingForm(false);
    } else {
      console.error('Booking failed:', data); // Debug log
      setError(data.error || 'Failed to create booking');
    }
  } catch (err) {
    console.error('Booking error:', err); // Debug log
    setError('Failed to create booking');
  } finally {
    setLoading(false);
  }
};
