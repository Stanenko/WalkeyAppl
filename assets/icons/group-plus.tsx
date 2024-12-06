import React from 'react';
import Svg, { Path } from "react-native-svg";

const GPlusIcon = ({ width, height, style, fill }: { width: number, height: number, style?: object, fill?: string; }) => (
<Svg width="16" height="17" viewBox="0 0 16 17" fill="none">
<Path d="M14 6.5H10V2.5C10 1.96957 9.78929 1.46086 9.41421 1.08579C9.03914 0.710714 8.53043 0.5 8 0.5C7.46957 0.5 6.96086 0.710714 6.58579 1.08579C6.21071 1.46086 6 1.96957 6 2.5L6.071 6.5H2C1.46957 6.5 0.960859 6.71071 0.585786 7.08579C0.210714 7.46086 0 7.96957 0 8.5C0 9.03043 0.210714 9.53914 0.585786 9.91421C0.960859 10.2893 1.46957 10.5 2 10.5L6.071 10.429L6 14.5C6 15.0304 6.21071 15.5391 6.58579 15.9142C6.96086 16.2893 7.46957 16.5 8 16.5C8.53043 16.5 9.03914 16.2893 9.41421 15.9142C9.78929 15.5391 10 15.0304 10 14.5V10.429L14 10.5C14.5304 10.5 15.0391 10.2893 15.4142 9.91421C15.7893 9.53914 16 9.03043 16 8.5C16 7.96957 15.7893 7.46086 15.4142 7.08579C15.0391 6.71071 14.5304 6.5 14 6.5Z" 
fill={fill || "#FFCDB4"}/>
</Svg>
);

export default GPlusIcon;