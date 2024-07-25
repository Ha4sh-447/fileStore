"use client";
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

import { UploadBtn } from "./uploadBtn";
import { FileCard } from "./fileCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
	const organization = useOrganization();
	const user = useUser();

	let orgId: string | undefined = undefined;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
	// console.log(organization?.id);
	return (
		<main className="container mx-auto pt-12">
			{files === undefined && (
				<div className="flex flex-col gap-8 w-full items-center mt-10">
					<Loader2 className="h-24 w-24 animate-spin" />
					<div className="text-2xl">Loading...</div>
				</div>
			)}

			{files && files.length === 0 && (
				<div className="flex flex-col gap-8 items-center w-full mt-10">
					<Image
						alt="An image with empty directory"
						height="300"
						width="300"
						src="/empty.svg"
					/>
					<div className="text-2xl">You have no files, upload one now</div>
					<UploadBtn />
				</div>
			)}

			{files && files.length > 0 && (
				<>
					<div className="flex justify-between items-center mb-2">
						<h1 className="font-bold text-4xl">Your Files</h1>
						<UploadBtn />
					</div>
					<div className="grid grid-cols-4 gap-4">
						{files?.map((file) => {
							return <FileCard key={file._id} file={file} />;
						})}
					</div>
				</>
			)}
		</main>
	);
}
