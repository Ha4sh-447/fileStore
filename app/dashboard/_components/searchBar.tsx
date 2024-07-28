import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { SearchIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const formSchema = z.object({
	query: z.string().min(0).max(200),
});

export function SearchBar({
	query,
	setQuery,
}: {
	query: string;
	setQuery: Dispatch<SetStateAction<string>>;
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			query: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		console.log(values);
		setQuery(values.query);
	}

	return (
		<div className="flex justify-between">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex items-center gap-2"
				>
					<FormField
						control={form.control}
						name="query"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input placeholder="Search files" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" size="sm">
						<SearchIcon className="h-4 w-4 mr-2" />
						Search
					</Button>
				</form>
			</Form>
		</div>
	);
}
