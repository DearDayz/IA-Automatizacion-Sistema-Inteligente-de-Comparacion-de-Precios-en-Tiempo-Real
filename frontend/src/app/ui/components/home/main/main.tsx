import styles from "./main.module.css";
import Input from "./input/input";
import Buttons from "./buttons/buttons";
import Products from "./products/products";
import Filter from "./filters/filter";
export default function Main() {
  return (
    <main className={`${styles["main"]}`}>
        <h2 className={`${styles["main__title"]}`}>Busca tu producto!</h2>
        <Input />
        <div className={`${styles["main__content-container"]}`}>
            <Buttons />
            <div className={`${styles["main__content-container-main"]}`}>
                <Products />
                <Filter />
            </div>
        </div>
    </main>
  );
}
