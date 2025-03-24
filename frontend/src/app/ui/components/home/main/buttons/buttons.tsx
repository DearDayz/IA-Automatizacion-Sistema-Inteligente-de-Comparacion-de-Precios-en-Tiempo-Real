"use client";
import Image from "next/image";
import styles from "./buttons.module.css";

export default function Buttons() {
  return (
    <div className={`${styles["main__content-container-options"]}`}>
      <button className={`${styles["main__content-button-mostPopular"]} ${styles["main__content-button"]}`} type="button">
        Más Buscados
      </button>
      <div className={`${styles["main__content-container-buttons"]}`}>
        <button className={`${styles["main__content-button-sales"]} ${styles["main__content-button"]}`}>
          <Image
            className={`${styles["main__content-button-sale-icon"]}`}
            width={24}
            height={24}
            src="icons/sale.svg"
            alt="sale icon"
          />
          Ofertas
        </button>
        <button className={`${styles["main__content-button-filter"]} ${styles["main__content-button"]}`} type="button">
          <Image
            className={`${styles["main__content-button-filter-icon"]}`}
            width={24}
            height={24}
            src="icons/filter.svg"
            alt="filter icon"
          />
        </button>
      </div>
    </div>
  );
}
