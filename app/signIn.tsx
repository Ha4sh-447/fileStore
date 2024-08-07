import { Button } from "@/components/ui/button";
import {
	SignedOut,
	SignInButton,
	SignedIn,
	SignOutButton,
} from "@clerk/nextjs";

export default function ClerkSignInFunc() {
	const signUpForcedRedirectUrl = process.env.CLERK_SIGN_UP_FORCE_REDIRECT_URL;
	return (
		<>
			<SignedOut>
				<SignInButton
					mode="modal"
					signUpForceRedirectUrl={signUpForcedRedirectUrl}
				>
					<Button>Sign in</Button>
				</SignInButton>
				{/* <SignInButton mode="modal" /> */}
			</SignedOut>
		</>
	);
}
