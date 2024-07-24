import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import ClerkSignInFunc from "./signIn";

export function Header() {
	return (
		<div className="border-b">
			<div className="items-center container mx-auto flex justify-between h-10">
				<div>FileStore</div>
				<div className="flex gap-2">
					<ClerkSignInFunc />
					<OrganizationSwitcher />
					<UserButton />
				</div>
			</div>
		</div>
	);
}
