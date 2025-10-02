import { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import { Tag } from "./Tag";
import { Container } from "./Container";
import { Button } from "./Button";

export function CabinTemplate({
	name,
	gradient,
	intro,
	highlights,
	specs,
	amenities,
	ctaLabel = "Search flights",
	extra,
}: {
	name: string;
	gradient: string; // tailwind gradient classes e.g. "from-... to-..."
	intro: string;
	highlights: string[];
	specs?: { label: string; value: string }[];
	amenities: string[];
	ctaLabel?: string;
	extra?: ReactNode; // slot for custom sections
}) {
	return (
		<main className="pb-24">
			<Hero
				name={name}
				gradient={gradient}
				intro={intro}
				highlights={highlights}
			/>
			<Container className="mt-10 space-y-8">
				{specs && specs.length > 0 ? <Specs specs={specs} /> : null}
				<Amenities items={amenities} />
				{extra}
				<CTA label={ctaLabel} />
			</Container>
		</main>
	);
}

function Hero({
	name,
	gradient,
	intro,
	highlights,
}: {
	name: string;
	gradient: string;
	intro: string;
	highlights: string[];
}) {
	return (
		<section className="relative">
			<div className={`h-48 bg-gradient-to-br ${gradient}`} />
			<div className="absolute inset-0 flex items-end">
				<Container>
					<div className="-mb-10">
						<div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-4">
							<h1 className="text-xl font-semibold">
								{name} Class
							</h1>
							<p className="text-sm text-neutral-600 mt-1">
								{intro}
							</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{highlights.map((h) => (
									<Tag key={h}>{h}</Tag>
								))}
							</div>
						</div>
					</div>
				</Container>
			</div>
		</section>
	);
}

function Specs({ specs }: { specs: { label: string; value: string }[] }) {
	return (
		<section>
			<SectionHeader title="Seat & comfort" />
			<div className="grid grid-cols-2 gap-3">
				{specs.map((s) => (
					<div
						key={s.label}
						className="bg-white rounded-xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
					>
						<p className="text-xs text-neutral-500">{s.label}</p>
						<p className="text-base font-semibold mt-0.5">
							{s.value}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

function Amenities({ items }: { items: string[] }) {
	return (
		<section>
			<SectionHeader title="Amenities" />
			<div className="flex flex-wrap gap-2">
				{items.map((a) => (
					<span
						key={a}
						className="text-xs text-neutral-700 bg-[#F5F7F6] px-3 py-1 rounded-full"
					>
						{a}
					</span>
				))}
			</div>
		</section>
	);
}

function CTA({ label }: { label: string }) {
	return (
		<section className="sticky bottom-6 z-10">
			<div className="mx-auto max-w-screen-md px-4">
				<div className="bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-3 flex items-center gap-3">
					<div className="flex-1">
						<p className="text-sm font-medium">
							Ready to experience it?
						</p>
						<p className="text-xs text-neutral-600">
							Find availability on your route.
						</p>
					</div>
					<Button size="lg">{label}</Button>
				</div>
			</div>
		</section>
	);
}
