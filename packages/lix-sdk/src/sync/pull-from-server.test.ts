import { expect, test, vi } from "vitest";
import { createServerApiHandler } from "../server-api-handler/create-server-api-handler.js";
import { createServerApiMemoryStorage } from "../server-api-handler/storage/create-memory-storage.js";
import { openLixInMemory } from "../lix/open-lix-in-memory.js";
import { pullFromServer } from "./pull-from-server.js";
import { mockJsonSnapshot } from "../snapshot/mock-json-snapshot.js";
import type { LixFile } from "../database/schema.js";

test("pull rows of multiple tables from server successfully", async () => {
	const lixOnServer = await openLixInMemory({});

	const lix = await openLixInMemory({ blob: await lixOnServer.toBlob() });

	const { value: id } = await lixOnServer.db
		.selectFrom("key_value")
		.where("key", "=", "lix-id")
		.selectAll()
		.executeTakeFirstOrThrow();

	const storage = createServerApiMemoryStorage();
	const lsaHandler = await createServerApiHandler({ storage });

	global.fetch = vi.fn((request) => lsaHandler(request));

	// insert mock data into server lix
	await lixOnServer.db
		.insertInto("account")
		.values({ id: "account0", name: "test account" })
		.execute();

	await lixOnServer.db
		.insertInto("key_value")
		.values({
			key: "mock-key",
			value: "mock-value",
		})
		.execute();

	// initialize the lix on the server with the mock data
	await lsaHandler(
		new Request("http://localhost:3000/lsa/new-v1", {
			method: "POST",
			body: await lixOnServer.toBlob(),
			headers: {
				"Content-Type": "application/json",
			},
		})
	);

	await pullFromServer({
		id,
		lix,
		serverUrl: "http://localhost:3000",
	});

	// Verify the data is pulled into the local lix
	const account = await lix.db
		.selectFrom("account")
		.where("id", "=", "account0")
		.selectAll()
		.executeTakeFirstOrThrow();

	const mockKey = await lix.db
		.selectFrom("key_value")
		.where("key", "=", "mock-key")
		.selectAll()
		.executeTakeFirstOrThrow();

	expect(account).toEqual({ id: "account0", name: "test account" });
	expect(mockKey).toEqual({ key: "mock-key", value: "mock-value" });
});

test("it handles snapshot.content being json binary", async () => {
	const lixOnServer = await openLixInMemory({});

	const lix = await openLixInMemory({ blob: await lixOnServer.toBlob() });

	const { value: id } = await lixOnServer.db
		.selectFrom("key_value")
		.where("key", "=", "lix-id")
		.selectAll()
		.executeTakeFirstOrThrow();

	const storage = createServerApiMemoryStorage();
	const lsaHandler = await createServerApiHandler({ storage });

	global.fetch = vi.fn((request) => lsaHandler(request));

	const mockSnapshot = mockJsonSnapshot({
		location: "Berlin",
	});

	// insert mock data into server lix
	await lixOnServer.db
		.insertInto("snapshot")
		.values({
			content: mockSnapshot.content,
		})
		.execute();

	// initialize the lix on the server with the mock data
	await lsaHandler(
		new Request("http://localhost:3000/lsa/new-v1", {
			method: "POST",
			body: await lixOnServer.toBlob(),
			headers: {
				"Content-Type": "application/json",
			},
		})
	);

	await pullFromServer({
		id,
		lix,
		serverUrl: "http://localhost:3000",
	});

	// Verify the data is pulled into the local lix
	const snapshots = await lix.db
		.selectFrom("snapshot")
		.where("id", "=", mockSnapshot.id)
		.selectAll()
		.executeTakeFirstOrThrow();

	expect(snapshots).toMatchObject(mockSnapshot);
});

