import { notFound } from "next/navigation";
import styles from "@/app/ui/components/product/product.module.css";
import Info from "@/app/ui/components/product/info/info";
import Tendency from "@/app/ui/components/product/tendency/tendency";
/* export async function generateMetadata({
  params: { name },
}: {
  params: { name: string };
}) {
  const decodedName = decodeURIComponent(name);
  let title = "";
  let description = "";

  if (decodedName === "Harina Pan 1kg") {
    title = "Harina Pan 1kg";
    description = "Harina Pan 1kg la tradicional";
  }

  return {
    title: title || "Producto no encontrado",
    description: description || "Producto no encontrado",
  };
} */

export default async function ProductPage(props: {
  params?: Promise<{
    name?: string;
    store?: string;
  }>;
}) {
  const param = await props.params;
  const name = param?.name || "";
  const decodedName = decodeURIComponent(name);
  let product = null;
  if (decodedName === "Harina+Pan+1kg") {
    product = {
      name: "Harina Pan 1kg", /* Con este nombre se haria el fetch */
      mean: 4.5,
    };
  }

  if (!product) {
    notFound();
  }

  // Ejemplo de uso para Info
  const exampleProductInfo = {
    name: product.name,
    image: "/productos/harina_pan.png",
    precios: [
      {
        tienda: "farmatodo",
        precio: 1.02,
        link: "https://www.farmatodo.com.ve/producto/111016370-harina-pan-de-maiz-1kg",
      },
      {
        tienda: "tuzonamarket",
        precio: 0.89,
        link: "https://tuzonamarket.com/carabobo/producto/harina-maiz-blanco-pan-1-kg",
      },
      {
        tienda: "kromi",
        precio: 1.02,
        link: "https://www.kromionline.com/Product.php?code=0000004837",
      }
    ],
  };

  // Ejemplo de uso para tendecia

  const tendencia_farmatodo = {
    tienda: "farmatodo",
    price: 4,
    tendecia: 0.5, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
  }
  const tendencia_tuzonamarket = {
    tienda: "tuzonamarket",
    price: 4.25,
    tendecia: 1, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
  }
  const tendencia_kromi = {
    tienda: "kromi",
    price: 4.25,
    tendecia: -2, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
  }

  const exampleProductTendecy ={
    mean_price: 4.5,
    tendecia_media: 2, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
    tendencia_store: param?.store == "ftm" ? tendencia_farmatodo : param?.store == "tzm" ? tendencia_tuzonamarket : tendencia_kromi
  }

  return (
    <main className={`${styles["main"]}`}>
      <Info product={exampleProductInfo} />
      <Tendency infoTendency={exampleProductTendecy} />
    </main>
  );
}
