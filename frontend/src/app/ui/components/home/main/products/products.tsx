import Image from "next/image";
import styles from "./products.module.css";
import Link from "next/link";
import ButtonLoad from "./button/button";
interface Parametros {
  query?: string;
  mw?: string;
  offerts?: string;
  order?: string;
  brand?: string;
  page?: string;
}



interface Product {
  id: number;
  name: string;
  category: string;
  view_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  min_price_image: string;
  max_price_image: string;
  min_price_page: string;
  max_price_page: string;
}

function filterItemsByPage(items: Product[], storeCodes: string): Product[] {
  // Diccionario para mapear código a nombre de tienda
  const tiendaMap: { [code: string]: string } = {
    ftm: "farmatodo",
    zmk: "tuzonamarket",
    km: "kromionline",
    pm: "promarketonline",
  };

  // Convertimos el string de códigos en un array y filtramos aquellos que existan en el diccionario
  const codigosSeleccionados = storeCodes
    .split("-")
    .map(code => code.trim())
    .filter(code => tiendaMap.hasOwnProperty(code));

  // Obtenemos las tiendas correspondientes
  const tiendasSeleccionadas = codigosSeleccionados.map(code => tiendaMap[code]);

  // Filtramos los items que tengan min_price_page o max_price_page en la lista de tiendas seleccionadas
  const itemsFiltrados = items.filter(item => 
    tiendasSeleccionadas.includes(item.min_price_page) ||
    tiendasSeleccionadas.includes(item.max_price_page)
  );

  // Eliminamos duplicados basándonos en el id (si se repiten)
  const uniqueItemsMap = new Map<number, Product>();
  itemsFiltrados.forEach(item => {
    if (!uniqueItemsMap.has(item.id)) {
      uniqueItemsMap.set(item.id, item);
    }
  });

  return Array.from(uniqueItemsMap.values());
}

function quitarAcentos(texto: string): string {
  return texto.replace(/[áéíóú]/g, (letra: string): string => {
      const acentos: { [key: string]: string } = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
      return acentos[letra] || letra;
  });
}

function ordenarPorViewCount(productos: { view_count: number }[]): typeof productos {
  return productos.sort((a, b) => b.view_count - a.view_count);
}

function filterItems(items: any[], params: Parametros) {
  let filteredItems = [];

  if (params.query) {
    items.forEach((item) => {
      if (quitarAcentos(item.name.toLowerCase()).includes(quitarAcentos(params.query?.toLowerCase() || ""))) {
        filteredItems.push(item);
      }
    })
  } else {
    filteredItems = items;
  }

  if (filteredItems.length > 0){
    if ( params.mw ) {
      filteredItems = ordenarPorViewCount( filteredItems );
    } else {
      if ( params.order === "lower" ) {
        filteredItems = filteredItems.sort((a, b) => a.avg_price - b.avg_price);
      } else if ( params.order === "higher" ) {
        filteredItems = filteredItems.sort((a, b) => b.avg_price - a.avg_price);
      }

      if ( params.brand ) {
        filteredItems = filterItemsByPage(filteredItems, params.brand);
      }
    }
  } else {
    return filteredItems;
  }

  return filteredItems;
}



