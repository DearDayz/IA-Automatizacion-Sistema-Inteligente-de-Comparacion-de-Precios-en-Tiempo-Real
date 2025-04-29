import type { NextApiRequest, NextApiResponse } from "next";

// Definir la estructura de la respuesta de la API externa


interface ExchangeRateResponse {
  fuente: string;
  nombre: string;
  compra: null | string;
  venta: null | string;
  promedio: number;
  fechaActualizacion: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const response = await fetch("https://ve.dolarapi.com/v1/dolares", {
      next: { revalidate: 60 * 30 }
    }).then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return  res.json();
    });


    const data: ExchangeRateResponse[] = response;

    res.status(200).json(data[0].promedio);
  } catch (error) {
    console.error("Error obteniendo la tasa de cambio:", error);
    res.status(500).json({ error: "No se pudo obtener la tasa de cambio" });
  }
}
