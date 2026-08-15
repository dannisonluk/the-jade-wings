"use client";

import { FormEvent, useMemo, useState } from "react";

type ApiCreateResponse = { message: string };
type ApiErrorResponse = { error?: string };

export default function FriendsExchangePanel() {
	const [nickname, setNickname] = useState("");
	const [gameId, setGameId] = useState("");
	const [airportCode, setAirportCode] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const canSubmit = useMemo(
		() =>
			nickname.trim().length > 0 &&
			gameId.trim().length > 0 &&
			airportCode.trim().length > 0,
		[nickname, gameId, airportCode],
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
					airportCode: airportCode.trim().toUpperCase(),
				}),
			});
			const payload = (await res.json()) as
				| ApiCreateResponse
				| ApiErrorResponse;

			if (!res.ok) {
				setError(
					(payload as ApiErrorResponse).error ??
						"Unable to save your ID right now.",
				);
				return;
			}

			setMessage("Thanks! Your ID has been saved.");
			setNickname("");
			setGameId("");
			setAirportCode("");
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
						placeholder="e.g. CaptainNick"
						maxLength={48}
					/>
				</div>

				<div className="space-y-1">
					<label
						htmlFor="friend-airport-code"
						className="text-xs font-medium text-slate-700"
					>
						Airport Code
					</label>
					<input
						id="friend-airport-code"
						value={airportCode}
						onChange={(event) => setAirportCode(event.target.value.toUpperCase())}
						className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-teal-200 transition focus:border-teal-500 focus:ring"
						placeholder="e.g. HKG"
						maxLength={3}
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
		</section>
	);
}
