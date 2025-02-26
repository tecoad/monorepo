import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { m } from "../paraglide/messages.js";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="p-2">
			<h3>{m.welcome()}</h3>
		</div>
	);
}
