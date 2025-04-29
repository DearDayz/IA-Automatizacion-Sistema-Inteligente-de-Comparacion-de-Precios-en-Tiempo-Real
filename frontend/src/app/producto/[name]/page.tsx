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
  sale_price: number;
  image: string;
  history: { date: string; price: number }[];
}

type HistoryRecord = { time: string; value: number };

function addNextDayPrice(
  records: HistoryRecord[],
  futureValue: number
): HistoryRecord[] {
  if (records.length === 0) {
    // Si no hay registros previos, no podemos inferir fecha; devolvemos vacío o creamos un registro hoy:
    return [];
  }

  // Tomamos el último registro
  const lastRecord = records[records.length - 1];
  const lastDate = new Date(lastRecord.time);

  // Sumamos un día
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // Formateamos como "YYYY-MM-DD"
  const nextTime = nextDate.toISOString().slice(0, 10);

  // Devolvemos un nuevo array con el elemento futuro al final
  return [
    ...records,
    {
      time: nextTime,
      value: futureValue,
    },
  ];
}

type InputRecord = { date: string; price: number };
type OutputRecord = { time: string; value: number };

function getHistory(data: InputRecord[]): OutputRecord[] {
  // 1. Agrupamos por fecha, manteniendo el último price si hay duplicados
  const byDate = new Map<string, number>();
  for (const { date, price } of data) {
    byDate.set(date, price);
  }

  // 2. Convertimos a array, renombramos keys y ordenamos ascendente por fecha
  return Array.from(byDate.entries())
    .map(([date, price]) => ({
      time: date,
      value: price
    }))
    .sort((a, b) =>
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );
}


function getTendency(product: Product) {
  let tendencia = 0;
  const priceArray = product.history.map((entry) => entry.price).reverse();
  let daysPerPrice = 0;
  let sumDays = 0;
  let sumDaysSquared = 0;
  let sumPrices = 0;
  for (let i = 0; i < priceArray.length; i++) {
    daysPerPrice += priceArray[i] * (i + 1);
    sumDays += i + 1;
    sumPrices += priceArray[i];
    sumDaysSquared += (i + 1) * (i + 1);
  }
  const slope =
    (priceArray.length * daysPerPrice - sumDays * sumPrices) /
    (priceArray.length * sumDaysSquared - sumDays * sumDays);
  const intercept = (sumPrices - slope * sumDays) / priceArray.length;
  const predictionPrice = slope * (priceArray.length + 1) + intercept;
  const currentPrice = product.sale_price != 0 ? product.sale_price : product.price;
  tendencia =
    Math.round(((predictionPrice - currentPrice) / currentPrice) * 100 * 100) /
    100;
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
  return {
    tienda: tienda,
    price: product.sale_price != 0 ? product.sale_price : product.price,
    futurePrice: Math.round(predictionPrice * 100) / 100,
    tendencia: tendencia,
  };
}

function getPrices(product: Product) {
  let tienda = "";
  if (product.url.includes("farmatodo")) {
    tienda = "farmatodo";
  } else if (product.url.includes("tuzonamarket")) {
    tienda = "tuzonamarket";
  } else if (product.url.includes("kromionline")) {
    tienda = "kromi";
  } else if (product.url.includes("promarketlatino")) {
    tienda = "promarket";
  }

  return {
    tienda: tienda,
    precio: product.price,
    sale_price: product.sale_price,
    link: product.url,
  };
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
  const url = "https://n5tz68kn-8000.use.devtunnels.ms/items/id/" + id + "/";
  console.log("url", url);

  async function getProduct(url) {
    try {
      const res = await fetch(url, { next: { revalidate: 60 * 30 } });
      
      // Clonamos antes de leer:
      const clone = res.clone();
      const text = await clone.text();
      console.log("res en formato text:", text);
      
      if (!res.ok) throw new Error(res.statusText);
      
      const data = await res.json();
      console.log("res en formato json:", data);
      return data;
    } catch (error) {
      console.error("Error obteniendo el producto:", error);
      const fallback = await fetch(url, { cache: 'no-store' });
      if (!fallback.ok) throw error;
      return await fallback.json();
    }
  }
  
  const product = await getProduct(url);
  if (!product) {
    notFound();
  }
  /* await fetch("https://n5tz68kn-8000.use.devtunnels.ms/items/view/" + id + "/", {
    method: "PATCH",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("fetch para acumular vistas", data);
    })
    .catch((error) => {
      console.error("Error en el fetch para acumular vistas:", error);
    }); */

  const exampleProductInfo = {
    name: product.name.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase()),
    image: product.products[0].image,
    precios: product.products.map((producto: Product) => {
      return getPrices(producto);
    }),
  };

  

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

  interface History {
    time: string;
    value: number;
  } 
  interface HistoryPrices{
    tuzonamarket: History[];
    farmatodo: History[];
    kromi: History[];
    promarket: History[];
  }
  const historyPrices = {} as HistoryPrices;
  for (const producto of product.products) {
    const tendency = getTendency(producto);
    const futurePrice = tendency.futurePrice;
    let history = getHistory(producto.history);
    history = addNextDayPrice(history, futurePrice);
    historyPrices[tendency.tienda] = history;
  }
  

  const meanPrice =
    Math.round(
      (product.products.reduce(
        (acc: number, producto: Product) =>
          acc +
          (producto.sale_price != 0 ? producto.sale_price : producto.price),
        0
      ) /
        product.products.length) *
        100
    ) / 100;
  const meanTendencia =
    Math.round(
      (product.products.reduce(
        (acc: number, producto: Product) =>
          acc + getTendency(producto).tendencia,
        0
      ) /
        product.products.length) *
        100
    ) / 100;

  const exampleProductTendecy = {
    mean_price: meanPrice,
    tendecia_media:
      meanTendencia /* Esto no se si es que subio 2% en los ultimos dias o es una prediccion? */,
    tendencia_store:
      searchParams?.store == "km"
        ? tendencias["kromi"]
        : searchParams?.store == "tzm"
        ? tendencias["tuzonamarket"]
        : searchParams?.store == "pm"
        ? tendencias["promarket"]
        : searchParams?.store == "fmt"
        ? tendencias["farmatodo"]
        : Object.values(tendencias)[0],
  };

  const tiendas = Object.keys(tendencias);

  
  return (
    <>
      <main className={`${styles["main"]}`}>
        <Info product={exampleProductInfo} />
        <Tendency
          infoTendency={exampleProductTendecy}
          includedStores={tiendas}
        />
        <Graphic
          data={
            searchParams?.store == "km"
              ? historyPrices["kromi"]
              : searchParams?.store == "tzm"
              ? historyPrices["tuzonamarket"]
              : searchParams?.store == "pm"
              ? historyPrices["promarket"]
              : searchParams?.store == "fmt"
              ? historyPrices["farmatodo"]
              : Object.values(historyPrices)[0]
          }
        />
      </main>
    </>
  );
}
