import { supabase } from '../config/supabase';

export const bookingService = {
  // ── Client side ───────────────────────────────────────────────────────────

  async getBookingsByUser(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        appointment_date,
        appointment_time,
        status,
        deposit_status,
        duration_min,
        notes,
        created_at,
        stylist:stylist_id (id, username, business_name, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: false });

    return { data, error };
  },

  // ── Stylist side ──────────────────────────────────────────────────────────

  /** All bookings where this user is the stylist */
  async getBookingsByStylist(stylistId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        appointment_date,
        appointment_time,
        status,
        deposit_status,
        duration_min,
        notes,
        created_at,
        client:user_id (id, username, full_name, avatar_url)
      `)
      .eq('stylist_id', stylistId)
      .order('appointment_date', { ascending: true });

    return { data, error };
  },

  /**
   * Client creates a booking request — starts as 'pending' until the stylist
   * explicitly accepts it. Pending bookings do NOT show on the stylist's
   * calendar and do NOT block other clients' time slots.
   * Also fires a booking_notification to the stylist so they see it immediately.
   */
  async createBooking({ userId, stylistId, serviceName, appointmentDate, appointmentTime, notes, durationMin }) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId,
        stylist_id: stylistId,
        service_name: serviceName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime || null,
        notes: notes || null,
        duration_min: durationMin || null,
        status: 'pending',   // ← requires stylist acceptance before calendar / blocking
      }])
      .select()
      .single();

    // Notify the stylist of the incoming request (fire-and-forget)
    if (!error && data) {
      const dateLabel = appointmentDate
        ? new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';
      this.sendNotification(stylistId, {
        title: 'New Booking Request',
        body: `${serviceName}${dateLabel ? ` — ${dateLabel}` : ''}`,
        type: 'booking_request',
        bookingId: data.id,
        actorId: userId,
      });
    }

    return { data, error };
  },

  /** Stylist accepts a pending booking → status becomes 'confirmed' */
  async acceptBooking(bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
      .select()
      .single();
    return { data, error };
  },

  /** Stylist declines a pending booking → status becomes 'cancelled' */
  async declineBooking(bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Fetch confirmed bookings for a specific stylist on a given date.
   * Used by the client booking modal to filter out already-taken time slots
   * based on duration (e.g. a 2-hour service blocks both the start hour and
   * the hour following it).
   */
  async getConfirmedBookingsForDate(stylistId, dateStr) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, appointment_time, duration_min, service_name')
      .eq('stylist_id', stylistId)
      .eq('appointment_date', dateStr)
      .eq('status', 'confirmed');
    return { data: data || [], error };
  },

  /** Update booking status (complete / cancel / admin use) */
  async updateBookingStatus(bookingId, status) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    return { data, error };
  },

  // ── Booking Notifications ─────────────────────────────────────────────────
  // Uses a dedicated `booking_notifications` table separate from the social
  // notifications table. Run this SQL once in Supabase SQL Editor:
  //
  // CREATE TABLE IF NOT EXISTS booking_notifications (
  //   id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  //   user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  //   title      text NOT NULL,
  //   body       text,
  //   type       text,   -- 'booking_request' | 'booking_confirmed' | 'booking_declined'
  //   booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  //   actor_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  //   is_read    boolean DEFAULT false,
  //   created_at timestamptz DEFAULT now()
  // );
  // CREATE INDEX IF NOT EXISTS idx_booking_notifs_user
  //   ON booking_notifications(user_id, created_at DESC);
  // ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;
  // CREATE POLICY "Users view own booking notifications" ON booking_notifications
  //   FOR SELECT USING (auth.uid() = user_id);
  // CREATE POLICY "Authenticated users insert booking notifications" ON booking_notifications
  //   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  // CREATE POLICY "Users update own booking notifications" ON booking_notifications
  //   FOR UPDATE USING (auth.uid() = user_id);

  /** Send a booking notification to a user. Silent no-op if table doesn't exist. */
  async sendNotification(userId, { title, body, type, bookingId, actorId }) {
    try {
      await supabase
        .from('booking_notifications')
        .insert({
          user_id:    userId,
          title,
          body,
          type,
          booking_id: bookingId || null,
          actor_id:   actorId   || null,
          is_read:    false,
        });
    } catch (_) {}
  },

  /** Get unread booking notification count. Returns 0 if table doesn't exist. */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('booking_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) return 0;
      return count ?? 0;
    } catch (_) { return 0; }
  },

  /** Mark all of a user's booking notifications as read. */
  async markAllRead(userId) {
    try {
      await supabase
        .from('booking_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (_) {}
  },

  // ── Services ──────────────────────────────────────────────────────────────

  async getServices(stylistId) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('created_at', { ascending: true });

    // Gracefully handle missing table
    if (error?.code === '42P01') return { data: [], error: null, notMigrated: true };
    return { data: data || [], error };
  },

  async addService(stylistId, service) {
    const { data, error } = await supabase
      .from('services')
      .insert([{ stylist_id: stylistId, ...service }])
      .select()
      .single();

    return { data, error };
  },

  async updateService(serviceId, updates) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    return { data, error };
  },

  async deleteService(serviceId) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    return { error };
  },
};
