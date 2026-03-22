import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  /** Android: removes extra font padding that can clip descenders */
  includeFontPadding?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const typeStyle =
    type === 'default'
      ? styles.default
      : type === 'title'
        ? styles.title
        : type === 'defaultSemiBold'
          ? styles.defaultSemiBold
          : type === 'subtitle'
            ? styles.subtitle
            : type === 'link'
              ? styles.link
              : undefined;

  const flattened = StyleSheet.flatten([typeStyle, style]) as TextStyle | undefined;
  const resolvedColor =
    flattened != null && flattened.color != null ? flattened.color : themeColor;

  return (
    <Text
      style={[typeStyle, style, { color: resolvedColor }]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
