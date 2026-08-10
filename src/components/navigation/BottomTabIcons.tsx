/**
 * Bottom Tab Icons (React Native)
 *
 * Custom SVG icons matching talktivity_frontend/components/layout/MobileNavIcons.tsx
 */

import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IconProps {
  active?: boolean;
  size?: number;
  color?: string;
}

export function HomeTabIcon({
  active = false,
  size = 22.61,
  color = '#fff',
}: IconProps) {
  return (
    <Svg viewBox="0 0 22.6108 22.6108" width={size} height={size} fill="none">
      {active ? (
        <>
          <Path
            d="M2.82617 11.294V13.6591C2.82617 16.7679 2.82617 18.3223 3.79197 19.2881C4.75775 20.2539 6.31217 20.2539 9.421 20.2539H13.1895C16.2983 20.2539 17.8527 20.2539 18.8185 19.2881C19.7843 18.3223 19.7843 16.7679 19.7843 13.6591V11.294C19.7843 9.70998 19.7843 8.91806 19.449 8.2325C19.1137 7.54694 18.4886 7.06072 17.2383 6.0883L15.3541 4.62278C13.4091 3.11002 12.4366 2.35364 11.3052 2.35364C10.1738 2.35364 9.20138 3.11002 7.25641 4.62278L5.37216 6.0883C4.1219 7.06072 3.49676 7.54694 3.16147 8.2325C2.82617 8.91806 2.82617 9.70998 2.82617 11.294Z"
            stroke="url(#homeGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M14.1303 16.0149C13.3771 16.6012 12.3876 16.957 11.304 16.957C10.2202 16.957 9.23084 16.6012 8.47759 16.0149"
            stroke="url(#homeGradSec)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Defs>
            <LinearGradient
              id="homeGrad"
              x1="2.82617"
              y1="11.3038"
              x2="24.8274"
              y2="11.3038"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0.0014" stopColor="#0E55FF" />
              <Stop offset="1" stopColor="#C55DFE" />
            </LinearGradient>
            <LinearGradient
              id="homeGradSec"
              x1="8.47759"
              y1="16.4859"
              x2="15.8114"
              y2="16.4859"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0.0014" stopColor="#0E55FF" />
              <Stop offset="1" stopColor="#C55DFE" />
            </LinearGradient>
          </Defs>
        </>
      ) : (
        <Path
          d="M2.82617 11.294V13.6591C2.82617 16.7679 2.82617 18.3223 3.79197 19.2881C4.75775 20.2539 6.31217 20.2539 9.421 20.2539H13.1895C16.2983 20.2539 17.8527 20.2539 18.8185 19.2881C19.7843 18.3223 19.7843 16.7679 19.7843 13.6591V11.294C19.7843 9.70998 19.7843 8.91806 19.449 8.2325C19.1137 7.54694 18.4886 7.06072 17.2383 6.0883L15.3541 4.62278C13.4091 3.11002 12.4366 2.35364 11.3052 2.35364C10.1738 2.35364 9.20138 3.11002 7.25641 4.62278L5.37216 6.0883C4.1219 7.06072 3.49676 7.54694 3.16147 8.2325C2.82617 8.91806 2.82617 9.70998 2.82617 11.294Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

export function DiscoverTabIcon({ size = 22.61, color = '#fff' }: IconProps) {
  return (
    <Svg viewBox="0 0 22.61 22.61" width={size} height={size} fill="none">
      <Path
        d="M20.7258 11.305C20.7258 6.10202 16.5079 1.88417 11.305 1.88417C6.10202 1.88417 1.88417 6.10202 1.88417 11.305C1.88417 16.5079 6.10202 20.7258 11.305 20.7258C16.5079 20.7258 20.7258 16.5079 20.7258 11.305Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M11.6832 7.81737L14.4339 6.90043C15.2688 6.62213 15.6863 6.48298 15.9067 6.70334C16.1271 6.9237 15.9879 7.34116 15.7095 8.17607L14.7926 10.9269C14.3183 12.3496 14.0812 13.061 13.5711 13.5711C13.061 14.0812 12.3496 14.3183 10.9269 14.7926L8.17607 15.7095C7.34116 15.9879 6.9237 16.1271 6.70334 15.9067C6.48298 15.6863 6.62213 15.2688 6.90043 14.4339L7.81737 11.6832C8.29162 10.2604 8.52874 9.54905 9.03889 9.03889C9.54905 8.52874 10.2604 8.29162 11.6832 7.81737Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.304 11.305L11.2976 11.3114"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CommunityTabIcon({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg viewBox="0 0 22 22" width={size} height={size} fill="none">
      <Path
        d="M11.9167 10.0833C11.9167 8.05829 10.275 6.41667 8.25 6.41667C6.22496 6.41667 4.58333 8.05829 4.58333 10.0833C4.58333 12.1083 6.22496 13.75 8.25 13.75C10.275 13.75 11.9167 12.1083 11.9167 10.0833Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.1187 6.92792C10.0953 6.76085 10.0833 6.59016 10.0833 6.41667C10.0833 4.39162 11.725 2.75 13.75 2.75C15.775 2.75 17.4167 4.39162 17.4167 6.41667C17.4167 8.44171 15.775 10.0833 13.75 10.0833C13.0674 10.0833 12.4285 9.89688 11.8813 9.57211"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.75 19.25C13.75 16.2124 11.2876 13.75 8.25 13.75C5.21243 13.75 2.75 16.2124 2.75 19.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.25 15.5833C19.25 12.5458 16.7876 10.0833 13.75 10.0833"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfileTabIcon({ size = 22.61, color = '#fff' }: IconProps) {
  return (
    <Svg viewBox="0 0 22.61 22.61" width={size} height={size} fill="none">
      <Path
        d="M14.6023 9.89188C14.6023 8.07083 13.126 6.59458 11.305 6.59458C9.48395 6.59458 8.00771 8.07083 8.00771 9.89188C8.00771 11.7129 9.48395 13.1892 11.305 13.1892C13.126 13.1892 14.6023 11.7129 14.6023 9.89188Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.7258 11.305C20.7258 6.10202 16.5079 1.88417 11.305 1.88417C6.10202 1.88417 1.88417 6.10202 1.88417 11.305C1.88417 16.5079 6.10202 20.7258 11.305 20.7258C16.5079 20.7258 20.7258 16.5079 20.7258 11.305Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.9575 18.8417C16.9575 15.7199 14.4268 13.1892 11.305 13.1892C8.18321 13.1892 5.6525 15.7199 5.6525 18.8417"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
