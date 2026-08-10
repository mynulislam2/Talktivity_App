import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
} from 'react-native-svg';

export function GradientBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 393 852"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <SvgLinearGradient
            id="paint0"
            x1="-94.9658"
            y1="-732.015"
            x2="-94.9658"
            y2="226.085"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#00C2FF" stopOpacity="0" />
            <Stop offset="1" stopColor="#FF29C3" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient
            id="paint1"
            x1="86.0346"
            y1="-686.015"
            x2="86.0346"
            y2="272.084"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#00C2FF" stopOpacity="0" />
            <Stop offset="1" stopColor="#FF29C3" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <G opacity={0.32}>
          <Circle
            cx={337.313}
            cy={64.1746}
            r={228.628}
            fill="#609FFF"
            opacity={0.32}
          />
        </G>
        <G opacity={0.4}>
          <Circle
            cx={-95}
            cy={-253}
            r={479}
            fill="url(#paint0)"
            opacity={0.4}
          />
        </G>
        <G opacity={0.4}>
          <Circle cx={86} cy={-207} r={479} fill="url(#paint1)" opacity={0.4} />
        </G>
      </Svg>
    </View>
  );
}
