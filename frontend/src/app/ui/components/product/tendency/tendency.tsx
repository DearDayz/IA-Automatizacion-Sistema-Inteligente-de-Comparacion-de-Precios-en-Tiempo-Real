import styles from "./tendency.module.css";
import Image from "next/image";
interface TendenciaStore {
  tienda: string;
  price: number;
  tendecia: number;
}

interface InfoTendency {
  mean_price: number;
  tendecia_media: number;
  tendencia_store: TendenciaStore;
}

export default function Tendency({
  infoTendency,
}: {
  infoTendency: InfoTendency;
}) {
  return (
    <div className={`${styles["tendency"]}`}>
      <div className={`${styles["container-tendency-store"]}`}>
        <div className={styles["container-title"]}>
          <h2 className={styles["title"]}>Tendencia</h2>
          <div className={styles["title"]}>
            {infoTendency.tendencia_store.tienda}
          </div>
          
        </div>
        <div className={`${styles["container-tendency-store-2"]}`}>
          <div className={`${styles["container-tendency-store-info"]}`}>
            <div className={`${styles["tendency-store-info"]}`}>
              {infoTendency.tendencia_store.tendecia >= 0
                ? "En subida"
                : "En bajada"}
            </div>
            <div className={`${styles["tendency-store-time"]}`}>
              Ultimos 7 dias
            </div>
            <div className={`${styles["tendency-store-price"]}`}>
              $ {infoTendency.tendencia_store.price}
            </div>
            <div className={`${styles["tendency-store-line"]}`}>
              {infoTendency.tendencia_store.tendecia < 0 ? (
                <>
                  <Image
                    width={24}
                    height={24}
                    src="/icons/arrow_down.svg"
                    alt="Lowest Icon"
                  />
                  <span className={`${styles["bajada"]}`}>
                    {infoTendency.tendencia_store.tendecia}%
                  </span>
                </>
              ) : (
                <>
                  <Image
                    width={24}
                    height={24}
                    src="/icons/arrow_up.svg"
                    alt="Highest Icon"
                  />
                  <span className={`${styles["subida"]}`}>
                    {infoTendency.tendencia_store.tendecia}%
                  </span>
                </>
              )}
            </div>
            <span className={`${styles["tendency-store-time-2"]}`}>
                { infoTendency.tendencia_store.tendecia >= 0 ? "Alcista" : "Bajista" }
            </span>
          </div>
          <Image
          className={ `${styles["image-tendency-store"]}` }
            src={ infoTendency.tendencia_store.tendecia >= 0 ? "/icons/high_tendency.svg" : "/icons/low_tendency.svg" }
            alt="Highest Tendency"
            width={200}
            height={100}
          />
        </div>
      </div>
      <div className={`${styles["container-tendency-store"]}`}>
        <div className={styles["container-title"]}>
          <h2 className={styles["title"]}>Tendencia</h2>
          <div className={styles["title"]}>
            Promedio
          </div>
        </div>
        <div className={`${styles["container-tendency-store-2"]}`}>
          <div className={`${styles["container-tendency-store-info"]}`}>
            <div className={`${styles["tendency-store-info"]}`}>
              {infoTendency.tendecia_media>= 0
                ? "En subida"
                : "En bajada"}
            </div>
            <div className={`${styles["tendency-store-time"]}`}>
              Ultimos 7 dias
            </div>
            <div className={`${styles["tendency-store-price"]}`}>
              $ {infoTendency.mean_price}
            </div>
            <div className={`${styles["tendency-store-line"]}`}>
              {infoTendency.tendecia_media < 0 ? (
                <>
                  <Image
                    width={24}
                    height={24}
                    src="/icons/arrow_down.svg"
                    alt="Lowest Icon"
                  />
                  <span className={`${styles["bajada"]}`}>
                    {infoTendency.tendecia_media}%
                  </span>
                </>
              ) : (
                <>
                  <Image
                    width={24}
                    height={24}
                    src="/icons/arrow_up.svg"
                    alt="Highest Icon"
                  />
                  <span className={`${styles["subida"]}`}>
                    {infoTendency.tendecia_media}%
                  </span>
                </>
              )}
            </div>
            <span className={`${styles["tendency-store-time-2"]}`}>
                { infoTendency.tendecia_media >= 0 ? "Alcista" : "Bajista" }
            </span>
          </div>
          <Image
          className={ `${styles["image-tendency-store"]}` }
            src={ infoTendency.tendecia_media >= 0 ? "/icons/high_tendency.svg" : "/icons/low_tendency.svg" }
            alt="Highest Tendency"
            width={200}
            height={100}
          />
        </div>
      </div>
    </div>
  );
}
