import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const PLACEHOLDER_REPLIES = [
  {
    id: 'r1',
    username: 'CurlyCrown',
    timeAgo: '1 day ago',
    text: "I love the As I Am Leave-In Conditioner! It's lightweight and actually absorbs into my low porosity 3B hair.",
    crownCount: 23,
    avatarColor: '#C4855A',
  },
  {
    id: 'r2',
    username: 'TextureTalk',
    timeAgo: '1 day ago',
    text: 'Have you tried applying products to damp hair with heat? I use a hooded dryer after applying leave-in and it helps with absorption.',
    crownCount: 15,
    avatarColor: '#5D1F1F',
  },
];

export default function ThreadDetailScreen({ navigation, route }) {
  const { thread } = route.params;
  const [replyText, setReplyText] = useState('');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back button row */}
        <View style={styles.backRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Original post card */}
          <View style={styles.postCard}>
            <View style={styles.postTopRow}>
              <Text style={styles.postUsername}>@{thread.username ?? 'CrwnUser'}</Text>
              <Text style={styles.postTag}>{thread.tag}</Text>
            </View>
            <Text style={styles.postTitle}>{thread.title}</Text>
            <Text style={styles.postBody}>{thread.body}</Text>
            <View style={styles.postBottomRow}>
              <Text style={styles.crownIcon}>♛</Text>
              <Text style={styles.postCount}>{thread.crownCount}</Text>
              <Text style={styles.separator}> • </Text>
              <Text style={styles.postTimeAgo}>{thread.timeAgo}</Text>
            </View>
          </View>

          {/* Replies heading */}
          <Text style={styles.repliesHeading}>
            {PLACEHOLDER_REPLIES.length} Replies
          </Text>

          {/* Reply cards */}
          {PLACEHOLDER_REPLIES.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyTopRow}>
                <Text style={styles.replyUsername}>@{reply.username}</Text>
                <Text style={styles.replyTimeAgo}>{reply.timeAgo}</Text>
              </View>
              <Text style={styles.replyBody}>{reply.text}</Text>
              <View style={styles.replyBottomRow}>
                <Text style={styles.crownIconSmall}>♛</Text>
                <Text style={styles.replyCount}>{reply.crownCount}</Text>
              </View>
            </View>
          ))}

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* Reply input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Add your reply..."
            placeholderTextColor="#ABABAB"
            multiline
          />
          <TouchableOpacity style={styles.postButton} activeOpacity={0.85}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  keyboardView: {
    flex: 1,
  },
  backRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F2EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Original post card
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  postUsername: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 13,
    color: '#5D1F1F',
  },
  postTag: {
    backgroundColor: '#F0EDED',
    color: '#5E5E5E',
    fontFamily: 'Figtree-Medium',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  postTitle: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    marginVertical: 8,
  },
  postBody: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#5E5E5E',
    lineHeight: 20,
    marginBottom: 12,
  },
  postBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crownIcon: {
    color: '#F5A42A',
    fontSize: 13,
  },
  postCount: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
  },
  separator: {
    color: '#D0D0D0',
    fontSize: 13,
  },
  postTimeAgo: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
  },

  // Replies heading
  repliesHeading: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 16,
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Reply cards
  replyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 1,
    padding: 16,
  },
  replyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyUsername: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 13,
    color: '#5D1F1F',
  },
  replyTimeAgo: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#ABABAB',
  },
  replyBody: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
    marginVertical: 8,
    lineHeight: 20,
  },
  replyBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crownIconSmall: {
    color: '#F5A42A',
    fontSize: 13,
  },
  replyCount: {
    fontFamily: 'Figtree-Medium',
    fontSize: 13,
    color: '#5E5E5E',
  },

  bottomPad: {
    height: 120,
  },

  // Reply input bar
  inputBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EDED',
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F2EFEB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
    maxHeight: 100,
  },
  postButton: {
    backgroundColor: '#7A8877',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  postButtonText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
