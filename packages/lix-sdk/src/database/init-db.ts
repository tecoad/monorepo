import { Kysely, ParseJSONResultsPlugin } from "kysely";
import { createDialect, type SqliteDatabase } from "sqlite-wasm-kysely";
import { v7 as uuid_v7 } from "uuid";
import { SerializeJsonPlugin } from "./serialize-json-plugin.js";
import type { LixDatabaseSchema } from "./schema.js";
import { applySchema } from "./apply-schema.js";
import { sha256 } from "js-sha256";
import { validateFilePath } from "../file/validate-file-path.js";
import { JsonbPlugin } from "./helper/jsonbPlugin.js";

export function initDb(args: {
	sqlite: SqliteDatabase;
}): Kysely<LixDatabaseSchema> {
	initFunctions({ sqlite: args.sqlite });
	applySchema({ sqlite: args.sqlite });
	const db = new Kysely<LixDatabaseSchema>({
		dialect: createDialect({
			database: args.sqlite,
		}),
		plugins: [
			new JsonbPlugin({
				database: args.sqlite,
				nonJsonB: {
					file: ["data"],
				},
			}),
		],
	});
	return db;
}

function initFunctions(args: { sqlite: SqliteDatabase }) {
	args.sqlite.createFunction({
		name: "uuid_v7",
		arity: 0,
		xFunc: () => uuid_v7(),
	});

	args.sqlite.createFunction({
		name: "sha256",
		arity: 1,
		xFunc: (_ctx: number, value) => {
			return value ? sha256(value as string) : "no-content";
		},
		deterministic: true,
	});

	args.sqlite.createFunction({
		name: "is_valid_file_path",
		arity: 1,
		xFunc: (_ctx: number, value) => {
			return validateFilePath(value as string) as unknown as string;
		},
		deterministic: true,
	});
}
