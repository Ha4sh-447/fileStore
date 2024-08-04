import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
	EllipsisVertical,
	File,
	FileIcon,
	FileTextIcon,
	GanttChartIcon,
	ImageIcon,
	StarHalf,
	StarIcon,
	TrashIcon,
	UndoIcon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { getURL } from "next/dist/shared/lib/utils";
import { url } from "inspector";
import { Protect } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistance, formatRelative, subDays } from "date-fns";

export function FileActions({
	file,
}: {
	file: Doc<"files"> & { isFav: boolean; url: string | null };
}) {
	const deleteFile = useMutation(api.files.deleteFile);
	const restoreFile = useMutation(api.files.restoreFile);
	const toggleFav = useMutation(api.files.addFavorite);
	const { toast } = useToast();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const me = useQuery(api.users.getCurrentUser);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button>
						<EllipsisVertical />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						className="flex gap-1  items-center cursor-pointer"
						onClick={() => {
							toggleFav({
								fileId: file._id,
							});
						}}
					>
						{file.isFav ? (
							<div className="flex gap-1 items-center">
								<StarIcon className="w-4 h-4" /> Unfavorite
							</div>
						) : (
							<div className="flex gap-1 items-center">
								<StarHalf className="w-4 h-4" /> Favorite
							</div>
						)}
					</DropdownMenuItem>
					<DropdownMenuItem
						className="flex gap-1  items-center cursor-pointer"
						onClick={() => {
							if (!file.url) return;
							window.open(file.url, "_blank");
						}}
					>
						<FileIcon className="w-4 h-4" />
						Download
					</DropdownMenuItem>
					<Protect
						condition={(check) => {
							return (
								check({
									role: "org:admin",
								}) || me?._id === file.userId
							);
						}}
						fallback={<></>}
					>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="flex gap-1 items-center cursor-pointer"
							onClick={() => {
								if (file.isMarkedDeleted) {
									restoreFile({
										fileId: file._id,
									});
								} else {
									setIsConfirmOpen(true);
								}
							}}
						>
							{file.isMarkedDeleted ? (
								<div className="flex gap-1 text-green-600 items-center cursor-pointer">
									<UndoIcon className="w-4 h-4" /> Restore
								</div>
							) : (
								<div className="flex gap-1 text-red-600 items-center cursor-pointer">
									<TrashIcon className="w-4 h-4" /> Delete
								</div>
							)}
						</DropdownMenuItem>
					</Protect>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Do you really wish to delete this file?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							account and remove your data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								await deleteFile({
									fileId: file._id,
								});
								toast({
									variant: "default",
									title: "File has been marked deleted",
									description: "Your file has been marked for deletion",
								});
							}}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export function FileCard({
	file,
}: {
	file: Doc<"files"> & { isFav: boolean; url: string | null };
}) {
	const userProfile = useQuery(api.users.getUserProfile, {
		userId: file.userId,
	});
	const typeIcons = {
		image: <ImageIcon />,
		pdf: <FileTextIcon />,
		csv: <GanttChartIcon />,
	} as Record<Doc<"files">["type"], ReactNode>;

	return (
		<Card>
			<CardHeader className="relative">
				<CardTitle className="flex gap-2 text-base font-normal">
					<div className="flex justify-center">{typeIcons[file.type]}</div>
					{file.name}
				</CardTitle>
				<div className="absolute top-3 right-3">
					<FileActions file={file} />
				</div>
				{/* <CardDescription>Card Description</CardDescription> */}
			</CardHeader>
			<CardContent className="h-[200px] flex justify-center items-center">
				{file.type === "image" && (
					<Image
						alt={file.name}
						width="200"
						height="200"
						src={file.url ? file.url : ""}
						className="max-w-full max-h-full object-contain"
					/>
				)}

				{file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
				{file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
			</CardContent>
			<CardFooter className="flex gap-2 text-xs text-gray-100">
				<div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
					<Avatar className="w-6 h-6">
						<AvatarImage src={userProfile?.image} />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					{userProfile?.name}
				</div>
				<div className="text-xs text-gray-700">
					Uploaded {formatRelative(new Date(file._creationTime), new Date())}
				</div>
			</CardFooter>
		</Card>
	);
}
