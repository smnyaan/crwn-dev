/**
 * Responsive scaling utilities for CRWN
 *
 * Base design target: iPhone 14/15 at 390px logical width.
 * All layout sizes and fonts scale proportionally with screen width.
 */

import { Dimensions, useWindowDimensions } from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = 390; // iPhone 14/15 logical width

/** Screen-size breakpoints. */
export const BP = {
  tablet: 600,
  desktop: 1024,
};

// ─── Static helpers (safe inside StyleSheet.create) ───────────────────────────

const { width: W, height: H } = Dimensions.get('window');

export const SCREEN_WIDTH  = W;
export const SCREEN_HEIGHT = H;

/** True when the device is tablet-sized or larger. */
export const isTablet  = W >= BP.tablet;
export const isDesktop = W >= BP.desktop;

/**
 * Scale a layout size (padding, margin, avatar, icon, border radius).
 * Grows proportionally with screen width, capped at 2x.
 */
export function s(size) {
  return Math.round(size * Math.min(W / BASE, 2));
}

/**
 * Scale a font size.
 * More conservative cap (1.5x) so text stays readable, not oversized.
 */
export function fs(size) {
  return Math.round(size * Math.min(W / BASE, 1.5));
}

// ─── Reactive hook (updates on orientation change) ────────────────────────────

/**
 * Returns current dimensions + device-type flags + live-updating scale fns.
 * Use this inside components that need to respond to screen rotation.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isTablet:  width >= BP.tablet,
    isDesktop: width >= BP.desktop,
    s:  (size) => Math.round(size * Math.min(width / BASE, 2)),
    fs: (size) => Math.round(size * Math.min(width / BASE, 1.5)),
  };
}
