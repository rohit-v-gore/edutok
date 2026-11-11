import { googleEnabled } from "@/lib/auth";
import LoginCard from "@/components/auth/LoginCard";

export const metadata = { title: "Log in · EduTok" };

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-[radial-gradient(70%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent)] p-4">
      <LoginCard google={googleEnabled} callbackUrl={searchParams.callbackUrl ?? "/"} error={searchParams.error} />
    </div>
  );
}
