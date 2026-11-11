import { googleEnabled } from "@/lib/auth";
import LoginCard from "@/components/auth/LoginCard";

export const metadata = { title: "Log in · EduTok" };

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-[radial-gradient(80%_60%_at_50%_0%,rgba(123,97,255,0.25),transparent),radial-gradient(60%_50%_at_50%_100%,rgba(198,255,61,0.12),transparent)] p-4">
      <LoginCard google={googleEnabled} callbackUrl={searchParams.callbackUrl ?? "/"} error={searchParams.error} />
    </div>
  );
}
