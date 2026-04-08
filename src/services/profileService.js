import { supabase } from '../config/supabase';

export const profileService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          hair_profiles (*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  },

  // Upload avatar image
  uploadAvatar: async (userId, imageUri) => {
    try {
      // Get file extension
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      // Read file as ArrayBuffer (reliable for local URIs in React Native)
      const arrayBuffer = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', imageUri);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = reject;
        xhr.send();
      });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          upsert: true,
          contentType: `image/${fileExt}`
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Upload error:', error);
      return { url: null, error };
    }
  },

  // Update hair profile
  updateHairProfile: async (userId, hairData) => {
    try {
      // Check if hair profile exists
      const { data: existing } = await supabase
        .from('hair_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;
      
      if (existing) {
        // Update existing hair profile
        result = await supabase
          .from('hair_profiles')
          .update(hairData)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new hair profile
        result = await supabase
          .from('hair_profiles')
          .insert({ ...hairData, user_id: userId })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error updating hair profile:', error);
      return { data: null, error };
    }
  },

  // Get user's posts
  getUserPosts: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return { data: null, error };
    }
  },

  // Get user's saved posts
  getSavedPosts: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          posts (
            *,
            profiles (
              username,
              avatar_url,
              full_name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return { data: null, error };
    }
  },

  // Follow a user
  followUser: async (followerId, followingId) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error following user:', error);
      return { data: null, error };
    }
  },

  // Unfollow a user
  unfollowUser: async (followerId, followingId) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { error };
    }
  },

  // Check if a user is following another
  isFollowing: async (followerId, followingId) => {
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();
      return { isFollowing: !!data, error: null };
    } catch (error) {
      return { isFollowing: false, error };
    }
  },

  // Get list of followers for a user
  getFollowers: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)')
        .eq('following_id', userId);
      if (error) throw error;
      return { data: data.map(r => r.profiles).filter(Boolean), error: null };
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { data: [], error };
    }
  },

  // Get list of users a user is following
  getFollowing: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('profiles!follows_following_id_fkey(id, username, full_name, avatar_url)')
        .eq('follower_id', userId);
      if (error) throw error;
      return { data: data.map(r => r.profiles).filter(Boolean), error: null };
    } catch (error) {
      console.error('Error fetching following:', error);
      return { data: [], error };
    }
  },
};