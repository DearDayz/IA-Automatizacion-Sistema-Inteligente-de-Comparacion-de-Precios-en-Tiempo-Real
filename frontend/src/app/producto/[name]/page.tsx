import { notFound } from "next/navigation";
import styles from "@/app/ui/components/product/product.module.css";
import Info from "@/app/ui/components/product/info/info";
import Tendency from "@/app/ui/components/product/tendency/tendency";
import Graphic from "@/app/ui/components/product/graphic/graphic";

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
  }>;
  searchParams: { store?: string };
}) {
  const param = await props.params;
  const name = param?.name || "";
  const decodedName = decodeURIComponent(name);
  const searchParams = await props.searchParams;
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
      },
      {
        tienda: "promarket",
        precio: 1.04,
        link: "https://www.promarketlatino.com/tienda/products/harina-pan-blanca",
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
  const tendencia_promarket = {
    tienda: "promarket",
    price: 6.25,
    tendecia: -0.5, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
  }

  const exampleProductTendecy ={
    mean_price: 4.5,
    tendecia_media: 2, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
    tendencia_store: searchParams?.store == "km" ? tendencia_kromi : searchParams?.store == "tzm" ? tendencia_tuzonamarket : searchParams?.store == "pm" ? tendencia_promarket : tendencia_farmatodo
  }

  /* Ejemplo de uso para el gráfico */
  const dataFarmatado = [
    { time: "2018-12-22", value: 32.51 },
    { time: "2018-12-23", value: 31.11 },
    { time: "2018-12-24", value: 27.02 },
    { time: "2018-12-25", value: 27.32 },
    { time: "2018-12-26", value: 25.17 },
    { time: "2018-12-27", value: 28.89 },
    { time: "2018-12-28", value: 25.46 },
    { time: "2018-12-29", value: 23.92 },
    { time: "2018-12-30", value: 22.68 },
    { time: "2018-12-31", value: 22.67 },
  ]

  const dataTuzonamarket = [
    { time: "2019-01-01", value: 22.34 },
    { time: "2019-01-02", value: 23.12 },
    { time: "2019-01-03", value: 24.45 },
    { time: "2019-01-04", value: 23.78 },
    { time: "2019-01-05", value: 24.56 },
    { time: "2019-01-06", value: 25.67 },
    { time: "2019-01-07", value: 26.14 },
    { time: "2019-01-08", value: 27.89 },
    { time: "2019-01-09", value: 28.67 },
    { time: "2019-01-10", value: 29.45 },
  ]

  const dataKromi = [
    { time: "2019-01-11", value: 30.56 },
    { time: "2019-01-12", value: 31.23 },
    { time: "2019-01-13", value: 32.56 },
    { time: "2019-01-14", value: 33.98 },
    { time: "2019-01-15", value: 35.23 },
    { time: "2019-01-16", value: 36.45 },
    { time: "2019-01-17", value: 37.56 },
    { time: "2019-01-18", value: 38.67 },
    { time: "2019-01-19", value: 39.78 },
    { time: "2019-01-20", value: 40.89 },
  ]

  const dataPromarket = [
    { time: "2019-01-21", value: 41.21 },
    { time: "2019-01-22", value: 42.45 },
    { time: "2019-01-23", value: 43.67 },
    { time: "2019-01-24", value: 45.89 },
    { time: "2019-01-25", value: 43.11 },
    { time: "2019-01-26", value: 41.33 },
    { time: "2019-01-27", value: 40.55 },
    { time: "2019-01-28", value: 42.77 },
    { time: "2019-01-29", value: 43.99 },
    { time: "2019-01-30", value: 45.21 },
  ]
  return (
    <main className={`${styles["main"]}`}>
      <Info product={exampleProductInfo} />
      <Tendency infoTendency={exampleProductTendecy} /> 
      <Graphic data={ searchParams?.store == "km" ? dataKromi : searchParams?.store == "tzm" ? dataTuzonamarket : searchParams?.store == "pm" ? dataPromarket : dataFarmatado }/>
    </main>
  );
}
