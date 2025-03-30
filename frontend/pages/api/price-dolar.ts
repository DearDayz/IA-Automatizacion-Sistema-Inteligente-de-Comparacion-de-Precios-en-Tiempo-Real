import { console } from "inspector";
import type { NextApiRequest, NextApiResponse } from "next";

// Definir la estructura de la respuesta de la API externa
interface CurrencyData {
  symbol: string;
  value: string;
}

interface ExchangeRateResponse {
  error: boolean;
  error_message: string[];
  data: {
    euro: CurrencyData;
    yuan: CurrencyData;
    lira: CurrencyData;
    rublo: CurrencyData;
    dolar: CurrencyData;
    effective_date: string;
    run_timestamp: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("hola");
    const response = await fetch(
      "https://bcv-exchange-rates.vercel.app/get_exchange_rates"
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error obteniendo la tasa de cambio:", error);
    res.status(500).json({ error: "No se pudo obtener la tasa de cambio" });
  }
}
