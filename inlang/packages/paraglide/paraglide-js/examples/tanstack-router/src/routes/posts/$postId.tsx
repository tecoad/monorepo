import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
	component: AboutComponent,
});

function AboutComponent() {
	const { postId } = Route.useParams();

	return (
		<div className="p-2">
			<h3>Post ID {postId}</h3>
		</div>
	);
}
