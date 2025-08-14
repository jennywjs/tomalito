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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<header className="border-b">
					<nav className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
						<Link href="/" className="font-semibold">Tomalito</Link>
						<div className="flex items-center gap-4 text-sm">
							<Link href="/">Blog</Link>
							<Link href="/wishes">Well Wishes</Link>
						</div>
					</nav>
				</header>
				<main className="mx-auto max-w-3xl px-4 py-6">
					{children}
				</main>
			</body>
		</html>
	);
}
