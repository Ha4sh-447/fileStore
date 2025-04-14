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
import { FileIcon, GridIcon, Loader2, RowsIcon, StarIcon } from "lucide-react";
import { SearchBar } from "../_components/searchBar";
import { useState } from "react";
import FavoritesPage from "../favorites/page";
import { DataTable } from "./fileTable";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Doc } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";

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
	const [type, setType] = useState<Doc<"files">["type"] | "all">("all");
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
		orgId ? { orgId, query, fav, deletedOnly, type } : "skip"
	);
	const isLoading = files === undefined;

	const filesWithFav =
		files?.map((fi) => ({
			...fi,
			isFav: (favorites ?? []).some((favorite) => favorite.fileId === fi._id),
		})) ?? [];

	return (
		<div className="w-full">
			{user.isLoaded && !user.isSignedIn && (
				<div className="flex flex-col gap-8 w-full items-center mt-10">
					<div className="text-2xl"> Sign In to upload/view your files</div>
				</div>
			)}

			{isLoading && user.isSignedIn && (
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

					<Tabs defaultValue="table">
						<div className="flex justify-between">
							<TabsList>
								<TabsTrigger value="grid">
									<RowsIcon />
								Table	
								</TabsTrigger>
								<TabsTrigger value="table">
									<GridIcon />
									Grid
								</TabsTrigger>
							</TabsList>
							<div className="flex gap-2 items-center">
								<Label htmlFor="selectType">Filter</Label>
								<Select
									value={type}
									onValueChange={(cat) => {
										setType(cat as any);
									}}
								>
									<SelectTrigger id="selectType" className="w-[150px]">
										<SelectValue placeholder="All" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="image">Images</SelectItem>
										<SelectItem value="pdf">PDF</SelectItem>
										<SelectItem value="csv">CSV</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<TabsContent value="grid">
							<DataTable columns={columns} data={filesWithFav} />
						</TabsContent>
						<TabsContent value="table">
							<ScrollArea className="rounded-md p-4 border-b h-[500px]">
								<div className="grid grid-cols-3 gap-4">
									{filesWithFav?.map((file) => {
										return <FileCard key={file._id} file={file} />;
									})}
								</div>
							</ScrollArea>
							{!fav && !query && files.length === 0 && !deletedOnly && (
								<PlaceHolder />
							)}
							{!fav && query && !deletedOnly && files.length === 0 && (
								<PlaceHolder />
							)}
							{fav && files.length === 0 && (
								<div>
									<div className="text-2xl flex items-center justify-center">
										Nothing in favorites.
									</div>
								</div>
							)}
							{deletedOnly && files.length === 0 && (
								<div>
									<div className="text-2xl flex items-center justify-center">
										You have nothing in trash.
									</div>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	);
}
