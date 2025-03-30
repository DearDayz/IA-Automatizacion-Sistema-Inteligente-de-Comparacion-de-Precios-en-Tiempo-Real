import styles from "./info.module.css";
import Image from "next/image";

import Link from "next/link";
interface Precio {
  tienda: string /* Los nombres tienen que ser tuzonamarket, farmatodo o kromi */;
  precio: number;
  link: string;
}

interface Product {
  name: string;
  image: string;
  precios: Precio[];
}

export default function Info({ product }: { product: Product }) {
  const banners = {
    tuzonamarket: "/icons/banner-tzm.webp",
    farmatodo: "/icons/banner-farmatodo.svg",
    kromi: "/icons/banner_kromi_1.svg",
    nada: "",
  };

  function getBanner(tienda: string) {
    if (tienda === "tuzonamarket") return banners.tuzonamarket;
    if (tienda === "farmatodo") return banners.farmatodo;
    if (tienda === "kromi") return banners.kromi;
    return banners.nada;
  }

  return (
    <div className={`${styles["info"]}`}>
      <h1 className={`${styles["title"]}`}>{product.name}</h1>
      <div className={`${styles["container-image"]}`}>
        <Image
          className={`${styles["image"]}`}
          width={200}
          height={200}
          src={product.image}
          alt={product.name}
        />
      </div>
      <div className={`${styles["container-precios"]}`}>
        <h2 className={`${styles["title-precios"]}`}>Precios</h2>
        <div className={`${styles["container-precios-list"]}`}>
          {product.precios.map((precio) => (
            <div
              className={`${styles["container-precio"]}`}
              key={precio.tienda}
            >
              <div className={`${styles["container-precio-text"]}`}>
                <span className={styles["precio"]}>${precio.precio}</span>
              </div>
              <div className={`${styles["container-image-store"]}`}>
                <Link href={precio.link} target="_blank">
                  <Image
                    className={`${styles["image-store"]} ${
                      styles[`${precio.tienda}`]
                    }`}
                    src={getBanner(precio.tienda)}
                    alt={precio.tienda}
                    width={100}
                    height={20}
                  ></Image>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
/* 
<div className={`${styles["container-precio"]}`}>
            <div className={`${styles["container-precio-text"]}`}>
              <span className={ styles["precio"] }>$15.60</span>
            </div>
            <div className={`${styles["container-image-store"]}`}>
              <Link
                href={`https://www.farmatodo.com.ve/producto/111016370-harina-pan-de-maiz-1kg`}
                target="_blank"
              >
                <Image
                  className={`${styles["image-store"]} ${styles["farmatodo"]}`}
                  src={`/icons/banner-farmatodo.svg`}
                  alt="farmatodo"
                  width={100}
                  height={20}
                ></Image>
              </Link>
            </div>
          </div>
          <div className={`${styles["container-precio"]}`}>
            <div className={`${styles["container-precio-text"]}`}>
              <span>$10.60</span>
            </div>
            <div className={`${styles["container-image-store"]}`}>
              <Link
                href={`https://tuzonamarket.com/carabobo/producto/harina-maiz-blanco-pan-1-kg`}
                target="_blank"
              >
                <Image
                  className={`${styles["image-store"]} ${styles["tuzonamarket"]}`}
                  src={`/icons/banner-tzm.webp`}
                  alt="farmatodo"
                  width={100}
                  height={20}
                ></Image>
              </Link>
            </div>
          </div>
          <div className={`${styles["container-precio"]}`}>
            <div className={`${styles["container-precio-text"]}`}>
              <span>$12.60</span>
            </div>
            <div className={`${styles["container-image-store"]}`}>
              <Link
                href={`https://www.kromionline.com/Product.php?code=0000004837`}
                target="_blank"
              >
                <Image
                  className={`${styles["image-store"]} ${styles["kromi"]}`}
                  src={`/icons/banner_kromi_1.svg`}
                  alt="farmatodo"
                  width={100}
                  height={20}
                ></Image>
              </Link>
            </div>
          </div>
*/
