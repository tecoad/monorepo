import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { m } from "../paraglide/messages";

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
		<div className="p-2">
			<h3>{m.about()}</h3>
		</div>
	);
}
