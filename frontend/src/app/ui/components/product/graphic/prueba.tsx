import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

interface DataPoint {
  time: string;
  value: number;
}

interface ChartColors {
  backgroundColor?: string;
  lineColor?: string;
  textColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
}

interface ChartComponentProps {
  data: DataPoint[];
  colors?: ChartColors;
}

export const ChartComponent: React.FC<ChartComponentProps> = (props) => {

  const {
    data,
    colors: {
      backgroundColor = '#f2f6fa',
      lineColor = '#2962FF',
      textColor = 'black',
      areaTopColor = '#2962FF',
      areaBottomColor = 'rgba(41, 98, 255, 0.28)',
    } = {},
  } = props;


  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    // FORMA CORRECTA según documentación oficial
    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 0 });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  return <div ref={chartContainerRef} />;
};

/* const initialData: DataPoint[] = [
  { time: '2018-12-21', value: 32.51 },
  { time: '2018-12-23', value: 31.11 },
  { time: '2018-12-24', value: 27.02 },
  { time: '2018-12-25', value: 27.32 },
  { time: '2018-12-26', value: 25.17 },
  { time: '2018-12-27', value: 28.89 },
  { time: '2018-12-28', value: 25.46 },
  { time: '2018-12-29', value: 23.92 },
  { time: '2018-12-30', value: 22.68 },
  { time: '2018-12-31', value: 22.67 },
]; */

export default function App(props: ChartComponentProps) {
  return <ChartComponent {...props} data={props.data} />;
}