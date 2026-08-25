import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata = { title: "Dashboard — MarketMate" };

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <DashboardClient />
      </main>
      <Footer />
    </>
  );
}
