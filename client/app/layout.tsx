import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {" "}
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <body className={``}>{children}</body>
    </html>
  );
}
