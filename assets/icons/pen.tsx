import React from 'react';
import Svg, { Path } from "react-native-svg";

const PenIcon = ({ width, height, style }: { width: number, height: number, style?: object }) => (
<Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
<Path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 15H14.25C14.4489 15 14.6397 15.079 14.7803 15.2197C14.921 15.3603 15 15.5511 15 15.75C15 15.9489 14.921 16.1397 14.7803 16.2803C14.6397 16.421 14.4489 16.5 14.25 16.5H3.75C3.55109 16.5 3.36032 16.421 3.21967 16.2803C3.07902 16.1397 3 15.9489 3 15.75C3 15.5511 3.07902 15.3603 3.21967 15.2197C3.36032 15.079 3.55109 15 3.75 15ZM3 11.25L10.5 3.75L12.75 6L5.25 13.5H3V11.25ZM11.25 3L12.75 1.5L15 3.75L13.4993 5.25075L11.25 3Z" fill="black"/>
</Svg>
);

export default PenIcon;
