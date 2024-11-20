import React from 'react';
import Svg, { Path } from 'react-native-svg';

const FemaleIcon = ({ width, height, color }: { width: number, height: number, color?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 37 37" fill="none">
    <Path
      d="M21.9578 0.5V4.28262H30.0107L22.2886 12.099L21.0652 13.3402C20.2077 12.6988 19.2735 12.1667 18.2844 11.7562C16.7232 11.1107 15.0504 10.7783 13.361 10.7781C11.6744 10.7781 9.99886 11.111 8.4407 11.7563C6.88052 12.4026 5.46268 13.3495 4.26788 14.543C3.07436 15.7377 2.12744 17.1555 1.48103 18.7157C0.835614 20.2741 0.500095 21.9524 0.5 23.6391C0.500181 25.3275 0.832557 26.9993 1.47819 28.5593C2.12543 30.1198 3.07333 31.5376 4.26788 32.7321C5.46264 33.9257 6.88044 34.8726 8.4406 35.519C9.99886 36.1643 11.6743 36.5 13.3609 36.5C15.0476 36.5 16.7261 36.1643 18.2843 35.5189C19.8445 34.8725 21.2622 33.9256 22.457 32.732C23.6505 31.5373 24.5974 30.1195 25.2438 28.5593C25.8894 26.9993 26.2217 25.3275 26.2218 23.6391C26.2216 21.9497 25.8892 20.2768 25.2436 18.7157C24.8479 17.7618 24.3389 16.859 23.7277 16.0266L24.9777 14.7589L32.7174 6.92175V15.0425H36.5V0.5H21.9578ZM13.3611 14.5607C14.5536 14.5622 15.7342 14.7971 16.8364 15.2522C17.9315 15.7058 18.9418 16.3823 19.7798 17.2204C20.6179 18.0582 21.2945 19.0687 21.7481 20.1636C22.2032 21.2658 22.4381 22.4465 22.4396 23.6389C22.4396 24.8241 22.2015 26.0163 21.7481 27.1114C21.2946 28.2061 20.6209 29.2194 19.783 30.0575C18.9448 30.8956 17.9316 31.5719 16.8365 32.0255C15.7344 32.4806 14.5537 32.7156 13.3612 32.7171C12.176 32.7171 10.9839 32.4792 9.88878 32.0255C8.7877 31.5681 7.78681 30.8996 6.94258 30.0576C6.1006 29.2133 5.43205 28.2123 4.97467 27.1112C4.52094 26.0161 4.28301 24.8241 4.28301 23.6389C4.2845 22.4465 4.51944 21.2658 4.97457 20.1636L4.98337 20.1428C5.43691 19.0559 6.10965 18.0501 6.94258 17.2173C7.77552 16.3846 8.78132 15.7144 9.86845 15.261L9.88907 15.2521C10.9841 14.7987 12.1761 14.5605 13.3613 14.5606L13.3611 14.5607Z"
      fill={color}
    />
  </Svg>
);

export default FemaleIcon;
