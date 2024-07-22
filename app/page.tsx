"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
	SignedOut,
	SignInButton,
	SignedIn,
	SignOutButton,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
	const files = useQuery(api.files.getFiles);
	const createFile = useMutation(api.files.createFile);

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<SignedOut>
				<SignInButton mode="modal">
					<Button>Sign in</Button>
				</SignInButton>
				{/* <SignInButton mode="modal" /> */}
			</SignedOut>
			<SignedIn>
				<SignOutButton>
					<Button>Sign out</Button>

					{/* <UserButton /> */}
				</SignOutButton>
			</SignedIn>

			{files?.map((file) => {
				return <div key={file._id}>{file.name}</div>;
			})}

			<Button
				onClick={() => {
					createFile({
						name: "Hello world",
					});
				}}
			>
				Create file
			</Button>
			<Button>Hello World</Button>
		</main>
	);
}
