import type { Metadata } from "next";
import {
	overwriteGetLocale,
	getLocale,
	Locale,
	localizeHref,
} from "../paraglide/runtime";
import ClientSideLocaleSwitch from "./ClientSideLocaleSwitch";
import Link from "next/link";
import * as m from "../paraglide/messages.js";
import { headers } from "next/headers";

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

overwriteGetLocale(() => {
	// @ts-expect-error - headers is sync for fuck's sake nextjs
	// https://github.com/opral/inlang-paraglide-js/issues/245#issuecomment-2608727658
	return headers().get("x-paraglide-locale") as Locale;
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang={getLocale()}>
			<body>
				<b>
					<p>{m.static_anchor_tags_info()}</p>
				</b>
				<div>
					<Link href={localizeHref("/", { locale: "en" })}>
						{m.navigate_to_en()}
					</Link>
				</div>
				<div>
					<Link href={localizeHref("/", { locale: "de" })}>
						{m.navigate_to_de()}
					</Link>
				</div>
				<b>
					<p>{m.programmatic_locale_switching_info()}</p>
				</b>
				<ClientSideLocaleSwitch />
				<hr />
				{children}
			</body>
		</html>
	);
}
