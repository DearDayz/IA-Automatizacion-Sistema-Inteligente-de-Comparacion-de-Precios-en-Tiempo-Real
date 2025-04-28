"use client";
import styles from "./filter.module.css";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";


interface Params {
  order?: string;
  brand?: string;
}

export default function Filter( { params }: { params: Params } ) {
  const searchParams = useSearchParams(); // Parámetros de la URL actual
  const pathname = usePathname(); // Ruta actual sin query params
  const { replace } = useRouter(); // Para cambiar la URL actual
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
      // Evitamos correr el efecto más de una vez
      if (!initialized && params !== null) {
        if (!params.order) {
          const parametros = new URLSearchParams(searchParams?.toString() || "");
          parametros.set("order", "lower");
          replace(`${pathname}?${parametros.toString()}`, { scroll: false });
          setInitialized(true);
        }
        
      }

      if (initialized && params !== null) {
        if (!params.order) {
          const parametros = new URLSearchParams(searchParams?.toString() || "");
          parametros.set("order", "lower");
          replace(`${pathname}?${parametros.toString()}`, { scroll: false });
        }
      }
        
    }, [searchParams, pathname, replace, initialized, params]);

  async function handleClickMayor() {
    const params = await new URLSearchParams(searchParams?.toString() || "");
    params.set("order", "higher");
    params.set("page", "1"); // Resetear la página a 1 al cambiar el filtro
    await replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function handleClickMenor() {
    const params = await new URLSearchParams(searchParams?.toString() || "");
    params.set("order", "lower");
    params.set("page", "1"); // Resetear la página a 1 al cambiar el filtro
    await replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function handleClick(term: string) {
    const params = await new URLSearchParams(searchParams?.toString() || "");
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
    params.set("page", "1"); // Resetear la página a 1 al cambiar el filtro
    await replace(`${pathname}?${params.toString()}`, { scroll: false });
  }


  const brands: string[] = [];

  if (params.brand !== undefined) {
    params.brand.split("-").forEach((brand) => {
      if (brand !== "") {
        brands.push(brand);
      }
    });
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
                onClick={ handleClickMayor }
                className={`${styles["label"]}`}
              >
                { params.order !== undefined ? (<input
                  id = "mayorRadio"
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="radio"
                  name="order"
                  defaultChecked={ params.order === "higher" }
                />) : <span>Cargando...</span>  }
                {" "}
                Mayor a menor
              </label>
            </div>
            <div>
              <label
                onClick={handleClickMenor}
                className={`${styles["label"]}`}
              >
                { params.order !== undefined ? (
                  <input
                  id = "menorRadio"
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="radio"
                  name="order"
                  defaultChecked={ params.order === "lower" }
                />
                ) : <span>Cargando...</span> }
                {" "}
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
                { params.order !== undefined ? (
                  <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="checkbox"
                  defaultChecked={ brands.includes("ftm") }
                />
                ) : <span>Cargando...</span> }
                {" "}
                Farmatodo
              </label>
            </div>
            <div>
              <label
                onClick={() => handleClick("zmk")}
                className={`${styles["label"]}`}
              >
                { params.order !== undefined ? (
                  <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="checkbox"
                  defaultChecked={ brands.includes("zmk") }
                />
                ) : <span>Cargando...</span> }
                {" "}
                Tu Zona Market
              </label>
            </div>
            <div>
              <label
                onClick={() => handleClick("km")}
                className={`${styles["label"]}`}
              >
                { params.order !== undefined ? (
                  <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="checkbox"
                  defaultChecked={ brands.includes("km") }
                />
                ) : <span>Cargando...</span> }
                {" "}
                Kromi
              </label>
            </div>
            <div>
              <label
                onClick={() => handleClick("pm")}
                className={`${styles["label"]}`}
              >
                { params.order !== undefined ? (
                  <input
                  className={`${styles["main__content-filter-item-option"]}`}
                  type="checkbox"
                  defaultChecked={ brands.includes("pm") }
                />
                ) : <span>Cargando...</span> }
                {" "}
                Pro Market
              </label>
            </div>
          </form>
        </li>
      </ul>
    </div>
  );
}
