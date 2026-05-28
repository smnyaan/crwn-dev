import { supabase } from '../config/supabase';

export const reviewService = {
  async getReviewsByStylist(stylistId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, text, service_name, created_at,
        client:profiles!client_id(id, username, full_name, avatar_url)
      `)
      .eq('stylist_id', stylistId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async hasReviewedBooking(bookingId) {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();
    return !!data;
  },

  async submitReview(bookingId, clientId, stylistId, rating, text, serviceName) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        client_id: clientId,
        stylist_id: stylistId,
        rating,
        text: text?.trim() || null,
        service_name: serviceName || null,
      })
      .select()
      .single();

    if (!error) {
      // RPC bypasses RLS so it can update the stylist's profile aggregate
      await supabase.rpc('recalculate_stylist_rating', { p_stylist_id: stylistId });
    }

    return { data, error };
  },
};
