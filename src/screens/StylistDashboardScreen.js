import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { bookingService } from '../services/bookingService';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Calendar', 'Services'];
const CAL_VIEWS = ['Day', 'Week', 'Month'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM – 7 PM

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function bookingsForDay(bookings, day) {
  return bookings.filter(b => {
    if (!b.appointment_date) return false;
    const bd = new Date(b.appointment_date + 'T00:00:00');
    return sameDay(bd, day);
  });
}

function statusColor(status) {
  switch (status) {
    case 'upcoming':  return '#F8B430';
    case 'completed': return '#22c55e';
    case 'cancelled': return '#ef4444';
    default:          return '#9ca3af';
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, colors, styles }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BookingRow({ booking, colors, styles, onStatusChange }) {
  const clientName =
    booking.client?.full_name ||
    booking.client?.username ||
    'Client';

  return (
    <View style={styles.bookingRow}>
      <View style={[styles.statusDot, { backgroundColor: statusColor(booking.status) }]} />
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingClient} numberOfLines={1}>{clientName}</Text>
        <Text style={styles.bookingService} numberOfLines={1}>{booking.service_name}</Text>
        <Text style={styles.bookingDate}>{formatDate(booking.appointment_date)}</Text>
      </View>
      <View style={styles.bookingActions}>
        {booking.status === 'upcoming' && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#dcfce7' }]}
              onPress={() => onStatusChange(booking.id, 'completed')}
            >
              <Ionicons name="checkmark" size={14} color="#16a34a" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}
              onPress={() => onStatusChange(booking.id, 'cancelled')}
            >
              <Ionicons name="close" size={14} color="#dc2626" />
            </TouchableOpacity>
          </>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColor(booking.status) + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor(booking.status) }]}>
            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AddServiceModal({ visible, onClose, onSave, colors, styles }) {
  const [name, setName]           = useState('');
  const [price, setPrice]         = useState('');
  const [duration, setDuration]   = useState('');
  const [desc, setDesc]           = useState('');
  const [saving, setSaving]       = useState(false);

  const reset = () => { setName(''); setPrice(''); setDuration(''); setDesc(''); };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Required', 'Please enter a service name and price.');
      return;
    }
    setSaving(true);
    await onSave({ name: name.trim(), price: parseFloat(price), duration_min: parseInt(duration) || null, description: desc.trim() || null });
    setSaving(false);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Service</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>Service Name *</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              placeholder="e.g. Box Braids" placeholderTextColor={colors.placeholder}
              value={name} onChangeText={setName} />

            <Text style={styles.inputLabel}>Price ($) *</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              placeholder="e.g. 150" placeholderTextColor={colors.placeholder}
              keyboardType="decimal-pad" value={price} onChangeText={setPrice} />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              placeholder="e.g. 120" placeholderTextColor={colors.placeholder}
              keyboardType="number-pad" value={duration} onChangeText={setDuration} />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              placeholder="Describe what's included..." placeholderTextColor={colors.placeholder}
              multiline numberOfLines={4} textAlignVertical="top"
              value={desc} onChangeText={setDesc} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient colors={['#5D1F1F', '#C8835A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>Save Service</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function StylistDashboardScreen() {
  const { user, profileLoaded } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!profileLoaded || !user) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  const [activeTab, setActiveTab]       = useState('Overview');
  const [calView, setCalView]           = useState('Month');
  const [bookings, setBookings]         = useState([]);
  const [services, setServices]         = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [addServiceVisible, setAddServiceVisible] = useState(false);

  // Calendar state
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [selectedDay, setSelectedDay]   = useState(today);
  const [calMonth, setCalMonth]         = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calWeekStart, setCalWeekStart] = useState(startOfWeek(today));

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await bookingService.getBookingsByStylist(user.id);
    setBookings(data || []);
    setLoadingBookings(false);
  }, [user?.id]);

  const loadServices = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await bookingService.getServices(user.id);
    setServices(data || []);
    setLoadingServices(false);
  }, [user?.id]);

  useEffect(() => { loadBookings(); }, [loadBookings]);
  useEffect(() => { loadServices(); }, [loadServices]);

  // ── Booking status update ─────────────────────────────────────────────────

  const handleStatusChange = async (bookingId, status) => {
    const { error } = await bookingService.updateBookingStatus(bookingId, status);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    }
  };

  // ── Service CRUD ──────────────────────────────────────────────────────────

  const handleAddService = async (service) => {
    const { data, error } = await bookingService.addService(user.id, service);
    if (!error && data) setServices(prev => [...prev, data]);
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert('Delete Service', 'Remove this service from your profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const { error } = await bookingService.deleteService(serviceId);
          if (!error) setServices(prev => prev.filter(s => s.id !== serviceId));
        },
      },
    ]);
  };

  // ── Analytics ─────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const upcoming  = bookings.filter(b => b.status === 'upcoming').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const clients   = new Set(bookings.map(b => b.client?.id).filter(Boolean)).size;
    return { upcoming, completed, clients, total: bookings.length };
  }, [bookings]);

  // ── Calendar helpers ──────────────────────────────────────────────────────

  const monthDays = useMemo(() => {
    const year  = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const first = new Date(year, month, 1).getDay(); // 0 = Sun
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [calMonth]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(calWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [calWeekStart]);

  // ── Render tabs ───────────────────────────────────────────────────────────

  const renderOverview = () => {
    const upcoming = bookings.filter(b => b.status === 'upcoming').slice(0, 10);

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Upcoming" value={stats.upcoming}  icon="calendar-outline"  colors={colors} styles={styles} />
          <StatCard label="Completed" value={stats.completed} icon="checkmark-circle-outline" colors={colors} styles={styles} />
          <StatCard label="Clients"   value={stats.clients}   icon="people-outline"    colors={colors} styles={styles} />
        </View>

        {/* Upcoming bookings */}
        <Text style={styles.sectionTitle}>Upcoming Bookings</Text>

        {loadingBookings ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.border} />
            <Text style={styles.emptyTitle}>No upcoming bookings</Text>
            <Text style={styles.emptyText}>Share your profile to start getting booked</Text>
          </View>
        ) : (
          upcoming.map(b => (
            <BookingRow
              key={b.id}
              booking={b}
              colors={colors}
              styles={styles}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </ScrollView>
    );
  };

  const renderCalendar = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* View toggle */}
      <View style={styles.calViewRow}>
        {CAL_VIEWS.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.calViewBtn, calView === v && styles.calViewBtnActive]}
            onPress={() => setCalView(v)}
          >
            <Text style={[styles.calViewText, calView === v && styles.calViewTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {calView === 'Month' && renderMonthView()}
      {calView === 'Week'  && renderWeekView()}
      {calView === 'Day'   && renderDayView()}
    </ScrollView>
  );

  const renderMonthView = () => (
    <View>
      {/* Month nav */}
      <View style={styles.calNav}>
        <TouchableOpacity onPress={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.calNavTitle}>{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</Text>
        <TouchableOpacity onPress={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.calDayHeaders}>
        {DAYS_SHORT.map(d => (
          <Text key={d} style={styles.calDayHeader}>{d}</Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.calGrid}>
        {monthDays.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={styles.calCell} />;
          const isToday   = sameDay(day, today);
          const isSelected = sameDay(day, selectedDay);
          const dots = bookingsForDay(bookings, day);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.calCell, isSelected && styles.calCellSelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.calCellText, isToday && styles.calCellToday, isSelected && styles.calCellSelectedText]}>
                {day.getDate()}
              </Text>
              {dots.length > 0 && (
                <View style={styles.calDotRow}>
                  {dots.slice(0, 3).map((_, di) => (
                    <View key={di} style={[styles.calDot, { backgroundColor: colors.primary }]} />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day bookings */}
      <View style={styles.calDayBookings}>
        <Text style={styles.calDayBookingsTitle}>
          {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {bookingsForDay(bookings, selectedDay).length === 0 ? (
          <Text style={styles.calEmptyText}>No bookings this day</Text>
        ) : (
          bookingsForDay(bookings, selectedDay).map(b => (
            <BookingRow key={b.id} booking={b} colors={colors} styles={styles} onStatusChange={handleStatusChange} />
          ))
        )}
      </View>
    </View>
  );

  const renderWeekView = () => (
    <View>
      {/* Week nav */}
      <View style={styles.calNav}>
        <TouchableOpacity onPress={() => setCalWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; })}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.calNavTitle}>
          {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => setCalWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; })}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week day columns */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => {
          const isToday    = sameDay(day, today);
          const isSelected = sameDay(day, selectedDay);
          const count = bookingsForDay(bookings, day).length;
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.weekCell, isSelected && styles.weekCellSelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.weekDayLabel, isToday && { color: colors.primary }]}>{DAYS_SHORT[day.getDay()]}</Text>
              <View style={[styles.weekDayNum, isSelected && { backgroundColor: colors.primary }]}>
                <Text style={[styles.weekDayNumText, isSelected && { color: '#fff' }]}>{day.getDate()}</Text>
              </View>
              {count > 0 && (
                <View style={[styles.weekBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.weekBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bookings for selected day */}
      <View style={styles.calDayBookings}>
        <Text style={styles.calDayBookingsTitle}>
          {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        {bookingsForDay(bookings, selectedDay).length === 0 ? (
          <Text style={styles.calEmptyText}>No bookings this day</Text>
        ) : (
          bookingsForDay(bookings, selectedDay).map(b => (
            <BookingRow key={b.id} booking={b} colors={colors} styles={styles} onStatusChange={handleStatusChange} />
          ))
        )}
      </View>
    </View>
  );

  const renderDayView = () => {
    const dayBookings = bookingsForDay(bookings, selectedDay);

    return (
      <View>
        {/* Day nav */}
        <View style={styles.calNav}>
          <TouchableOpacity onPress={() => setSelectedDay(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.calNavTitle}>
            {selectedDay.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setSelectedDay(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hour slots */}
        {HOURS.map(h => {
          const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
          const slotBookings = dayBookings.filter(b => {
            if (!b.appointment_time) return false;
            const bh = parseInt(b.appointment_time.split(':')[0]);
            return bh === h;
          });
          return (
            <View key={h} style={styles.hourRow}>
              <Text style={styles.hourLabel}>{label}</Text>
              <View style={styles.hourLine} />
              {slotBookings.map(b => (
                <View key={b.id} style={[styles.hourBooking, { backgroundColor: colors.primaryLight, borderLeftColor: colors.primary }]}>
                  <Text style={[styles.hourBookingName, { color: colors.primary }]} numberOfLines={1}>
                    {b.client?.full_name || b.client?.username || 'Client'}
                  </Text>
                  <Text style={styles.hourBookingService} numberOfLines={1}>{b.service_name}</Text>
                </View>
              ))}
            </View>
          );
        })}

        {dayBookings.filter(b => !b.appointment_time).length > 0 && (
          <View style={styles.calDayBookings}>
            <Text style={styles.calDayBookingsTitle}>All Day / No Time Set</Text>
            {dayBookings.filter(b => !b.appointment_time).map(b => (
              <BookingRow key={b.id} booking={b} colors={colors} styles={styles} onStatusChange={handleStatusChange} />
            ))}
          </View>
        )}

        {dayBookings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.calEmptyText}>No bookings this day</Text>
          </View>
        )}
      </View>
    );
  };

  const renderServices = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <TouchableOpacity style={styles.addServiceBtn} onPress={() => setAddServiceVisible(true)}>
        <LinearGradient colors={['#5D1F1F', '#C8835A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addServiceBtnText}>Add Service</Text>
      </TouchableOpacity>

      {loadingServices ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : services.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cut-outline" size={40} color={colors.border} />
          <Text style={styles.emptyTitle}>No services yet</Text>
          <Text style={styles.emptyText}>Add your first service to let clients know what you offer</Text>
        </View>
      ) : (
        services.map(s => (
          <View key={s.id} style={styles.serviceCard}>
            <View style={styles.serviceLeft}>
              <Text style={styles.serviceName}>{s.name}</Text>
              {s.description ? <Text style={styles.serviceDesc} numberOfLines={2}>{s.description}</Text> : null}
              {s.duration_min ? <Text style={styles.serviceMeta}>{s.duration_min} min</Text> : null}
            </View>
            <View style={styles.serviceRight}>
              <Text style={styles.servicePrice}>${s.price?.toFixed(2) ?? '—'}</Text>
              <TouchableOpacity onPress={() => handleDeleteService(s.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#5D1F1F', '#C8835A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Studio</Text>
        <Text style={styles.headerSub}>Manage your bookings & services</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'Overview'  && renderOverview()}
        {activeTab === 'Calendar'  && renderCalendar()}
        {activeTab === 'Services'  && renderServices()}
      </View>

      <AddServiceModal
        visible={addServiceVisible}
        onClose={() => setAddServiceVisible(false)}
        onSave={handleAddService}
        colors={colors}
        styles={styles}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Figtree_700Bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Figtree_400Regular',
  },

  // ── Top tabs ──
  tabs: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#5D1F1F',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
    color: c.textSecondary,
  },
  tabTextActive: {
    fontFamily: 'Figtree_700Bold',
    color: '#5D1F1F',
  },
  content: { flex: 1 },
  tabContent: { padding: 16, paddingBottom: 32 },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
  },
  statLabel: {
    fontSize: 11,
    color: c.textMuted,
    fontFamily: 'Figtree_500Medium',
    textAlign: 'center',
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // ── Booking row ──
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.borderLight,
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bookingInfo: { flex: 1 },
  bookingClient: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    marginBottom: 2,
  },
  bookingService: {
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: c.textMuted,
  },
  bookingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
  },

  // ── Calendar ──
  calViewRow: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.border,
  },
  calViewBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  calViewBtnActive: {
    backgroundColor: '#5D1F1F',
  },
  calViewText: {
    fontSize: 13,
    fontFamily: 'Figtree_500Medium',
    color: c.textSecondary,
  },
  calViewTextActive: {
    color: '#fff',
    fontFamily: 'Figtree_600SemiBold',
  },
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  calNavTitle: {
    fontSize: 16,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
  },
  calDayHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textMuted,
    textTransform: 'uppercase',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  calCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calCellSelected: {
    backgroundColor: '#5D1F1F',
  },
  calCellText: {
    fontSize: 14,
    color: c.text,
    fontFamily: 'Figtree_500Medium',
  },
  calCellToday: {
    color: '#C8835A',
    fontFamily: 'Figtree_700Bold',
  },
  calCellSelectedText: {
    color: '#fff',
    fontFamily: 'Figtree_700Bold',
  },
  calDotRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  calDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  calDayBookings: {
    marginTop: 16,
  },
  calDayBookingsTitle: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    marginBottom: 10,
  },
  calEmptyText: {
    fontSize: 13,
    color: c.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // ── Week view ──
  weekRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 4,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.borderLight,
    gap: 4,
  },
  weekCellSelected: {
    borderColor: '#5D1F1F',
  },
  weekDayLabel: {
    fontSize: 10,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textMuted,
    textTransform: 'uppercase',
  },
  weekDayNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayNumText: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
  },
  weekBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  weekBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontFamily: 'Figtree_700Bold',
  },

  // ── Day view ──
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
    marginBottom: 2,
  },
  hourLabel: {
    width: 52,
    fontSize: 11,
    color: c.textMuted,
    fontFamily: 'Figtree_400Regular',
    paddingTop: 4,
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: c.borderLight,
    marginTop: 10,
  },
  hourBooking: {
    position: 'absolute',
    left: 60,
    right: 0,
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 6,
  },
  hourBookingName: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
  },
  hourBookingService: {
    fontSize: 11,
    color: c.textSecondary,
  },

  // ── Services ──
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
  },
  addServiceBtnText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: '#fff',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.borderLight,
    gap: 12,
  },
  serviceLeft: { flex: 1 },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 13,
    color: c.textSecondary,
    lineHeight: 18,
    marginBottom: 3,
  },
  serviceMeta: {
    fontSize: 12,
    color: c.textMuted,
  },
  serviceRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  servicePrice: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
  },
  emptyText: {
    fontSize: 13,
    color: c.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 19,
  },

  // ── Add service modal ──
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textSecondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
  },
  saveBtn: {
    margin: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: '#fff',
  },
});
