/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/** Primary brand blue (tab accent, key actions, chips). */
export const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    /** Soft fill for selected chips / secondary surfaces */
    tintMuted: '#e3f3f8',
    /** Border for selected chips and outline controls */
    tintBorder: '#5aa3bd',
    /** Parallax header behind tab content */
    parallaxHeader: '#aedce8',
    tabBarBackground: '#f7fbfc',
    /** Subtle outline for empty states, cards, dividers */
    borderSubtle: '#e5e5e5',
    /** Elevated card / panel surface (Plan, Train, Analyze) */
    surfaceCard: '#FFFFFF',
    /** Inset fields, zebra rows, empty placeholders */
    surfaceMuted: '#fafafa',
    /** Primary card outline */
    borderCard: '#E8EBED',
    /** Divider between sections inside a card */
    borderDivider: '#EEF0F2',
    /** Hairline borders (secondary outlines, empty states) */
    borderHairline: '#eeeeee',
    /** Table / chart grid lines */
    borderTable: '#e8e8e8',
    /** Soft separator in summary blocks */
    borderSummarySoft: '#f0f0f0',
    /** Inactive chip / control outline */
    borderChip: '#dddddd',
    /** Text field border on cards */
    borderInput: '#dddddd',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    tintMuted: '#243a42',
    tintBorder: '#4d8fa3',
    parallaxHeader: '#1D3D47',
    tabBarBackground: '#151718',
    borderSubtle: '#3a3f42',
    surfaceCard: '#1e2224',
    surfaceMuted: '#151718',
    borderCard: '#2f3638',
    borderDivider: '#2f3638',
    borderHairline: '#2f3638',
    borderTable: '#2f3638',
    borderSummarySoft: '#2f3638',
    borderChip: '#2f3638',
    borderInput: '#3a4044',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
