import { notFound } from "next/navigation";
import styles from "@/app/ui/components/product/product.module.css";
import Info from "@/app/ui/components/product/info/info";
import Tendency from "@/app/ui/components/product/tendency/tendency";
import Graphic from "@/app/ui/components/product/graphic/graphic";

interface Product {
  id: number;
  name: string;
  tendency: string;
  url: string;
  price: number;
  image: string;
  history: { date: string; price: number }[];
}

function getTendency(product: Product) {
  let tendencia = 0;
  const priceArray = product.history.map(entry => entry.price);
  let daysPerPrice = 0;
  let sumDays = 0;
  let sumDaysSquared = 0;
  let sumPrices = 0;
  for (let i = 0; i < priceArray.length; i++) {
    daysPerPrice += priceArray[i] * (i+1);
    sumDays += (i+1);
    sumPrices += priceArray[i];
    sumDaysSquared += (i+1) * (i+1);
  }
  const slope = (priceArray.length * daysPerPrice - sumDays * sumPrices) / (priceArray.length * sumDaysSquared - sumDays * sumDays);
  const intercept = (sumPrices - slope * sumDays) / priceArray.length;
  const predictionPrice = slope * (priceArray.length + 1) + intercept;
  const currentPrice = product.price;
  tendencia = Math.round( (((predictionPrice - currentPrice) / currentPrice) * 100) * 100) / 100;
  let tienda = "";
  if (product.url.includes("farmatodo")) {
    tienda = "farmatodo";
  } else if (product.url.includes("tuzonamarket")) {
    tienda = "tuzonamarket";
  } else if (product.url.includes("kromionline")) {
    tienda = "kromio";
  } else if (product.url.includes("promarketlatino")) {
    tienda = "promarket";
  }
  return { tienda: tienda, price: product.price  , tendencia: tendencia };
}

function getPrices(product: Product) {
  let tienda = "";
  if (product.url.includes("farmatodo")) {
    tienda = "farmatodo";
  } else if (product.url.includes("tuzonamarket")) {
    tienda = "tuzonamarket";
  } else if (product.url.includes("kromionline")) {
    tienda = "kromio";
  } else if (product.url.includes("promarketlatino")) {
    tienda = "promarket";
  }

  return { tienda: tienda, precio: product.price, link: product.url };
}

export default async function ProductPage(props: {
  params?: Promise<{
    name?: string;
  }>;
  searchParams: { store?: string };
}) {

  const param = await props.params;
  const name = param?.name || "";
  const decodedName = decodeURIComponent(name);
  
  const decodeNameArray = decodedName.split("+");
  const id = decodeNameArray[decodeNameArray.length - 1].slice(2);
  const searchParams = await props.searchParams;
  const url = 'https://n5tz68kn-8000.use.devtunnels.ms/items/id/' + id + '/';
  const product = await fetch(url, {
    next: { revalidate: 60*30 }   // cache por 60 min antes de volver a fetch
  }).then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  }); 
  if (!product) {
    notFound();
  }

  
  const exampleProductInfo = {
    name: product.name.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase()),
    image: product.products[0].image,
    precios: product.products.map((producto: Product) => {
      return getPrices(producto);
    }),
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

  interface Tendencia {
    tienda: string;
    price: number;
    tendencia: number;
  }
  interface Tendencias {
    tuzonamarket: Tendencia;
    farmatodo: Tendencia;
    kromi: Tendencia;
    promarket: Tendencia;
  }
  


  const tendencias = {} as Tendencias;
  for (const producto of product.products) {
    const tendencia = getTendency(producto);
    tendencias[tendencia.tienda] = tendencia;
  }

  const meanPrice = Math.round((product.products.reduce((acc: number, producto: Product) => acc + producto.price, 0) / product.products.length) * 100) / 100;
  const meanTendencia = Math.round((product.products.reduce((acc: number, producto: Product) => acc + getTendency(producto).tendencia, 0) / product.products.length) * 100) / 100;



  const exampleProductTendecy ={
    mean_price: meanPrice,
    tendecia_media: meanTendencia, /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */
    tendencia_store: searchParams?.store == "km" ? tendencias["kromi"] : searchParams?.store == "tzm" ? tendencias["tuzonamarket"] : searchParams?.store == "pm" ? tendencias["promarket"] : searchParams?.store == "fm" ? tendencias["farmatodo"] : Object.values(tendencias)[0],
  }

  const tiendas = Object.keys(tendencias);


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
    <>
      <main className={`${styles["main"]}`}>
      <Info product={exampleProductInfo} />
      <Tendency infoTendency={exampleProductTendecy} includedStores={tiendas}/> 
      <Graphic data={ searchParams?.store == "km" ? dataKromi : searchParams?.store == "tzm" ? dataTuzonamarket : searchParams?.store == "pm" ? dataPromarket : dataFarmatado }/>
      
    </main>
      
    </>
    
    
  );
}
