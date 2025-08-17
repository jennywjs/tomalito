import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	title: "Tomalito",
	description: "Tomalito - Next.js app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<header className="border-b">
					<nav className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
						<Link href="/" className="font-semibold">Welcome, Tomalito</Link>
						<div className="flex items-center gap-4 text-sm">
							<Link href="/">Updates</Link>
							<Link href="/wishes">Welcome Wishes</Link>
						</div>
					</nav>
				</header>
				<main className="mx-auto max-w-3xl px-4 py-6 min-h-[calc(100dvh-56px)] bg-[radial-gradient(circle_at_20%_0%,_rgba(254,226,226,0.6),_transparent_40%),_radial-gradient(circle_at_80%_0%,_rgba(254,205,211,0.6),_transparent_35%),_linear-gradient(to_bottom,_rgba(255,245,247,1),_rgba(255,250,251,1))]">
					{children}
				</main>
			</body>
		</html>
	);
}
