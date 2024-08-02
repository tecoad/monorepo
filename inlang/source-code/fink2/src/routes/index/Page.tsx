import Layout from "../../layout.tsx";
import { projectAtom } from "../../state.ts";
import { useAtom } from "jotai";
import InlangBundle from "../../components/InlangBundle.tsx";
import { pluralBundle } from "@inlang/sdk2";
import { insertNestedBundle } from "../../helper/insertNestedBundle.ts";
import { useEffect, useState } from "react";

export default function App() {
	const [project] = useAtom(projectAtom)
	const [bundleIds, setBundleIds] = useState<string[]>([])
	const getBundleIds = async () => {
		const bundleIdsList = await project?.db.selectFrom("bundle").selectAll().execute() ?? []
		setBundleIds(bundleIdsList.map((bundle) => bundle.id));
		return bundleIdsList;
	}

	useEffect(() => {
		if (!project) return
		getBundleIds()
		// setup demo if project is empty
		if (bundleIds.length === 0) {
			console.info("Insert demo bundle in empty project")
			insertNestedBundle(project, pluralBundle)
			getBundleIds()
		}
	}, [project])

	return (
		<>
			<Layout>
				{project &&
					bundleIds.map((bundleId) => (
						<InlangBundle
							key={bundleId}
							bundleId={bundleId}
						/>
					))
				}
			</Layout>
		</>
	);
}
