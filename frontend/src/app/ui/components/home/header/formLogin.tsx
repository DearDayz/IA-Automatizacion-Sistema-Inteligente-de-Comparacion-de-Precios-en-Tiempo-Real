"use client";
import styles from "./formLogin.module.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function FormLogin() {
  const searchParams = useSearchParams(); // Objeto que contiene los parámetros de la url actual

  const pathname = usePathname(); // Nos da la url actual pero sin los parámetros de búsqueda y desde el root raiz en adelante
  const { replace } = useRouter(); // Hook que nos permite cambiar la url actual

  function handleClick() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("login");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div onClick={handleClick} className={`${styles["overlay"]}`}></div>
      <form className={`${styles["formLogin"]}`}>
        <button
          onClick={handleClick}
          className={`${styles["form__close"]}`}
          type="button"
        >
          X
        </button>
        <h2 className={`${styles["form__title"]}`}>Inicia Sesion</h2>
        <input
          className={`${styles["form__input"]}`}
          type="email"
          placeholder="Correo Electronico"
        />
        <button className={`${styles["form__button"]}`} type="button">
          Ingresar
        </button>
        <div className={`${styles["form__footer"]}`}>
          <span>No tienes una cuenta?</span>
          <a className={`${styles["form__footer-link"]}`} href="#">
            Registrate Aqui
          </a>
        </div>
      </form>
    </div>
  );
}
