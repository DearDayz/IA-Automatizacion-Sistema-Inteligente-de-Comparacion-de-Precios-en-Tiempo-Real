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

export default async function Products({
  parametros,
}: {
  parametros: Parametros;
}) {
  console.log(parametros);

  // Esto se sustituira por el fetch que utiliza los parametros
  const products = [
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
  ];
  let showProducts = [];
  if(!parametros.page  || parametros.page === "1") {
    showProducts = products.slice(0, 5);
  } else{
    const page = Number(parametros.page);
    showProducts = products.slice(0, 5 * page);
  }

  const replaceSpaces = (str: string) => str.replace(/\s/g, "+");

  return (
    <>
      <div className={`${styles["main__content"]}`}>
        {showProducts?.map((product) => (
          <Link
            href={`/producto/${replaceSpaces(product.name)}`}
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
                  src={product.image}
                  alt={product.name}
                />
              </div>
              <div className={`${styles["main__content-card-info"]}`}>
                <h3>{product.name}</h3>
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
                        ${product.lowest.price}
                      </span>
                      <span
                      
                        className={
                          styles["main__content-card-info-price-lowest-price-store"]
                        }
                      >
                        {product.lowest.store}
                      </span>
                    </div>
                    <Image
                      className={`${
                        styles["main__content-card-info-price-lowest-logo"]
                      } ${
                        product.lowest.store == "Kromi" ? styles["kromi"] : ""
                      }`}
                      width={20}
                      height={20}
                      src={product.lowest.image}
                      alt={product.lowest.store}
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
                        ${product.highest.price}
                      </span>
                      <span
                        className={
                          styles["main__content-card-info-price-highest-price-store"]
                        }
                      >
                        {product.highest.store}
                      </span>
                    </div>
                    <Image
                      className={`${
                        styles["main__content-card-info-price-highest-logo"]
                      } ${
                        product.highest.store == "Kromi" ? styles["kromi"] : ""
                      }`}
                      width={20}
                      height={20}
                      src={product.highest.image}
                      alt={product.highest.store}
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
                      ${product.mean}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link> 
        ))}
        <div className={styles["container-button"]}>
          <ButtonLoad></ButtonLoad>
        </div>
      </div>
    </>
  );
}
