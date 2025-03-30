"use client";
import Image from "next/image";
import styles from "./coin.module.css";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useGlobalContext } from "../../context/GlobalContext";

export default function Coin() {
  const { cash, setCash, setRate } = useGlobalContext();
  const [price, setPrice] = useState("");
  const [initialized, setInitialized] = useState(false);

  const searchParams = useSearchParams(); // Parámetros de la URL actual
  const pathname = usePathname(); // Ruta actual sin query params
  const { replace } = useRouter(); // Para cambiar la URL actual

  let money = "";
  if (searchParams?.get("cash") === "usd") {
    money = "$.";
  } else {
    money = "Bs.";
  }

  // Este efecto se encarga de corregir la URL solo una vez en el cliente
  useEffect(() => {
    // Evitamos correr el efecto más de una vez
    if (!initialized && searchParams && pathname) {
      if (
        searchParams.get("cash") !== "ves" &&
        searchParams.get("cash") !== "usd"
      ) {
        const params = new URLSearchParams(searchParams.toString() || "");
        params.set("cash", "usd");
        replace(`${pathname}?${params.toString()}`);
        console.log("Actualizando parámetros de URL");
        setCash("$");
      }
      setInitialized(true);
    }
    if (
      initialized == true &&
      searchParams?.get("cash") !== "ves" &&
      searchParams?.get("cash") !== "usd"
    ) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if ( cash == "$" ){
        params.set("cash", "usd");
      }
      else{
        setCash("Bs");
        params.set("cash", "ves");
      }
      replace(`${pathname}?${params.toString()}`);
      console.log("Actualizando parámetros de URL");
    }
  }, [searchParams, pathname, replace, initialized, setCash, cash]);

  useEffect(() => {
    async function fetchPrice() {
      const response = await fetch("/api/price-dolar");
      const { data } = await response.json();
      const price = parseFloat(data.dolar.value).toFixed(2);
      setRate(parseFloat(price));
      setPrice(price.toString());
    }
    fetchPrice();
  }, [setRate]);

  const handleClick = (term: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (term === "Dólares") {
      setCash("$");
      params.set("cash", "usd");
    } else {
      setCash("Bs");
      params.set("cash", "ves");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <li className={styles["header__option-coin"]}>
      <Image
        className={styles["header__option-coin-image"]}
        src="/icons/cash.png"
        alt="coin logo"
        width={24}
        height={24}
      />
      <div>
        <span className={styles["header__option-coin-text-rate"]}>
          {price ? `1$ =  ${price} Bs.` : "Cargando..."}
        </span>
        <span className={styles["header__option-coin-text-select"]}>
          {money}
        </span>
        <ul className={styles["header__option-coin-list"]}>
          <li className={styles["header__option-coin-divider"]}></li>
          <li
            onClick={(event) =>
              handleClick(event.currentTarget.textContent || "")
            }
            className={styles["header__option-coin-item"]}
          >
            Dólares
          </li>
          <li
            onClick={(event) =>
              handleClick(event.currentTarget.textContent || "")
            }
            className={styles["header__option-coin-item"]}
          >
            Bolívares
          </li>
        </ul>
      </div>
      <Image
        src="/icons/stat_minus.svg"
        alt="coin arrow"
        width={24}
        height={24}
      />
    </li>
  );
}
