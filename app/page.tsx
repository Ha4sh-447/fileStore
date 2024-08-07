import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
	return (
		<div className="flex flex-col mx-auto items-center">
			Welcome to Filestore
			<div>
				<Link href="/dashboard/files">
					<Button>Go To Dashboard</Button>
				</Link>
			</div>
		</div>
	);
}
