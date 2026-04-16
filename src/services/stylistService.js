import { supabase } from '../config/supabase';

/**
 * Stylist service — requires these additions in Supabase SQL Editor:
 * ─────────────────────────────────────────────────────────────────
 *
 * -- 1. Add stylist flag + info to profiles
 * ALTER TABLE profiles
 *   ADD COLUMN IF NOT EXISTS is_stylist boolean DEFAULT false,
 *   ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
 *   ADD COLUMN IF NOT EXISTS city text,
 *   ADD COLUMN IF NOT EXISTS state text,
 *   ADD COLUMN IF NOT EXISTS portfolio_photos text[] DEFAULT '{}',
 *   ADD COLUMN IF NOT EXISTS rating numeric(3,1) DEFAULT 0,
 *   ADD COLUMN IF NOT EXISTS review_count int DEFAULT 0;
 *
 * -- 2. Index for fast stylist queries
 * CREATE INDEX IF NOT EXISTS idx_profiles_is_stylist ON profiles(is_stylist)
 *   WHERE is_stylist = true;
 *
 * -- 3. RLS — anyone can view stylist profiles
 * CREATE POLICY "public can view stylists" ON profiles
 *   FOR SELECT USING (is_stylist = true OR auth.uid() = id);
 *
 * ─────────────────────────────────────────────────────────────────
 */

export const stylistService = {

  /**
   * Fetch all verified stylists, optionally filtered by specialty.
   * Returns { data: [], error, isEmpty: bool }
   * isEmpty = true means the table exists but has no rows (different from a DB error).
   */
  async getStylists({ specialty } = {}) {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, city, state, location, specialties, portfolio_photos, rating, review_count')
        .eq('is_stylist', true)
        .order('rating', { ascending: false });

      if (specialty && specialty !== 'All') {
        // Filter: specialties array contains the requested specialty (case-insensitive)
        query = query.contains('specialties', [specialty]);
      }

      const { data, error } = await query;

      if (error) {
        // Column doesn't exist yet — table not migrated
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          return { data: [], error: null, isEmpty: true, notMigrated: true };
        }
        return { data: [], error, isEmpty: true };
      }

      return { data: data || [], error: null, isEmpty: !data?.length };
    } catch (err) {
      return { data: [], error: err, isEmpty: true };
    }
  },

  /**
   * Search stylists by name, city/state, or specialty.
   */
  async searchStylists(query) {
    if (!query?.trim()) return this.getStylists();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, city, state, location, specialties, portfolio_photos, rating, review_count')
        .eq('is_stylist', true)
        .or(`full_name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`);

      if (error) return { data: [], error, isEmpty: true };
      return { data: data || [], error: null, isEmpty: !data?.length };
    } catch (err) {
      return { data: [], error: err, isEmpty: true };
    }
  },

  /**
   * Mark the current user's profile as a stylist and set their info.
   * Called during stylist onboarding.
   */
  async registerAsStylist(userId, { specialties, city, state, portfolioPhotos }) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_stylist: true,
        specialties,
        city,
        state,
        portfolio_photos: portfolioPhotos || [],
        rating: 0,
        review_count: 0,
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Add a portfolio photo URL to a stylist's profile.
   */
  async addPortfolioPhoto(userId, photoUrl) {
    // Fetch current photos first
    const { data: profile } = await supabase
      .from('profiles')
      .select('portfolio_photos')
      .eq('id', userId)
      .single();

    const current = profile?.portfolio_photos || [];
    const updated = [...current, photoUrl];

    const { error } = await supabase
      .from('profiles')
      .update({ portfolio_photos: updated })
      .eq('id', userId);

    return { error };
  },
};

/**
 * Normalize a raw profile row into the shape the StylistsScreen expects.
 */
export function normalizeStylist(row) {
  return {
    id: row.id,
    name: row.full_name || row.username || 'Stylist',
    location: row.city && row.state
      ? `${row.city}, ${row.state}`
      : row.location || '',
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    specialties: row.specialties || [],
    photos: row.portfolio_photos?.length >= 3
      ? row.portfolio_photos.slice(0, 3)
      : [
          ...(row.portfolio_photos || []),
          // Pad with avatar if not enough portfolio shots
          ...(row.avatar_url ? [row.avatar_url, row.avatar_url, row.avatar_url] : []),
        ].slice(0, 3),
    avatarUrl: row.avatar_url,
  };
}