// the table file is not change controlled yet.
// not syncing the data column because most times
//
// (1) https://www.loom.com/share/d4cee5318eb841f7a6c00e05f333e4d6
// (2) https://www.loom.com/share/3e57fba9afde4bbda6bff196b5e7ed58
//
test.skip("it should handle files without syncing the data column", async () => {
	const lixOnServer = await openLixInMemory({});

	const lix = await openLixInMemory({ blob: await lixOnServer.toBlob() });

	const { value: id } = await lixOnServer.db
		.selectFrom("key_value")
		.where("key", "=", "lix-id")
		.selectAll()
		.executeTakeFirstOrThrow();

	const storage = createServerApiMemoryStorage();
	const lsaHandler = await createServerApiHandler({ storage });

	global.fetch = vi.fn((request) => lsaHandler(request));

	const mockFile: LixFile = {
		id: "file0",
		path: "/path.txt",
		data: new TextEncoder().encode("Hello, World!"),
		metadata: {
			mock: "metadata",
		},
	};

	// insert mock data into server lix
	await lixOnServer.db.insertInto("file").values(mockFile).execute();

	// initialize the lix on the server with the mock data
	await lsaHandler(
		new Request("http://localhost:3000/lsa/new", {
			method: "POST",
			body: await lixOnServer.toBlob(),
			headers: {
				"Content-Type": "application/json",
			},
		})
	);

	await pullFromServer({
		id,
		lix,
		serverUrl: "http://localhost:3000",
	});

	// Verify the data is pulled into the local lix
	const snapshots = await lix.db.selectFrom("file").selectAll().execute();

	expect(snapshots).toContainEqual({
		id: mockFile.id,
		metadata: mockFile.metadata,
		path: mockFile.path,
		// empty Uint8Array because we are not syncing the data column
		data: new Uint8Array([]),
	} satisfies LixFile);
});

test("rows changed on the client more recently should not be updated", async () => {
	const lixOnServer = await openLixInMemory({});

	const lix = await openLixInMemory({ blob: await lixOnServer.toBlob() });

	const { value: id } = await lixOnServer.db
		.selectFrom("key_value")
		.where("key", "=", "lix-id")
		.selectAll()
		.executeTakeFirstOrThrow();

	const storage = createServerApiMemoryStorage();
	const lsaHandler = await createServerApiHandler({ storage });

	global.fetch = vi.fn((request) => lsaHandler(request));

	// insert mock data into server lix
	await lixOnServer.db
		.insertInto("account")
		.values({ id: "account0", name: "test account" })
		.execute();

	await lixOnServer.db
		.insertInto("key_value")
		.values({
			key: "mock-key",
			value: "mock-value",
		})
		.execute();

	// let the wall clock move one ms forward
	await new Promise(resolve => setTimeout(resolve, 1));
	// insert mock data into server lix
	await lix.db
		.insertInto("account")
		.values({ id: "account0", name: "test account updated more recently on client" })
		.execute();

	// initialize the lix on the server with the mock data
	await lsaHandler(
		new Request("http://localhost:3000/lsa/new-v1", {
			method: "POST",
			body: await lixOnServer.toBlob(),
			headers: {
				"Content-Type": "application/json",
			},
		})
	);

	await pullFromServer({
		id,
		lix,
		serverUrl: "http://localhost:3000",
	});

	// Verify the data is pulled into the local lix
	const account = await lix.db
		.selectFrom("account")
		.where("id", "=", "account0")
		.selectAll()
		.executeTakeFirstOrThrow();

	// TODO we don't sync tables without row id atm
	// const mockKey = await lix.db
	// 	.selectFrom("key_value")
	// 	.where("key", "=", "mock-key")
	// 	.selectAll()
	// 	.executeTakeFirstOrThrow();

	expect(account).toEqual({ id: "account0", name: "test account updated more recently on client" });

	// expect(mockKey).toEqual({ key: "mock-key", value: "mock-value" });
});


