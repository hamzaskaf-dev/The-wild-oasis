import Link from "next/link";
import LoginForm from "@/app/_components/LoginForm";

export const metadata = { title: "Login" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 mt-10 items-center">
      <h2 className="text-3xl font-semibold">Sign in to your guest area</h2>
      <LoginForm />
      <Link href="/signup" className="text-accent-400 underline">
        Create an account
      </Link>
    </div>
  );
}
