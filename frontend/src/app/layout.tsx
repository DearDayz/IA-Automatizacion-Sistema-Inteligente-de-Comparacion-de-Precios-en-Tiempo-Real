import { rubik,  } from "./ui/fonts";
import Header from "./ui/components/home/header/header";
import "./ui/global.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.className}  antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
