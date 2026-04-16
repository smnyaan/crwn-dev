import { supabase } from '../config/supabase';

export const bookingService = {
  async getBookingsByUser(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        appointment_date,
        status,
        notes,
        created_at,
        stylists:stylist_id (id, username, business_name, full_name)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: false });

    return { data, error };
  },
};
