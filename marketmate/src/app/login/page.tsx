import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in — MarketMate" };

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </>
  );
}
