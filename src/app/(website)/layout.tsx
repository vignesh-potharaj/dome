import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScroll>
      <Navbar />
      {children}
    </SmoothScroll>
  );
}
