import SmoothScroll from "@/components/SmoothScroll";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScroll>
      {children}
    </SmoothScroll>
  );
}
