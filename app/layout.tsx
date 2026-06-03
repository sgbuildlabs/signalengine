export const metadata = {
  title: 'Signal Engine',
  description: 'Sprint 1 Run Sandbox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', margin: 0, padding: 24 }}>{children}</body>
    </html>
  );
}
