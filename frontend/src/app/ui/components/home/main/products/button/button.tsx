"use client";
import styles from "./button.module.css";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function ButtonLoad( { length }: { length: number }) {
  const searchParams = useSearchParams(); // Objeto que contiene los parámetros de la url actual

  const pathname = usePathname(); // Nos da la url actual pero sin los parámetros de búsqueda y desde el root raiz en adelante
  const { replace } = useRouter(); // Hook que nos permite cambiar la url actual

  const [initialized, setInitialized] = useState(false);

  const cantidadActual = Number(searchParams?.get("page"))*5;

  // Este efecto se encarga de corregir la URL solo una vez en el cliente
  useEffect(() => {
    // Evitamos correr el efecto más de una vez
    if (!initialized && searchParams && pathname) {
      if (!searchParams.get("page")) {
        const params = new URLSearchParams(searchParams.toString() || "");
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
      setInitialized(true);
    }
    if (initialized && searchParams && pathname) {
        if (!searchParams.get("page")) {
          const params = new URLSearchParams(searchParams.toString() || "");
          params.set("page", "1");
          replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }
  }, [searchParams, pathname, replace, initialized]);

  function handleClick() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", (Number(searchParams?.get("page")) + 1).toString());
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }
  console.log(cantidadActual);
  console.log(length);
  return (
    (cantidadActual < length) ? (<button onClick={handleClick} className={styles["button"]} type="button">
      Cargar más
    </button>) : <></>
    
  );
}
