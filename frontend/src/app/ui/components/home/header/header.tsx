import Image from "next/image";
import styles from "./header.module.css";
import { lilita_one } from "../../../fonts";
import Login from "./login";
import Coin from "./coin";
import Link from "next/link";
export default function Header() {
  return (
    <header className={`${styles["header"]}`}>
      <Link href="/" className={`${styles["header__logo-container"]}`}>
        <Image
          className={`${styles["header__logo"]}`}
          src="/icons/logo.png"
          alt="logo"
          width={56}
          height={52}
        />
        <span className={`${styles["header__name"]} ${lilita_one.className}`}>Al Click</span>
      </Link>
      <div className={`${styles["header__options-container"]}`}>
        <ul className={`${styles["header__options-list"]}`}>
          <Login/>
          <Coin/>
          <li className={`${styles["header__option-notification"]}`}>
            <Image
              src="/icons/notification.svg"
              alt="notification logo"
              width={24}
              height={24}
            />
          </li>
        </ul>
      </div>
    </header>
  );
}