export default async function Products({
  parametros,
}: {
  parametros: Parametros;
}) {
  

  const AllItems = await fetch('https://n5tz68kn-8000.use.devtunnels.ms/items/', {
    next: { revalidate: 60*60 }   // cache por 60 min antes de volver a fetch
  }).then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  }); 
  
  

  // Esto se sustituira por el fetch que utiliza los parametros
  /* const products = [
    {
      id: 1,
      name: "Harina Pan 1kg",
      image: "/productos/harina_pan.png",
      lowest: {
        price: 3.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 5.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 4.5,
    },
    {
      id: 2,
      name: "Pepsi 2L",
      image: "/productos/pepsi.webp",
      lowest: {
        price: 1.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 2.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 2,
    },
    {
      id: 3,
      name: "Harina Pan",
      image: "/productos/harina_pan.png",
      lowest: {
        price: 3.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 5.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 4.5,
    },
    {
      id: 4,
      name: "Pepsi 2L",
      image: "/productos/pepsi.webp",
      lowest: {
        price: 1.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 2.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 2,
    },
    {
      id: 5,
      name: "Harina Pan",
      image: "/productos/harina_pan.png",
      lowest: {
        price: 3.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 5.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 4.5,
    },
    {
      id: 6,
      name: "Pepsi 2L",
      image: "/productos/pepsi.webp",
      lowest: {
        price: 1.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 2.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 2,
    },
    {
      id: 7,
      name: "Harina Pan",
      image: "/productos/harina_pan.png",
      lowest: {
        price: 3.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 5.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 4.5,
    },
    {
      id: 8,
      name: "Pepsi 2L",
      image: "/productos/pepsi.webp",
      lowest: {
        price: 1.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 2.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 2,
    },
    {
      id: 9,
      name: "Harina Pan",
      image: "/productos/harina_pan.png",
      lowest: {
        price: 1.11,
        store: "ProMarket",
        image: "/productos/favicon__promarket.ico",
      },
      highest: {
        price: 5.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 4.5,
    },
    {
      id: 10,
      name: "Pepsi 2L",
      image: "/productos/pepsi.webp",
      lowest: {
        price: 1.5,
        store: "Farmatodo",
        image: "/productos/favicon-farmatodopng.png",
      },
      highest: {
        price: 2.5,
        store: "Kromi",
        image: "/productos/favicon_kromi.ico",
      },
      mean: 2,
    },
    {
      id: 11,
      name: "Harina Pan",
      image: "/productos/harina_pan.png",
      lowest: {
        price: 1.11,
        store: "ProMarket",
        image: "/productos/favicon__promarket.ico",
      },
      highest: {
        price: 5.5,
        store: "TuZonaMarket",
        image: "/productos/favicon_tuZonaMarke.webp",
      },
      mean: 4.5,
    },
  ]; */
  const products = filterItems(AllItems, parametros);
  let showProducts = [];
  if(!parametros.page  || parametros.page === "1") {
    showProducts = products.slice(0, 5);
  } else{
    const page = Number(parametros.page);
    showProducts = products.slice(0, 5 * page);
  }

  const lenghtProducts = products.length;
  const replaceSpaces = (str: string) => str.replace(/\s/g, "+");
  const iconsStore = {
    farmatodo: "/productos/favicon-farmatodopng.png",
    promarketlatino: "/productos/favicon__promarket.ico",
    tuzonamarket: "/productos/favicon_tuZonaMarke.webp",
    kromionline: "/productos/favicon_kromi.ico",
  };
  
  function getIconStore(store: keyof typeof iconsStore): string {
    return iconsStore[store];
  }

  return (
    <>
      <div className={`${styles["main__content"]}`}>
        {showProducts?.map((product) => (
          <Link
            href={`/producto/${replaceSpaces(product.name)}+id${product.id}`}
            key={product.id}
            className={`${styles["main__content-card"]}`}
          >
            <div >
              <div
                className={`${styles["main__content-card-image-container"]}`}
              >
                <Image
                  className={`${styles["main__content-card-image"]}`}
                  width={204}
                  height={204}
                  src={product.min_price_image}
                  alt={product.name}
                />
              </div>
              <div className={`${styles["main__content-card-info"]}`}>
                <h3>{product.name.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())}</h3>
                <div
                  className={`${styles["main__content-card-info-price-lowest"]}`}
                >
                  <div
                    className={`${styles["main__content-card-info-price-lowest-container-main"]}`}
                  >
                    <Image
                      className={`${styles["main__content-card-info-price-lowest-icon"]}`}
                      width={24}
                      height={24}
                      src="/icons/arrow_down.svg"
                      alt="Lowest Icon"
                    />
                    <span
                      className={`${styles["main__content-card-info-price-lowest-text"]}`}
                    >
                      Lowest
                    </span>
                  </div>
                  <div
                    className={
                      styles[
                        "main__content-card-info-price-lowest-container-secondary"
                      ]
                    }
                  >
                    <div
                      className={
                        styles[
                          "main__content-card-info-price-lowest-container-tertiary"
                        ]
                      }
                    >
                      <span
                        className={
                          styles["main__content-card-info-price-lowest-price"]
                        }
                      >
                        ${product.min_price}
                      </span>
                      <span
                      
                        className={
                          styles["main__content-card-info-price-lowest-price-store"]
                        }
                      >
                        {product.min_price_page}
                      </span>
                    </div>
                    <Image
                      className={`${
                        styles["main__content-card-info-price-lowest-logo"]
                      } ${
                        product.min_price_page== "kromionline" ? styles["kromi"] : ""
                      }`}
                      width={20}
                      height={20}
                      src={ getIconStore(product.min_price_page) }
                      alt={product.min_price_page}
                    />
                  </div>
                </div>
                <div
                  className={styles["main__content-card-info-price-highest"]}
                >
                  <div
                    className={
                      styles[
                        "main__content-card-info-price-highest-container-main"
                      ]
                    }
                  >
                    <Image
                      className={
                        styles["main__content-card-info-price-highest-icon"]
                      }
                      src="/icons/arrow_up.svg"
                      alt="Highest Icon"
                      width={24}
                      height={24}
                    />
                    <span
                      className={
                        styles["main__content-card-info-price-highest-text"]
                      }
                    >
                      Highest
                    </span>
                  </div>
                  <div
                    className={
                      styles[
                        "main__content-card-info-price-highest-container-secondary"
                      ]
                    }
                  >
                    <div
                      className={
                        styles[
                          "main__content-card-info-price-highest-container-tertiary"
                        ]
                      }
                    >
                      <span
                        className={
                          styles["main__content-card-info-price-highest-price"]
                        }
                      >
                        ${product.max_price}
                      </span>
                      <span
                        className={
                          styles["main__content-card-info-price-highest-price-store"]
                        }
                      >
                        {product.max_price_page}
                      </span>
                    </div>
                    <Image
                      className={`${
                        styles["main__content-card-info-price-highest-logo"]
                      } ${
                        product.max_price_page == "kromionline" ? styles["kromi"] : ""
                      }`}
                      width={20}
                      height={20}
                      src={ getIconStore(product.max_price_page) }
                      alt={product.max_price_page}
                    />
                  </div>
                </div>
                <div className={styles["main__content-card-info-price-mean"]}>
                  <div
                    className={
                      styles[
                        "main__content-card-info-price-mean-container-main"
                      ]
                    }
                  >
                    <Image
                      className={
                        styles["main__content-card-info-price-mean-icon"]
                      }
                      width={24}
                      height={24}
                      src="/icons/igual.svg"
                      alt="Mean Icon"
                    />
                    <span
                      className={
                        styles["main__content-card-info-price-mean-text"]
                      }
                    >
                      Mean
                    </span>
                  </div>
                  <div
                    className={
                      styles[
                        "main__content-card-info-price-mean-container-secondary"
                      ]
                    }
                  >
                    <span
                      className={
                        styles["main__content-card-info-price-mean-price"]
                      }
                    >
                      ${product.avg_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link> 
        ))}
        <div className={styles["container-button"]}>
          <ButtonLoad length={lenghtProducts}></ButtonLoad>
        </div>
      </div>
    </>
  );
}