test("rows changed on the server more recently should be updated on the client", async () => {
	const lixOnServer = await openLixInMemory({});

	const lix = await openLixInMemory({ blob: await lixOnServer.toBlob() });

	const { value: id } = await lixOnServer.db
		.selectFrom("key_value")
		.where("key", "=", "lix-id")
		.selectAll()
		.executeTakeFirstOrThrow();

	const storage = createServerApiMemoryStorage();
	const lsaHandler = await createServerApiHandler({ storage });

	global.fetch = vi.fn((request) => lsaHandler(request));

	// insert mock data into server lix
	await lixOnServer.db
		.insertInto("account")
		.values({ id: "account0", name: "test account" })
		.execute();

	await lixOnServer.db
		.insertInto("key_value")
		.values({
			key: "mock-key",
			value: "mock-value",
		})
		.execute();

	// let the wall clock move one ms forward
	await new Promise(resolve => setTimeout(resolve, 1));
	// insert mock data into server lix
	await lix.db
		.insertInto("account")
		.values({ id: "account0", name: "test account updated more recently on client" })
		.execute();

	await new Promise(resolve => setTimeout(resolve, 1));
	await lixOnServer.db
		.updateTable("account")
		.set({ name: "test account updated more recently on the server" }).where("account.id", "=", "account0")
		.execute();

	// initialize the lix on the server with the mock data
	await lsaHandler(
		new Request("http://localhost:3000/lsa/new-v1", {
			method: "POST",
			body: await lixOnServer.toBlob(),
			headers: {
				"Content-Type": "application/json",
			},
		})
	);

	await pullFromServer({
		id,
		lix,
		serverUrl: "http://localhost:3000",
	});

	// Verify the data is pulled into the local lix
	const account = await lix.db
		.selectFrom("account")
		.where("id", "=", "account0")
		.selectAll()
		.executeTakeFirstOrThrow();

	// TODO we don't sync tables without row id atm
	// const mockKey = await lix.db
	// 	.selectFrom("key_value")
	// 	.where("key", "=", "mock-key")
	// 	.selectAll()
	// 	.executeTakeFirstOrThrow();

	expect(account).toEqual({ id: "account0", name: "test account updated more recently on the server"});

	

	// TODO we don't sync tables without row id atm
	// const mockKey = await lix.db
	// 	.selectFrom("key_value")
	// 	.where("key", "=", "mock-key")
	// 	.selectAll()
	// 	.executeTakeFirstOrThrow();

	// expect(mockKey).toEqual({ key: "mock-key", value: "mock-value" });
});

// test("it should handle files without syncing the data column", async () => {
// 	const lix = await openLixInMemory({});

// 	const { value: id } = await lix.db
// 		.selectFrom("key_value")
// 		.where("key", "=", "lix-id")
// 		.selectAll()
// 		.executeTakeFirstOrThrow();

// 	const storage = createServerApiMemoryStorage();
// 	const lsaHandler = await createServerApiHandler({ storage });

// 	global.fetch = vi.fn((request) => lsaHandler(request));

// 	// initialize the lix on the server
// 	await lsaHandler(
// 		new Request("http://localhost:3000/lsa/new", {
// 			method: "POST",
// 			body: await lix.toBlob(),
// 		})
// 	);

// 	// Insert mock file data into the server's storage
// 	await storage.executeSql(
// 		"INSERT INTO file (id, path, data, metadata) VALUES ('file0', '/path.txt', ?, 'mock-metadata')",
// 		[new TextEncoder().encode("Hello, World!")]
// 	);

// 	await pullFromServer({
// 		id,
// 		lix,
// 		serverUrl: "http://localhost:3000",
// 		tableNames: ["file"],
// 	});

// 	// Verify the data is pulled into the local database without the `data` column
// 	const filesInDb = await lix.db.selectFrom("file").selectAll().execute();

// 	expect(filesInDb).toEqual([
// 		{
// 			id: "file0",
// 			path: "/path.txt",
// 			metadata: "mock-metadata",
// 		},
// 	]);
// });
