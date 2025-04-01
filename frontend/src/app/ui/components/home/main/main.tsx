import styles from "./main.module.css";
import Input from "./input/input";
import Buttons from "./buttons/buttons";
import Products from "./products/products";
import Filter from "./filters/filter";

interface Params {
  cash?: string;
    query?: string;
    mw?: string;
    offerts?: string;
    order?: string;
    brand?: string;
    page?: string;
}

export default function Main({ params }: { params: Params }) {
  /* console.log("hola soy los paraemtros", params); */
  const paramsFilter = { order: params.order, brand: params.brand };
  return (
    <main className={`${styles["main"]}`}>
        <h2 className={`${styles["main__title"]}`}>Busca tu producto!</h2>
        <Input />
        <div className={`${styles["main__content-container"]}`}>
            <Buttons />
            <div className={`${styles["main__content-container-main"]}`}>
                <Products />
                <Filter params={paramsFilter}/>
            </div>
        </div>
    </main>
  );
}
