/* import Image from "next/image"; */
import Main from "./ui/components/home/main/main";
export default async function Home(props: {
  searchParams: {
    cash?: string;
    query?: string;
    mw?: string;
    offerts?: string;
    order?: string;
    brand?: string;
    page?: string;
  };
}) {
  const searchParams = await props.searchParams;
  console.log("hola soy el dinero", searchParams.cash);
  return <Main params={searchParams} />;
}
