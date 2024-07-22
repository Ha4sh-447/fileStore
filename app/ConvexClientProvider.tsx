"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
	ClerkProvider,
	SignedIn,
	SignedOut,
	SignInButton,
	SignOutButton,
	useAuth,
	UserButton,
} from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		// <ClerkProvider>
		// 	<html lang="en">
		// 		<body>
		// 			<SignedOut>
		// 				<SignInButton mode="modal">
		// 					<Button>Sign in</Button>
		// 				</SignInButton>
		// 				{/* <SignInButton mode="modal" /> */}
		// 			</SignedOut>
		// 			<SignedIn>
		// 				<SignOutButton>
		// 					<Button>Sign out</Button>

		// 					{/* <UserButton /> */}
		// 				</SignOutButton>
		// 			</SignedIn>
		// 			{children}
		// 		</body>

		// 	</html>
		// </ClerkProvider>
		<ClerkProvider
			publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
		>
			<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
				{children}
			</ConvexProviderWithClerk>
		</ClerkProvider>
	);
}
