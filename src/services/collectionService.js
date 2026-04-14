import { supabase } from '../config/supabase';

export const collectionService = {
  // Get all collections for a user
  async getCollections(userId) {
    const { data, error } = await supabase
      .from('bookmark_collections')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // Create a new collection
  async createCollection(userId, name) {
    const { data, error } = await supabase
      .from('bookmark_collections')
      .insert([{ user_id: userId, name }])
      .select()
      .single();
    return { data, error };
  },

  // Rename a collection
  async renameCollection(collectionId, name) {
    const { data, error } = await supabase
      .from('bookmark_collections')
      .update({ name })
      .eq('id', collectionId)
      .select()
      .single();
    return { data, error };
  },

  // Delete a collection (posts are not deleted, only the grouping)
  async deleteCollection(collectionId) {
    const { error } = await supabase
      .from('bookmark_collections')
      .delete()
      .eq('id', collectionId);
    return { error };
  },

  // Get post IDs in a collection
  async getCollectionPostIds(collectionId) {
    const { data, error } = await supabase
      .from('bookmark_collection_posts')
      .select('post_id')
      .eq('collection_id', collectionId);
    return { data: data?.map(r => r.post_id) ?? [], error };
  },

  // Add a post to a collection
  async addPostToCollection(collectionId, postId, userId) {
    const { data, error } = await supabase
      .from('bookmark_collection_posts')
      .insert([{ collection_id: collectionId, post_id: postId, user_id: userId }])
      .select()
      .single();
    return { data, error };
  },

  // Remove a post from a collection
  async removePostFromCollection(collectionId, postId) {
    const { error } = await supabase
      .from('bookmark_collection_posts')
      .delete()
      .eq('collection_id', collectionId)
      .eq('post_id', postId);
    return { error };
  },

  // Get all post IDs across all collections for a user (for UI state)
  async getAllCollectionMemberships(userId) {
    const { data, error } = await supabase
      .from('bookmark_collection_posts')
      .select('collection_id, post_id')
      .eq('user_id', userId);
    return { data, error };
  },
};
