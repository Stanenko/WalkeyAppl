import React from 'react';
import Svg, { Path, Rect } from "react-native-svg";

const TablerIcon = ({ width, height, style }: { width: number, height: number, style?: object }) => (
<Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
<Rect width="20" height="20" rx="4" fill="white"/>
<Path d="M13.3333 4L16 6.66667M14.6667 5.33333L11.6667 8.33333M9.66667 6.33333L13.6667 10.3333M13 9.66667L8.66667 14H6M6 14V11.3333L10.3333 7M6 14L4 16M7 10.3333L8 11.3333M9 8.33333L10 9.33333" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>
);

export default TablerIcon;