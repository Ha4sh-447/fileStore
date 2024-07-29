import React from "react";
import FilesPage from "../_components/filesPage";

export default function TrashPage() {
	return (
		<div>
			<FilesPage title="Your Files" deletedOnly />
		</div>
	);
}
