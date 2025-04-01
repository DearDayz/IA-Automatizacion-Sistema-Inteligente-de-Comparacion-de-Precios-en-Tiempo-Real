"use client";
import Image from "next/image";
import styles from "./input.module.css";
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function Input() {

  const searchParams = useSearchParams(); 
  const pathname = usePathname(); 
  const { replace } = useRouter(); 

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams?.toString() || ""); 
    if (term) {
      params.set('query', term); 
    } else {
      params.delete('query'); 
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }
  return (
    <form className={`${styles["main__form"]}`} action="">
      <input
        className={`${styles["main__input"]}`}
        type="text"
        placeholder="Buscar"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <button className={`${styles["main__button"]}`} type="button">
        <Image
          className={`${styles["main__button-icon"]}`}
          src="icons/search.svg"
          alt="search icon"
          width={24}
          height={24}
        />
      </button>
    </form>
  );
}
