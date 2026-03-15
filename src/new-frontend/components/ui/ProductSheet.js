import React from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductRow from './ProductRow';

// Modal bottom sheet showing tagged products on a post.
export default function ProductSheet({ visible, products = [], onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{products.length} Products</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {products.map((p, i) => (
          <ProductRow
            key={i}
            name={p.name}
            retailer={p.retailer}
            imageUrl={p.imageUrl}
            onPress={() => {}}
          />
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 18,
    color: '#1A1A1A',
  },
  close: {
    fontFamily: 'Figtree-Regular',
    fontSize: 18,
    color: '#5E5E5E',
    padding: 4,
  },
});
