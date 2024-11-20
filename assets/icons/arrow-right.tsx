import React from 'react';
import Svg, { Path } from "react-native-svg";

const ArrowRight = ({ width, height, style }: { width: number, height: number, style?: object }) => (
<Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M22.2 12L15.7 21H12.2L17.7 13.5H2V10.5H17.7L12.2 3H15.7L22.2 12Z" fill="white"/>
</Svg>
    
);

export default ArrowRight;
