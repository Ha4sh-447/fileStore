"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
	SignedOut,
	SignInButton,
	SignedIn,
	SignOutButton,
	useOrganization,
	useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import ClerkSignInFunc from "./signIn";

export default function Home() {
	const createFile = useMutation(api.files.createFile);
	const organization = useOrganization();
	const user = useUser();

	// ! We are overloading orgId with user id which is sort of bad
	// ! also we are not confirming wether the identity of the user logged in refers to the current organization or not,
	// ! currently we just log in and perform no checks over the user and his organizations

	let orgId: string | undefined = undefined;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
	// console.log(organization?.id);
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			{files?.map((file) => {
				return <div key={file._id}>{file.name}</div>;
			})}

			<Button
				onClick={() => {
					if (!orgId) return;

					createFile({
						name: "Hello world",
						orgId,
					});
				}}
			>
				Create file
			</Button>
			<Button
				onClick={() => {
					organization.isLoaded
						? console.log(organization.organization)
						: user.isLoaded
							? console.log(user.user)
							: null;
				}}
			>
				Hello World
			</Button>
		</main>
	);
}
