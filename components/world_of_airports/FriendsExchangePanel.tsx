"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FriendEntry = {
	id: string;
	gameId: string;
	nickname: string;
	createdAt: string;
};

type ApiListResponse = { friends: FriendEntry[] };
type ApiCreateResponse = { friend: FriendEntry; message: string };
type ApiErrorResponse = { error?: string };

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
	year: "numeric",
	month: "short",
	day: "2-digit",
});

export default function FriendsExchangePanel() {
	const [nickname, setNickname] = useState("");
	const [gameId, setGameId] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [friends, setFriends] = useState<FriendEntry[]>([]);

	useEffect(() => {
		let mounted = true;
		const loadFriends = async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/world-of-airports/friends", {
					cache: "no-store",
				});
				const data = (await res.json()) as ApiListResponse;
				if (mounted) {
					setFriends(data.friends || []);
					setError(null);
				}
			} catch {
				if (mounted) {
					setError("Failed to load friend list. Please refresh.");
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		loadFriends();
		return () => {
			mounted = false;
		};
	}, []);

	const canSubmit = useMemo(
		() => nickname.trim().length > 0 && gameId.trim().length > 0,
		[nickname, gameId]
	);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit || submitting) return;

		try {
			setSubmitting(true);
			setError(null);
			setMessage(null);

			const res = await fetch("/api/world-of-airports/friends", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nickname: nickname.trim(),
					gameId: gameId.trim(),
				}),
			});
			const payload = (await res.json()) as
				| ApiCreateResponse
				| ApiErrorResponse;

			if (!res.ok) {
				setError(
					(payload as ApiErrorResponse).error ??
						"Unable to save your ID right now."
				);
				return;
			}

			if (!("friend" in payload)) {
				setError("Unable to save your ID right now.");
				return;
			}

			setFriends((prev) => [payload.friend, ...prev]);
			setMessage("Thanks! Your ID has been saved.");
			setNickname("");
			setGameId("");
		} catch {
			setError("Unable to save your ID right now.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-slate-900">
				Leave Your Friend ID
			</h2>
			<p className="mt-1 text-sm text-slate-600">
				Add your nickname and World of Airports game ID. I will send my
				carriers to you from DragonAir HK.
			</p>

			<form
				onSubmit={onSubmit}
				className="mt-4 space-y-3"
			>
				<div className="space-y-1">
					<label
						htmlFor="friend-nickname"
						className="text-xs font-medium text-slate-700"
					>
						Nickname
					</label>
					<input
						id="friend-nickname"
						value={nickname}
						onChange={(event) => setNickname(event.target.value)}
						className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-teal-200 transition focus:border-teal-500 focus:ring"
						placeholder="e.g. Nick"
						maxLength={32}
					/>
				</div>

				<div className="space-y-1">
					<label
						htmlFor="friend-game-id"
						className="text-xs font-medium text-slate-700"
					>
						Game ID
					</label>
					<input
						id="friend-game-id"
						value={gameId}
						onChange={(event) => setGameId(event.target.value)}
						className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-teal-200 transition focus:border-teal-500 focus:ring"
						placeholder='e.g. CaptainNick'
						maxLength={48}
					/>
				</div>

				<button
					type="submit"
					disabled={!canSubmit || submitting}
					className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{submitting ? "Saving..." : "Save my ID"}
				</button>
			</form>

			{message && (
				<p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
					{message}
				</p>
			)}
			{error && (
				<p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
					{error}
				</p>
			)}

			<div className="mt-5">
				<h3 className="text-sm font-semibold text-slate-900">
					Recent friend IDs
				</h3>
				{loading ? (
					<p className="mt-2 text-sm text-slate-500">Loading...</p>
				) : friends.length === 0 ? (
					<p className="mt-2 text-sm text-slate-500">
						No IDs yet. Be the first one.
					</p>
				) : (
					<div className="mt-2 space-y-2">
						{friends.slice(0, 12).map((friend) => (
							<div
								key={friend.id}
								className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
							>
								<p className="text-sm font-medium text-slate-800">
									{friend.nickname}
								</p>
								<p className="text-sm text-slate-600">
									{friend.gameId}
								</p>
								<p className="text-xs text-slate-500">
									Added on{" "}
									{DATE_FORMATTER.format(
										new Date(friend.createdAt)
									)}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
