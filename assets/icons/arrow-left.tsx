import React from 'react';
import Svg, { Path } from "react-native-svg";

const ArrowLeft = ({ width, height, style }: { width: number, height: number, style?: object }) => (
<Svg width="36" height="64" viewBox="0 0 36 64" fill="none" >
<Path fill-rule="evenodd" clip-rule="evenodd" d="M10.029 32L31.242 50.856L27 54.6266L3.66596 33.8853C3.10354 33.3852 2.7876 32.7071 2.7876 32C2.7876 31.2929 3.10354 30.6147 3.66596 30.1146L27 9.37329L31.242 13.144L10.029 32Z" fill="black"/>
</Svg>
);

export default ArrowLeft;