import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
	return (
		<div className="flex flex-col">
			Home
			<div>
				<Link href="/dashboard/files">
					<Button>Go To Dashboard</Button>
				</Link>
			</div>
		</div>
	);
}
