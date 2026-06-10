export const metadata = {
  title: 'Dome Cafe CMS Admin Portal',
  description: 'Manage Dome Cafe content, packages, reviews, and bookings',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
