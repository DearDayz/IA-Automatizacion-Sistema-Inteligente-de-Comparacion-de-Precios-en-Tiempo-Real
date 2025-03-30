"use client";
import Image from "next/image";
import styles from "./buttons.module.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
export default function Buttons() {
  const searchParams = useSearchParams(); // Parámetros de la URL actual
  const pathname = usePathname(); // Ruta actual sin query params
  const { replace } = useRouter(); // Para cambiar la URL actual

  function handleClick() {
    const filter = document.getElementById("filter") as HTMLDivElement;
    if (filter) {
      filter.classList.toggle("expanded");
    }
  }

  function handleClickBuscados() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (searchParams?.get("mw")) {
      params.delete("mw");
    } else {
      params.set("mw", "true");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  function handleClickOfertas() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (searchParams?.get("offerts")) {
      params.delete("offerts");
    } else {
      params.set("offerts", "true");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={`${styles["main__content-container-options"]}`}>
      <button
        className={`${styles["main__content-button-mostPopular"]} ${styles["main__content-button"]}`}
        type="button"
        onClick={handleClickBuscados}
      >
        Más Buscados
      </button>
      <div className={`${styles["main__content-container-buttons"]}`}>
        <button
          type="button"
          onClick={handleClickOfertas}
          className={`${styles["main__content-button-sales"]} ${styles["main__content-button"]}`}
        >
          <Image
            className={`${styles["main__content-button-sale-icon"]}`}
            width={24}
            height={24}
            src="icons/sale.svg"
            alt="sale icon"
          />
          Ofertas
        </button>
        <button
          className={`${styles["main__content-button-filter"]} ${styles["main__content-button"]}`}
          type="button"
          onClick={handleClick}
        >
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
