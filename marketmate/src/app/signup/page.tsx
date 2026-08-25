import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up — MarketMate" };

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AuthForm mode="signup" />
      </main>
      <Footer />
    </>
  );
}
