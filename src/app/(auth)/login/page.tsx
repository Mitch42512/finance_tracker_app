'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
	const { data: session } = useSession();

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				{/* 🔐 Auth Section */}
				<div className="text-center sm:text-left">
					{session ? (
						<div className="flex flex-col items-center sm:items-start gap-2">
							<p>Signed in as <strong>{session.user?.email}</strong></p>
							<button
								onClick={() => signOut()}
								className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
							>
								Sign Out
							</button>
						</div>
					) : (
						<button
							onClick={() =>
								signIn("google", { callbackUrl: window.location.pathname })
							}
							className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
						>
							Sign In with Google
						</button>
					)}
				</div>
			</main>
		</div>
	);
}
