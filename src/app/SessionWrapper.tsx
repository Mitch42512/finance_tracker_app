'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  const mockSession = {
    user: { id: "bypass-user", name: "Dev Bypass", email: "dev@bypass.com" },
    expires: "9999-12-31T23:59:59.999Z"
  };
  return <SessionProvider session={mockSession}>{children}</SessionProvider>;
}