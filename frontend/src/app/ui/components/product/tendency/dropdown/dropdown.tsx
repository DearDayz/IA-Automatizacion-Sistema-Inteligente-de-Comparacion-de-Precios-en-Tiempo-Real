"use client";
import Image from "next/image";
import styles from "./dropdown.module.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Dropdown({
  includedStores,
}: {
  includedStores: string[];
}) {
  const searchParams = useSearchParams(); // Parámetros de la URL actual
  const pathname = usePathname(); // Ruta actual sin query params
  const { replace } = useRouter(); // Para cambiar la URL actual
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const tiendaMapReversa: { [name: string]: string } = {
      farmatodo: "fmt",
      tuzonamarket: "tzm",
      kromio: "km",
      promarket: "pm",
    };
    if (!initialized && searchParams && pathname) {
      if (!searchParams?.get("store")) {
        const params = new URLSearchParams(searchParams?.toString() || "");

        params.set("store", tiendaMapReversa[includedStores[0]]);
        replace(`${pathname}?${params.toString()}`);
      }
      setInitialized(true);
    }
    if (
      initialized == true &&
      searchParams?.get("store") !== "fmt" &&
      searchParams?.get("store") !== "tzm" &&
      searchParams?.get("store") !== "km" &&
      searchParams?.get("store") !== "pm"
    ) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("store", tiendaMapReversa[includedStores[0]]);

      replace(`${pathname}?${params.toString()}`);
    }
  }, [
    initialized,
    searchParams,
    pathname,
    replace,
    setInitialized,
    includedStores,
  ]);

  function onClick(event: any) {
    const element = event.target;
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (element.alt == "Farmatodo" || element.firstChild?.alt == "Farmatodo") {
      params.set("store", "fmt");
    } else if (element.alt == "Kromi" || element.firstChild?.alt == "Kromi") {
      params.set("store", "km");
    } else if (
      element.alt == "Tu Zona Market" ||
      element.firstChild?.alt == "Tu Zona Market"
    ) {
      params.set("store", "tzm");
    } else if (
      element.alt == "Promarket" ||
      element.firstChild?.alt == "Promarket"
    ) {
      params.set("store", "pm");
    }
    replace(`${pathname}?${params.toString()}`);
    const dropdown = document.getElementById("dropdownTiendas");
    if (dropdown) {
      dropdown.style.display = "none";
      setTimeout(() => {
        dropdown.style.display = "";
      }, 100);
    }
    /* router.refresh(); */
  }

  return (
    <div className={styles["dropdown"]}>
      <ul className={styles["list-store"]}>
        <li className={styles["store-selected"]}>
          {initialized ? (
            searchParams?.get("store") == "fmt" ? (
              <Image
                className={styles["image-store"]}
                src="/icons/banner-farmatodo.svg"
                width={100}
                height={20}
                alt="Icon store"
              />
            ) : searchParams?.get("store") == "tzm" ? (
              <Image
                className={`${styles["image-store"]} ${styles["image-tzm"]}`}
                src="/icons/banner-tzm.webp"
                width={100}
                height={20}
                alt="Icon store"
              />
            ) : searchParams?.get("store") == "km" ? (
              <Image
                className={`${styles["image-store"]} ${styles["image-km"]}`}
                src="/icons/banner_kromi_1.svg"
                width={100}
                height={20}
                alt="Icon store"
              />
            ) : searchParams?.get("store") == "pm" ? (
              <Image
                className={`${styles["image-store"]} ${styles["image-pm"]}`}
                src="/icons/banner_promarket.png"
                width={100}
                height={20}
                alt="Icon store"
              />
            ) : (
              <div>Cargando...</div>
            )
          ) : (
            <div>Cargando...</div>
          )}
        </li>
        <ul id="dropdownTiendas" className={styles["list-store-options"]}>
          {includedStores.includes("farmatodo") && (
            <li onClick={onClick} className={styles["store-option"]}>
              <Image
                className={styles["image-store"]}
                src="/icons/banner-farmatodo.svg"
                width={100}
                height={20}
                alt="Farmatodo"
              />
            </li>
          )}
          {includedStores.includes("tuzonamarket") && (
            <li onClick={onClick} className={styles["store-option"]}>
              <Image
                className={`${styles["image-store"]} ${styles["image-tzm"]}`}
                src="/icons/banner-tzm.webp"
                width={100}
                height={20}
                alt="Tu Zona Market"
              />
            </li>
          )}
          {includedStores.includes("kromi") && (
            <li onClick={onClick} className={styles["store-option"]}>
              <Image
                className={`${styles["image-store"]} ${styles["image-km"]}`}
                src="/icons/banner_kromi_1.svg"
                width={100}
                height={20}
                alt="Kromi"
              />
            </li>
          )}
          {includedStores.includes("promarket") && (
            <li onClick={onClick} className={styles["store-option"]}>
              <Image
                className={`${styles["image-store"]} ${styles["image-pm"]}`}
                src="/icons/banner_promarket.png"
                width={100}
                height={20}
                alt="Promarket"
              />
            </li>
          )}
        </ul>
      </ul>
      <Image
        src="/icons/stat_minus_blue.svg"
        alt="arrow"
        width={24}
        height={24}
      />
    </div>
  );
}
