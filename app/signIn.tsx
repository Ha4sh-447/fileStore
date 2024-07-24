import { Button } from "@/components/ui/button";
import {
	SignedOut,
	SignInButton,
	SignedIn,
	SignOutButton,
} from "@clerk/nextjs";

export default function ClerkSignInFunc() {
	return (
		<>
			<SignedOut>
				<SignInButton mode="modal">
					<Button>Sign in</Button>
				</SignInButton>
				{/* <SignInButton mode="modal" /> */}
			</SignedOut>
		</>
	);
}
