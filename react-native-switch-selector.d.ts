declare module "react-native-switch-selector" {
  import { Component } from "react";
  import type { StyleProp, TextStyle, ViewStyle } from "react-native";

  export interface SwitchSelectorOption {
    label: string;
    value: string;
    disabled?: boolean;
    accessibilityLabel?: string;
    testID?: string;
  }

  export interface SwitchSelectorProps {
    initial?: number;
    value?: number;
    onPress?: (value: string) => void;
    options?: SwitchSelectorOption[];
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    selectedTextStyle?: StyleProp<TextStyle>;
    fontSize?: number;
    hasPadding?: boolean;
    valuePadding?: number;
    height?: number;
    borderRadius?: number;
    borderWidth?: number;
    animationDuration?: number;
    backgroundColor?: string;
    borderColor?: string;
    buttonColor?: string;
    textColor?: string;
    selectedColor?: string;
    disableValueChangeOnPress?: boolean;
    bold?: boolean;
    buttonMargin?: number;
    returnObject?: boolean;
    disabled?: boolean;
    accessibilityLabel?: string;
    testID?: string;
  }

  export default class SwitchSelector extends Component<SwitchSelectorProps> {}
}
