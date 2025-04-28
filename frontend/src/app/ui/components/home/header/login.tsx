"use client";
import Image from "next/image";
import styles from "./login.module.css";
import FormLogin from "./formLogin";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
export default function Login() {
  const searchParams = useSearchParams(); // Objeto que contiene los parámetros de la url actual

  const pathname = usePathname(); // Nos da la url actual pero sin los parámetros de búsqueda y desde el root raiz en adelante
  const { replace } = useRouter(); // Hook que nos permite cambiar la url actual

  function handleClick() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("login", "open");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {searchParams?.get("login") ? <FormLogin /> : null}
      <li onClick={handleClick} className={`${styles["header__option-login"]}`}>
        <div className={`${styles["header__option-login-link"]}`}>
          <Image
            src="/icons/person.svg"
            alt="login logo"
            width={24}
            height={24}
          />
          <div className={`${styles["header__option-login-text-container"]}`}>
            <span className={`${styles["header__option-login-text"]}`}>
              Iniciar Sesión
            </span>
          </div>
        </div>
      </li>
    </>
  );
}
