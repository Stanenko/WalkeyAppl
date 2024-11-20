import React from 'react';
import Svg, { Path, G, Defs, Rect, ClipPath } from 'react-native-svg';

const PhotoIcon = ({ width, height, color = "#FF6C22", style }: { width: number, height: number, color?: string, style?: object }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" style={style}>
    <G clipPath="url(#clip0_299_48118)">
      <Path
        d="M12.5 15L7.5 10L1.25 16.25V1.25H18.75V15M10 12.5L13.75 8.75L18.75 13.75V18.75H1.25V15"
        stroke={color} 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.25 7.5C7.28553 7.5 8.125 6.66053 8.125 5.625C8.125 4.58947 7.28553 3.75 6.25 3.75C5.21447 3.75 4.375 4.58947 4.375 5.625C4.375 6.66053 5.21447 7.5 6.25 7.5Z"
        stroke={color} 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_299_48118">
        <Rect width="20" height="20" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default PhotoIcon;
