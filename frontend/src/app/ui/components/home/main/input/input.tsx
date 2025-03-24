"use client";
import Image from "next/image";
import styles from "./input.module.css";

export default function Input() {
  return (
    <form className={`${styles["main__form"]}`} action="">
      <input
        className={`${styles["main__input"]}`}
        type="text"
        placeholder="Buscar"
      />
      <button className={`${styles["main__button"]}`} type="button">
        <Image
          className={`${styles["main__button-icon"]}`}
          src="icons/search.svg"
          alt="search icon"
          width={24}
          height={24}
        />
      </button>
    </form>
  );
}
