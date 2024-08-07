import { OrganizationSwitcher, UserButton, UserProfile } from "@clerk/nextjs";
import ClerkSignInFunc from "./signIn";
import Link from "next/link";

export function Header() {
	return (
		<div className="relative z-10 border-b py-4 bg-gray-50">
			<div className="items-center container mx-auto justify-between flex">
				<Link href="/" className="flex gap-2 items-center text-xl text-black">
					{/* <Image src="/logo.png" width="50" height="50" alt="file drive logo" /> */}
					FileStore
				</Link>
				<div className="flex gap-2">
					<ClerkSignInFunc />
					<OrganizationSwitcher afterCreateOrganizationUrl="http://localhost:3000/dashboard/files" />
					<UserButton />
					{/* <UserProfile /> */}
				</div>
			</div>
		</div>
	);
}
