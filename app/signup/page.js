import Link from "next/link";
import SignupForm from "@/app/_components/SignupForm";

export const metadata = { title: "Sign up" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 mt-10 items-center">
      <h2 className="text-3xl font-semibold">Create your guest account</h2>
      <SignupForm />
      <Link href="/login" className="text-accent-400 underline">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
