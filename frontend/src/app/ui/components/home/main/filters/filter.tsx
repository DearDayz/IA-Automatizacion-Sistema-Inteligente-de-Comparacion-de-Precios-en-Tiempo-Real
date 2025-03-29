"use client";
import styles from "./filter.module.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function Filter() {
  const searchParams = useSearchParams(); // Parámetros de la URL actual
  const pathname = usePathname(); // Ruta actual sin query params
  const { replace } = useRouter(); // Para cambiar la URL actual
  function handleClickMayor() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("order", "higher");
    replace(`${pathname}?${params.toString()}`);
  }

  function handleClickMenor() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("order", "lower");
    replace(`${pathname}?${params.toString()}`);
  }

  function handleClick(term: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    let cosa = null;
    if (params.get("brand") == null) {
      cosa = term;
    } else if (params.get("brand")?.includes(term)) {
      let replaced = params.get("brand")?.replace(term, "") || "";

      // Eliminar guión al inicio si existe
      if (replaced.startsWith("-")) {
        replaced = replaced.substring(1);
      }

      // Eliminar guiones dobles si existen
      replaced = replaced.replace("--", "-");

      cosa = replaced;
    } else {
      cosa = params.get("brand") + "-" + term;
    }

    // También deberías limpiar posibles guiones al final
    if (cosa?.endsWith("-")) {
      cosa = cosa.slice(0, -1);
    }

    if (cosa === "") {
      params.delete("brand");
    }
    else{
        params.set("brand", cosa);
    }
    
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div id="filter" className={`${styles["main__content-filter"]}`}>
      <ul className={`${styles["main__content-filter-list"]}`}>
        <li className={`${styles["main__content-filter-item"]}`}>
          <h3 className={`${styles["main__content-filter-item-title"]}`}>
            Ordenar
          </h3>
          <form
            action=""
            className={`${styles["main__content-filter-item-options"]}`}
          >
            <div>
              <label
                onClick={handleClickMayor}
                className={`${styles["label"]}`}
              >
                <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="radio"
                  name="order"
                />{" "}
                Mayor a menor
              </label>
            </div>
            <div>
              <label
                onClick={handleClickMenor}
                className={`${styles["label"]}`}
              >
                <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="radio"
                  name="order"
                />{" "}
                Menor a mayor
              </label>
            </div>
          </form>
        </li>
        <li className={`${styles["main__content-filter-item"]}`}>
          <h3 className={`${styles["main__content-filter-item-title"]}`}>
            Por tienda
          </h3>
          <form
            action=""
            className={`${styles["main__content-filter-item-options"]}`}
          >
            <div>
              <label
                onClick={() => handleClick("ftm")}
                className={`${styles["label"]}`}
              >
                <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="checkbox"
                />{" "}
                Farmatodo
              </label>
            </div>
            <div>
              <label
                onClick={() => handleClick("zmk")}
                className={`${styles["label"]}`}
              >
                <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="checkbox"
                />{" "}
                Tu Zona Market
              </label>
            </div>
          </form>
        </li>
      </ul>
    </div>
  );
}
