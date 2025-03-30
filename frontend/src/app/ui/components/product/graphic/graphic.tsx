"use client";
import styles from "./graphic.module.css";
import App from "./prueba";

interface Data {
    time: string;
    value: number;
}

export default function Graphic({ data }: { data: Data[] }) {
  const initialData = [
    { time: "2018-12-22", value: 32.51 },
    { time: "2018-12-23", value: 31.11 },
    { time: "2018-12-24", value: 27.02 },
    { time: "2018-12-25", value: 27.32 },
    { time: "2018-12-26", value: 25.17 },
    { time: "2018-12-27", value: 28.89 },
    { time: "2018-12-28", value: 25.46 },
    { time: "2018-12-29", value: 23.92 },
    { time: "2018-12-30", value: 22.68 },
    { time: "2018-12-31", value: 22.67 },
  ];
  return (
    <div className={`${styles["graphic-container"]}`}>
      <h2 className={`${styles["title"]}`}>Gráfica</h2>
      <div className={ `${styles["container"]}` }>
        <App data={data}></App>
      </div>
    </div>
  );
}
