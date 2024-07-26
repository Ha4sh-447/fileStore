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
	FileTextIcon,
	GanttChartIcon,
	ImageIcon,
	TrashIcon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { getURL } from "next/dist/shared/lib/utils";
import { url } from "inspector";

function FileActions({ file }: { file: Doc<"files"> }) {
	const deleteFile = useMutation(api.files.deleteFile);
	const { toast } = useToast();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	return (
		<>
			<AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<AlertDialogTrigger>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<EllipsisVertical />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								className="flex gap-1 text-red-600 items-center cursor-pointer"
								onClick={() => setIsConfirmOpen(true)}
							>
								<TrashIcon className="w-4 h-4" /> Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</AlertDialogTrigger>
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
									title: "File deleted",
									description: "Your file has been deleted",
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

//  !Image route fix needed
function getFileUrl(fileId: Id<"_storage">): string {
	const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/getImage`;
	// const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
	const url = new URL(imageUrl);
	url.searchParams.set("storageId", fileId);
	return url.href;
	// return imageUrl;
}

export function FileCard({ file }: { file: Doc<"files"> }) {
	const typeIcons = {
		image: <ImageIcon />,
		pdf: <FileTextIcon />,
		csv: <GanttChartIcon />,
		// https://elated-ibex-292.convex.cloud/api/storage/f18a7832-d613-4aa4-a18b-0f0898de988e
	} as Record<Doc<"files">["type"], ReactNode>;

	// console.log(getFileUrl(file.fileId));
	return (
		<Card>
			<CardHeader className="relative">
				<CardTitle className="flex gap-2">
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
						height="100"
						src={getFileUrl(file.fileId)}
					/>
				)}

				{file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
				{file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
			</CardContent>
			<CardFooter className="flex justify-center">
				<Button onClick={() => window.open(getFileUrl(file.fileId), "_blank")}>
					Download
				</Button>
			</CardFooter>
		</Card>
	);
}
