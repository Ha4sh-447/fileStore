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
import { FileIcon, Loader2, StarIcon } from "lucide-react";
import { SearchBar } from "../_components/searchBar";
import { useState } from "react";
import FavoritesPage from "../favorites/page";

function PlaceHolder() {
	return (
		<>
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
		</>
	);
}

export default function FilesPage({
	title,
	fav,
	deletedOnly,
}: {
	title: string;
	fav?: boolean;
	deletedOnly?: boolean;
}) {
	const organization = useOrganization();
	const user = useUser();
	const [query, setQuery] = useState("");
	let orgId: string | undefined = undefined;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const favorites = useQuery(
		api.files.getAllFavorites,
		orgId ? { orgId } : "skip"
	);

	const files = useQuery(
		api.files.getFiles,
		orgId ? { orgId, query, fav, deletedOnly } : "skip"
	);
	const isLoading = files === undefined;
	return (
		<div className="w-full">
			{isLoading && (
				<div className="flex flex-col gap-8 w-full items-center mt-10">
					<Loader2 className="h-24 w-24 animate-spin" />
					<div className="text-2xl">Loading...</div>
				</div>
			)}

			{!isLoading && (
				<>
					<div className="flex justify-between items-center mb-8">
						<h1 className="font-bold text-4xl">{title}</h1>
						<SearchBar query={query} setQuery={setQuery} />
						<UploadBtn />
					</div>

					<div className="grid grid-cols-3 gap-4">
						{files?.map((file) => {
							return (
								<FileCard
									favorites={favorites ?? []}
									key={file._id}
									file={file}
								/>
							);
						})}
					</div>
					{fav && files.length === 0 && (
						<div>
							<div className="text-2xl">Nothing in favorites</div>
						</div>
					)}
					{!fav && !query && files.length === 0 && <PlaceHolder />}
					{!fav && query && files.length === 0 && <PlaceHolder />}
				</>
			)}
		</div>
	);
}
