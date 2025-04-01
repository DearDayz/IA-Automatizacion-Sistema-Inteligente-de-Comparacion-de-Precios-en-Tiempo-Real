import styles from "./main.module.css";
import Input from "./input/input";
import Buttons from "./buttons/buttons";
import Products from "./products/products";
import Filter from "./filters/filter";

interface Cash {
  cash: string
}

export default function Main({ cash }: { cash: Cash }) {
  console.log("Hola soy el cash", cash);
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
