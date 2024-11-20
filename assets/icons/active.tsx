import React from 'react';
import Svg, { Path, Rect } from "react-native-svg";

const ActiveIcon = ({ width, height, style }: { width: number, height: number, style?: object }) => (
<Svg width="14" height="15" viewBox="0 0 14 15" fill="none">
<Rect x="3" y="4.31812" width="2" height="10.1818" rx="1" fill="#050505"/>
<Rect x="3" y="4.31812" width="2" height="10.1818" rx="1" fill="#050505"/>
<Rect x="3" y="4.31812" width="2" height="10.1818" rx="1" fill="#050505"/>
<Rect y="5.59082" width="2" height="8.90909" rx="1" fill="#050505"/>
<Rect y="5.59082" width="2" height="8.90909" rx="1" fill="#050505"/>
<Rect y="5.59082" width="2" height="8.90909" rx="1" fill="#050505"/>
<Rect x="6" y="3.04541" width="2" height="11.4545" rx="1" fill="#050505"/>
<Rect x="6" y="3.04541" width="2" height="11.4545" rx="1" fill="#050505"/>
<Rect x="6" y="3.04541" width="2" height="11.4545" rx="1" fill="#050505"/>
<Rect x="9" y="1.77271" width="2" height="12.7273" rx="1" fill="#050505"/>
<Rect x="9" y="1.77271" width="2" height="12.7273" rx="1" fill="#050505"/>
<Rect x="9" y="1.77271" width="2" height="12.7273" rx="1" fill="#050505"/>
<Rect x="12" y="0.5" width="2" height="14" rx="1" fill="#BDBBBB"/>
</Svg>
);

export default ActiveIcon;
