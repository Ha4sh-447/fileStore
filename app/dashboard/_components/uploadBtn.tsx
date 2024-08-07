"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import ClerkSignInFunc from "../../signIn";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { boolean, string, z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
	title: z.string().min(1).max(200),
	// why File or null? why not just File if we want it to be type of File
	// file: z.custom<File | null>((val) => val instanceof File, "Required"),
	// file: z.instanceof(FileList),
	file: z
		.custom<FileList>((val) => val instanceof FileList, "Required")
		.refine((files) => files.length > 0, "Required"),
});

export function UploadBtn() {
	const createFile = useMutation(api.files.createFile);
	const organization = useOrganization();
	const user = useUser();
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
		},
	});

	const fileRef = form.register("file");
	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!orgId) return;
		const postUrl = await generateUploadUrl();

		const fileType = values.file[0].type;
		console.log("PPOST URL: ", postUrl);

		const result = await fetch(postUrl, {
			method: "POST",
			headers: { "Content-Type": fileType },
			body: values.file[0],
		});

		const { storageId } = await result.json();
		console.log("StorageID: ", storageId);

		console.log(values.file);

		const types = {
			"image/png": "image",
			"application/pdf": "pdf",
			"text/csv": "csv",
			"image/jpeg": "image",
			"image/jpg": "image",
			"image/webp": "image",
		} as Record<string, Doc<"files">["type"]>;

		try {
			await createFile({
				name: values.title,
				fileId: storageId,
				orgId: orgId,
				type: types[fileType],
			});

			console.log(values);
			console.log(values.file[0]);

			form.reset();
			setDialogOpen(false);

			toast({
				variant: "success",
				title: "File Uploaded",
				description: "Everyone can view your file",
			});
		} catch (err) {
			console.error(err);
			return toast({
				variant: "destructive",
				title: "Something went Wrong",
				description: "Your file could not be uploaded, try again later",
			});
		}
	}

	// ! We are overloading orgId with user id which is sort of bad
	// ! also we are not confirming wether the identity of the user logged in refers to the current organization or not,
	// ! currently we just log in and perform no checks over the user and his organizations

	let orgId: string | undefined = undefined;
	if (organization.isLoaded && user.isLoaded) {
		console.log(true);
		orgId = organization.organization?.id ?? user.user?.id;
	}
	console.log(orgId);

	const [isDialogOpen, setDialogOpen] = useState(false);
	// console.log(organization?.id);
	return (
		<Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button onClick={() => {}}>Upload</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="mb-8">Upload your field</DialogTitle>
					<DialogDescription>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input placeholder="Title of your file" {...field} />
											</FormControl>
											{/* <FormDescription>File title</FormDescription> */}
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="file"
									render={() => (
										<FormItem>
											<FormLabel>File</FormLabel>
											<FormControl>
												{/* what does this even mean */}
												<Input type="file" {...fileRef} />
											</FormControl>
											{/* <FormDescription>Your File</FormDescription> */}
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={form.formState.isSubmitting}>
									{form.formState.isLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Submit
								</Button>
							</form>
						</Form>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
