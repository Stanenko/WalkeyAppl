import React from 'react';
import Svg, { Path } from "react-native-svg";

const ArrowDown = ({ width, height, style }: { width: number, height: number, style?: object }) => (
<Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<Path d="M18 8V11.8L12 16.4L6 11.8V8L12 12.6L18 8Z" fill="black"/>
</Svg>
);

export default ArrowDown;
