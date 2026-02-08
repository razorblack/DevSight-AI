// Using system fonts as fallback when Google Fonts are unavailable
// This provides a better user experience in restricted network environments
// To use custom fonts, set up local font files or configure font loading
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
