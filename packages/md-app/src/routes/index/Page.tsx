import { Toaster } from 'sonner';
import { PlateEditor } from '@/components/editor/plate-editor';
// import { SettingsProvider } from '@/components/editor/settings';
import LixMenuDropdown from "@/components/LixMenuDropdown";
import { activeFileAtom, checkpointChangeSetsAtom, intermediateChangesAtom } from '@/state-active-file';
import { useAtom } from 'jotai/react';
import { Separator } from '@/components/plate-ui/separator';
import IntermediateCheckpointComponent from '@/components/IntermediateCheckpointComponent';
import CheckpointComponent from '@/components/CheckpointComponent';
import Banner from '@/components/Banner';

export default function Page() {
	const [activeFile] = useAtom(activeFileAtom)
	const [intermediateChanges] = useAtom(intermediateChangesAtom);
	const [checkpointChangeSets] = useAtom(checkpointChangeSetsAtom);

	return (
		<>
			<Banner />
			<div className="w-full bg-slate-50 border-b-[1px] border-border p-2 flex justify-between items-center">
				<div className="flex items-center">
					<img src="/lix.svg" alt="lix logo" className="h-6 w-6" />
					<div className="text-xl font-medium ml-0.5 mt-[1px]">md</div>
				</div>
				<div className="flex-1" />
				<LixMenuDropdown />
			</div>
			<div className='flex-1 flex overflow-hidden'>
				{activeFile ?
					<div className="h-full flex-1 max-w-[calc(100%-600px)]" data-registry="plate">
						{/* <SettingsProvider> */}
						<PlateEditor />
						{/* </SettingsProvider> */}
						<Toaster />
					</div>
					: <div className="h-full flex-1 max-w-[calc(100%-600px)] flex justify-center items-center">
						No file selected
					</div>}
				<Separator orientation="vertical" />
				<div className="h-full w-[600px] flex flex-col relative">
					<div className="px-[10px] pt-[10px] overflow-y-auto">
						{intermediateChanges.length > 0 && (
							<IntermediateCheckpointComponent />
						)}
						{checkpointChangeSets.map((checkpointChangeSet, i) => {
							return (
								<CheckpointComponent
									key={checkpointChangeSet.id}
									checkpointChangeSet={checkpointChangeSet}
									showTopLine={i !== 0 || intermediateChanges.length > 0}
									showBottomLine={i !== checkpointChangeSets.length - 1}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}
