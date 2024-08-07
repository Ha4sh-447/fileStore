import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function StorageInfo() {
	const organization = useOrganization();
	const user = useUser();

	let orgId: string | undefined = undefined;

	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const fileMetaData = useQuery(
		api.files.getFileMetaData,
		orgId ? { orgId } : "skip"
	);
	const [totalSize, setTotalSize] = useState<number>(0);

	useEffect(() => {
		if (fileMetaData) {
			const sizeInBytes = fileMetaData.reduce(
				(acc, file) => acc + (file?.size ?? 0),
				0
			);
			setTotalSize(sizeInBytes);
		}
	}, [fileMetaData]);

	const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
	const totalSizeInGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
	const availableSpace = 1;
	const used = (+totalSizeInMB / availableSpace) * 100;

	return (
		<div>
			<div className="flex flex-col gap-2">
				<Progress value={used} className="h-2 w-auto" />
				<div className="text-xs">
					{/* totalSizeInMB}MB out of ${availableSpace}GB used */}
					{totalSizeInMB}MB out of {availableSpace}GB used
				</div>
			</div>
		</div>
	);
}
