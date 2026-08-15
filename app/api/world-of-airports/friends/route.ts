import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type FriendEntry = {
	id: string;
	gameId: string;
	nickname: string;
	airportCode: string;
	createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data", "runtime", "world-of-airports");
const DATA_FILE = path.join(DATA_DIR, "friends.json");

const MAX_NICKNAME_LENGTH = 32;
const MAX_GAME_ID_LENGTH = 48;
const AIRPORT_CODE_PATTERN = /^[A-Z]{3}$/;

function normalizeInput(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function validateNickname(nickname: string): string | null {
	if (!nickname) return "Nickname is required.";
	if (nickname.length > MAX_NICKNAME_LENGTH) {
		return `Nickname must be <= ${MAX_NICKNAME_LENGTH} characters.`;
	}
	return null;
}

function validateGameId(gameId: string): string | null {
	if (!gameId) return "Game ID is required.";
	if (gameId.length > MAX_GAME_ID_LENGTH) {
		return `Game ID must be <= ${MAX_GAME_ID_LENGTH} characters.`;
	}
	if (!/^[A-Za-z0-9 _-]+$/.test(gameId)) {
		return "Game ID can only contain letters, numbers, spaces, hyphen and underscore.";
	}
	return null;
}

async function ensureDataFile() {
	await fs.mkdir(DATA_DIR, { recursive: true });
	try {
		await fs.access(DATA_FILE);
	} catch {
		await fs.writeFile(DATA_FILE, "[]\n", "utf8");
	}
}

async function readFriends(): Promise<FriendEntry[]> {
	await ensureDataFile();
	const raw = await fs.readFile(DATA_FILE, "utf8");
	try {
		const parsed = JSON.parse(raw) as FriendEntry[];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(entry) =>
				entry &&
				typeof entry.id === "string" &&
				typeof entry.nickname === "string" &&
				typeof entry.gameId === "string" &&
				typeof entry.airportCode === "string" &&
				typeof entry.createdAt === "string",
		);
	} catch {
		return [];
	}
}

async function writeFriends(friends: FriendEntry[]) {
	await fs.writeFile(DATA_FILE, `${JSON.stringify(friends, null, 2)}\n`, "utf8");
}

export async function GET() {
	try {
		const friends = await readFriends();
		const sorted = friends.sort((a, b) =>
			a.createdAt < b.createdAt ? 1 : -1
		);
		return NextResponse.json({ friends: sorted });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to load friends.";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as {
			nickname?: unknown;
			gameId?: unknown;
			airportCode?: unknown;
		};
		const nickname = normalizeInput(payload.nickname);
		const gameId = normalizeInput(payload.gameId);
		const airportCode = normalizeInput(payload.airportCode).toUpperCase();

		const nicknameError = validateNickname(nickname);
		if (nicknameError) {
			return NextResponse.json({ error: nicknameError }, { status: 400 });
		}

		const gameIdError = validateGameId(gameId);
		if (gameIdError) {
			return NextResponse.json({ error: gameIdError }, { status: 400 });
		}
		if (!AIRPORT_CODE_PATTERN.test(airportCode)) {
			return NextResponse.json(
				{ error: "Airport Code must be a three-letter IATA code." },
				{ status: 400 },
			);
		}

		const friends = await readFriends();
		const newEntry: FriendEntry = {
			id: crypto.randomUUID(),
			nickname,
			gameId,
			airportCode,
			createdAt: new Date().toISOString(),
		};

		friends.unshift(newEntry);
		await writeFriends(friends.slice(0, 200));

		return NextResponse.json(
			{
				friend: newEntry,
				message: "Friend ID saved.",
			},
			{ status: 201 }
		);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to save friend ID.";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
