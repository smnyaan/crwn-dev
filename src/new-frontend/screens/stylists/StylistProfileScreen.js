import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import ServiceCard from '../../components/ui/ServiceCard';
import ReviewCard from '../../components/ui/ReviewCard';

const TABS = ['Posts', 'Services', 'Reviews', 'Tagged'];

const SERVICES = [
  {
    id: '1',
    name: 'Box Braids',
    description: 'Classic box braids in various sizes. Includes consultation and hair prep.',
    duration: '4-6 hours',
    price: '$150',
  },
  {
    id: '2',
    name: 'Knotless Braids',
    description: 'Gentle knotless braiding technique for a natural look with less tension.',
    duration: '5-7 hours',
    price: '$200',
  },
  {
    id: '3',
    name: 'Cornrows',
    description: 'Neat cornrow styles, custom patterns available.',
    duration: '2-3 hours',
    price: '$80',
  },
];

const REVIEWS = [
  {
    id: '1',
    reviewerName: 'Sarah Johnson',
    timeAgo: '2 weeks ago',
    text: 'Jasmine is amazing! My braids lasted 8 weeks and looked fresh the whole time.',
    serviceTag: 'Box Braids',
    crownRating: 5,
  },
  {
    id: '2',
    reviewerName: 'Maya Thompson',
    timeAgo: '1 month ago',
    text: 'Best braider in Brooklyn! Professional, on time, and my hair feels great.',
    serviceTag: 'Knotless Braids',
    crownRating: 5,
  },
  {
    id: '3',
    reviewerName: 'Taylor Smith',
    timeAgo: '3 months ago',
    text: 'Great service, very professional. Will definitely book again!',
    serviceTag: 'Box Braids',
    crownRating: 4,
  },
];

export default function StylistProfileScreen({ navigation, route }) {
  const stylist = route?.params?.stylist || {};
  const [activeTab, setActiveTab] = useState('Services');

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {/* Back button row */}
      <View style={styles.backRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Profile header card */}
        <View style={styles.profileCard}>
          {/* Avatar + stats row */}
          <View style={styles.avatarStatsRow}>
            <View style={styles.avatarCircle}>
              {stylist.photos && stylist.photos[0] ? (
                <Image
                  source={{ uri: stylist.photos[0] }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <View style={styles.statsRow}>
              {[
                { value: '6', label: 'Posts' },
                { value: '300', label: 'Followers' },
                { value: '4.9', label: 'Rating' },
              ].map((stat) => (
                <View key={stat.label} style={styles.statCol}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Name */}
          <Text style={styles.stylistName}>{stylist.name || 'Jasmine Brown'}</Text>

          {/* Location + reviews row */}
          <View style={styles.locationReviewRow}>
            <Feather name="map-pin" size={13} color="#5E5E5E" />
            <Text style={styles.locationReviewText}>
              {stylist.location || 'Brooklyn, NY'}
              {' • '}
              <Text style={styles.crownYellow}>♛</Text>
              {` (${stylist.reviewCount || 127} reviews)`}
            </Text>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>
            Brooklyn-based braiding specialist with 8+ years of experience. Specializing in protective styles, natural hair care, and custom braid patterns.
          </Text>

          {/* Social icons */}
          <View style={styles.socialRow}>
            <TouchableOpacity activeOpacity={0.7}>
              <Feather name="globe" size={20} color="#5D1F1F" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Feather name="camera" size={20} color="#5D1F1F" />
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.bookButton} activeOpacity={0.85}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton} activeOpacity={0.85}>
              <Feather name="message-circle" size={16} color="#5D1F1F" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab bar — sticky */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'Posts' && (
            <Text style={styles.placeholderText}>Posts coming soon</Text>
          )}

          {activeTab === 'Services' && (
            <>
              {SERVICES.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
              <View style={styles.bottomPad} />
            </>
          )}

          {activeTab === 'Reviews' && (
            <>
              {REVIEWS.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <View style={styles.bottomPad} />
            </>
          )}

          {activeTab === 'Tagged' && (
            <Text style={styles.taggedPlaceholder}>No tagged posts</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  backRow: {
    backgroundColor: '#FFFFFF',
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
  scroll: {
    flex: 1,
  },

  /* Profile header card */
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  avatarStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4C8B8',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  statsRow: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 18,
    color: '#1A1A1A',
  },
  statLabel: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#5E5E5E',
  },
  stylistName: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 20,
    color: '#1A1A1A',
    marginTop: 12,
  },
  locationReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationReviewText: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
  },
  crownYellow: {
    color: '#F5A42A',
  },
  bio: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#5E5E5E',
    marginVertical: 8,
    lineHeight: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#5D1F1F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  messageButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#5D1F1F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  messageButtonText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#5D1F1F',
  },

  /* Tab bar */
  tabBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#ABABAB',
  },
  tabLabelActive: {
    fontFamily: 'Figtree-SemiBold',
    color: '#1A1A1A',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '100%',
    backgroundColor: '#F5A42A',
  },

  /* Tab content */
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#ABABAB',
    marginTop: 40,
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
  },
  taggedPlaceholder: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#ABABAB',
    textAlign: 'center',
    marginTop: 60,
  },
  bottomPad: {
    height: 120,
  },
});
