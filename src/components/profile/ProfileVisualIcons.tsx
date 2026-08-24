/**
 * Profile Visual Icons (React Native)
 *
 * SVG icon components matching talktivity_frontend/components/profile/ProfileVisualIcons.tsx
 */

import React from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface IconProps {
  size?: number;
}

export function ProfileCameraBadgeIcon({ size = 30 }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 6,
      }}
    >
      <Svg
        viewBox="0 0 20 20"
        width={size * 0.52}
        height={size * 0.52}
        fill="none"
      >
        <Path
          d="M5.7 7.1h1.6l1-1.55h3.3l1 1.55h1.68c.72 0 1.3.58 1.3 1.3v4.8c0 .72-.58 1.3-1.3 1.3H5.7c-.72 0-1.3-.58-1.3-1.3V8.4c0-.72.58-1.3 1.3-1.3Z"
          stroke="#1e223f"
          strokeWidth="1.85"
          strokeLinejoin="round"
        />
        <Circle cx="10" cy="10.7" r="2.2" stroke="#1e223f" strokeWidth="1.85" />
      </Svg>
    </View>
  );
}

export function UpgradeMagicIcon({ size = 16, color = '#fff' }: IconProps & { color?: string }) {
  return (
    <Svg viewBox="0 0 20 20" width={size} height={size} fill="none" color={color}>
      <Path
        d="M10 2.5 11.35 6l3.65 1.35-3.65 1.3L10 12.15 8.65 8.65 5 7.35 8.65 6 10 2.5Z"
        fill="currentColor"
      />
      <Path
        d="m14.7 11.7.7 1.9 1.9.7-1.9.68-.7 1.92-.68-1.92-1.92-.68 1.92-.7.68-1.9Z"
        fill="currentColor"
      />
    </Svg>
  );
}

export function PointsOrbIcon({ size = 52 }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2949ff',
        shadowColor: 'rgba(30,80,255,0.35)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <Svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        fill="none"
      >
        <Path
          d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2Z"
          fill="#fff"
        />
        <Path
          d="m16.5 13.5.75 2.25L19.5 16.5l-2.25.75-.75 2.25-.75-2.25-2.25-.75 2.25-.75.75-2.25Z"
          fill="rgba(255,255,255,0.7)"
        />
      </Svg>
    </View>
  );
}

export function StreakOrbIcon({ size = 52 }: IconProps) {
  return (
    <Svg viewBox="0 0 52 60" width={size} height={size} fill="none">
      <Defs>
        <LinearGradient
          id="streakOuter"
          x1="26"
          y1="2"
          x2="26"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#ffd644" />
          <Stop offset="0.3" stopColor="#ff8c1a" />
          <Stop offset="0.65" stopColor="#ff4e11" />
          <Stop offset="1" stopColor="#b52800" />
        </LinearGradient>
        <LinearGradient
          id="streakMid"
          x1="26"
          y1="16"
          x2="26"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#ffe577" />
          <Stop offset="0.45" stopColor="#ffa726" />
          <Stop offset="1" stopColor="#e64a19" />
        </LinearGradient>
        <LinearGradient
          id="streakCore"
          x1="26"
          y1="30"
          x2="26"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#fff9c4" />
          <Stop offset="0.5" stopColor="#ffcc02" />
          <Stop offset="1" stopColor="#ff9800" />
        </LinearGradient>
      </Defs>
      <Path
        d="M26 2c2.6 8 10 12.4 10 21.4 0 5-2.3 9-6.4 12.5.1-3.7-1.4-6.7-4.4-9.5-6.2 3.8-9.4 8.2-9.4 14.2 0 7.7 5.5 13 13.3 13 8.6 0 14.7-6.5 14.7-15.7C43.8 27.2 35.5 20.2 26 2Z"
        fill="url(#streakOuter)"
      />
      <Path
        d="M26.2 17.5c1.8 3.8 5 6.2 5 10.6 0 3.7-2 6.5-5.9 8.6-.3-2.2-1.3-3.9-3-5.5-3.2 2.1-4.7 4.5-4.7 7.7 0 4.3 3 7.3 7.1 7.3 4.8 0 8.2-3.5 8.2-8.5 0-6.4-4-10.8-6.7-20.2Z"
        fill="url(#streakMid)"
      />
      <Path
        d="M26.4 31c1.1 1.9 2.9 3.2 2.9 5.6 0 1.9-1 3.3-3.1 4.5-.15-1.1-.6-2-1.3-2.8-1.7 1.2-2.5 2.5-2.5 4.3 0 2.4 1.7 4 4 4 2.6 0 4.4-1.8 4.4-4.5 0-3.2-2-5.7-4.4-11.1Z"
        fill="url(#streakCore)"
      />
      <Ellipse cx="21" cy="16" rx="1.5" ry="1.5" fill="white" opacity="0.35" />
      <Ellipse cx="33" cy="12" rx="1" ry="1" fill="white" opacity="0.25" />
    </Svg>
  );
}

export function PhoneBubbleIcon({ size = 26 }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#2949ff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(84,86,255,0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 4,
      }}
    >
      <Svg
        viewBox="0 0 20 20"
        width={size * 0.54}
        height={size * 0.54}
        fill="none"
      >
        <Rect
          x="6.4"
          y="4.1"
          width="7.2"
          height="11.8"
          rx="1.8"
          stroke="#fff"
          strokeWidth="1.4"
        />
        <Path
          d="M9 13.5h2"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function WaveBubbleIcon({ size = 52 }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#2949ff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(197,93,254,0.28)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 6,
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size - 20,
          height: size - 20,
          borderRadius: (size - 20) / 2,
          backgroundColor: 'rgba(122,92,255,0.85)',
        }}
      />
      <Svg
        viewBox="0 0 40 40"
        width={size * 0.46}
        height={size * 0.46}
        fill="none"
      >
        <Path
          d="M11 24c1.7-5.8 3.4-5.8 5.1 0 1.7 5.8 3.4 5.8 5.1 0 1.7-5.8 3.4-5.8 5.1 0"
          stroke="#fff"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function MicBubbleIcon({ size = 34 }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#2949ff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(84,86,255,0.18)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <Svg
        viewBox="0 0 20 20"
        width={size * 0.47}
        height={size * 0.47}
        fill="none"
      >
        <Rect
          x="7"
          y="3.8"
          width="6"
          height="8.2"
          rx="3"
          stroke="#fff"
          strokeWidth="1.5"
        />
        <Path
          d="M5.3 9.6a4.7 4.7 0 0 0 9.4 0"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M10 14v2.4"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
