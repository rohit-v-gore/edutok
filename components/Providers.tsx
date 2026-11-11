"use client";

import { SessionProvider } from "next-auth/react";
import { UserStateProvider } from "@/lib/user-state";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserStateProvider>{children}</UserStateProvider>
    </SessionProvider>
  );
}
