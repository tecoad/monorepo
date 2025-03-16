import { type LixPlugin } from "@lix-js/sdk";
import { applyChanges } from "./applyChanges.js";
import { detectChanges } from "./detectChanges.js";

export const plugin: LixPlugin = {
	key: "plugin_prosemirror",
	detectChangesGlob: "**/prosemirror.json",
	detectChanges,
	applyChanges,
};

