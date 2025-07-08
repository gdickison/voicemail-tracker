import { Roboto } from "next/font/google";
import "./globals.css";



const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata = {
  title: "Greg's Voicemail Tracker",
  description: "A simple voicemail tracker for Greg",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
