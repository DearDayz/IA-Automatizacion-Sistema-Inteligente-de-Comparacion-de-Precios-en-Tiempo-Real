/* import Image from "next/image"; */
import Main from "./ui/components/home/main/main";
export default async function Home( props:{
  searchParams: { cash?: string };
} ) {

  const searchParams = await props.searchParams;
  console.log(searchParams.cash);
  const cash = { cash: searchParams.cash || "" };
  return (
    <Main cash={cash}/>
  );
}
