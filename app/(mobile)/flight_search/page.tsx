// app/flight_search/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  MapPinIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { FlightData, FlightSearchResult } from "@/types/Flight";

/* ===================== Time/Performance Helpers ===================== */

const parseTimeToMinutes = (t: string | undefined | null): number | null => {
  if (!t) return null;
  const s = String(t).trim();
  if (s === "--" || s === "-") return null;

  // 24h: 13:45
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = Number(m24[1]);
    const m = Number(m24[2]);
    if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
    return h * 60 + m;
  }

  // 12h: 1:45 PM
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = Number(m12[1]);
    const m = Number(m12[2]);
    const period = m12[3].toUpperCase();
    if (h === 12) h = 0;
    if (period === "PM") h += 12;
    if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
    return h * 60 + m;
  }

  return null;
};

type PerfLevel = "good" | "warn" | "bad" | "neutral";

// Use sta + ataStr to compute diff and level
const computeArrivalPerformance = (
  sta: string,
  ataStr?: string | null
): { diffMin: number | null; level: PerfLevel } => {
  const sched = parseTimeToMinutes(sta);
  const actualRaw = parseTimeToMinutes(ataStr ?? "");
  if (sched === null || actualRaw === null) {
    return { diffMin: null, level: "neutral" };
  }
  let actual = actualRaw;
  // handle next-day roll-over (ATA earlier than STA by > 12h)
  if (actual < sched - 720) actual += 1440;
  const diff = actual - sched; // + late, - early
  if (diff <= 15) return { diffMin: diff, level: "good" };
  if (diff <= 30) return { diffMin: diff, level: "warn" };
  return { diffMin: diff, level: "bad" };
};

// extract an ATA from status string when it says "Landed hh:mm" or "Delayed hh:mm"
const ataFromStatus = (status?: string | null): string | null => {
  if (!status) return null;
  const s = status.toLowerCase();
  // landed 15:42
  const m1 = status.match(/landed\s+(\d{1,2}):(\d{2})/i);
  if (m1) return `${m1[1]}:${m1[2]}`;
  // delayed 17:32 could be ETA; treat as arrival for stats if landed time isn't present
  const m2 = status.match(/delayed\s+(\d{1,2}):(\d{2})/i);
  if (m2) return `${m2[1]}:${m2[2]}`;
  // estimated 15:45 (fallback)
  const m3 = status.match(/estimated\s+(\d{1,2}):(\d{2})/i);
  if (m3) return `${m3[1]}:${m3[2]}`;
  return null;
};

const statusAccentClass = (status: string, sta: string, ata?: string | null): string => {
  const s = status.toLowerCase();
  if (s.includes("scheduled")) return "bg-gray-400";
  if (s.includes("cancelled")) return "bg-red-500";
  if (s.includes("delayed")) return "bg-amber-500";
  if (s.includes("landed")) {
    const ataGuess = ataFromStatus(status) ?? ata ?? undefined;
    const p = computeArrivalPerformance(sta, ataGuess);
    if (p.level === "good") return "bg-green-500";
    if (p.level === "warn") return "bg-amber-500";
    if (p.level === "bad") return "bg-red-500";
    return "bg-gray-400";
  }
  if (s.includes("estimated")) return "bg-amber-500";
  return "bg-gray-400";
};

const statusBadgeColor = (status: string, sta: string, ata?: string | null) => {
  const s = status.toLowerCase();
  if (s.includes("cancelled")) return "bg-red-100 text-red-800 border-red-200";
  if (s.includes("scheduled")) return "bg-gray-100 text-gray-800 border-gray-200";
  if (s.includes("delayed")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (s.includes("landed")) {
    const ataGuess = ataFromStatus(status) ?? ata ?? undefined;
    const p = computeArrivalPerformance(sta, ataGuess);
    if (p.level === "good") return "bg-green-100 text-green-800 border-green-200";
    if (p.level === "warn") return "bg-amber-100 text-amber-800 border-amber-200";
    if (p.level === "bad") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  }
  if (s.includes("estimated")) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

/* ===================== Date Helpers (2-month window) ===================== */

const parseFlightDate = (d: string): Date | null => {
  const ts = Date.parse(d); // expecting YYYY-MM-DD (adjust if needed)
  return Number.isNaN(ts) ? null : new Date(ts);
};

const getWindowBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/* ===================== Aircraft parsing ===================== */

// Extract aircraft_type by stripping any registration suffix in parentheses.
// "A35K (B-LXN)" -> "A35K"; "351" stays "351".
const extractAircraftType = (s?: string | null): string => {
  if (!s) return "";
  return s.replace(/\s*\([^)]*\)\s*$/, "").trim();
};

/* ===================== Component ===================== */

export default function FlightSearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<FlightSearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleSearch = async (): Promise<void> => {
    if (!searchQuery.trim()) {
      setError("Please enter a flight number");
      return;
    }
    setLoading(true);
    setError("");
    setSearchResult(null);
    try {
      const response = await fetch(`/api/flight/${searchQuery.trim()}`);
      if (!response.ok) {
        setError(
          response.status === 404
            ? "Flight not found. Please check the flight number and try again."
            : "An error occurred while searching. Please try again."
        );
        return;
      }
      const data: FlightSearchResult = await response.json();
      setSearchResult(data);
    } catch {
      setError("Failed to search for flight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSearch();
  };

  const handleQuickSearch = async (flightNumber: string): Promise<void> => {
    setSearchQuery(flightNumber);
    setLoading(true);
    setError("");
    setSearchResult(null);
    try {
      const response = await fetch(`/api/flight/${flightNumber}`);
      if (!response.ok) {
        setError(
          response.status === 404
            ? "Flight not found. Please check the flight number and try again."
            : "An error occurred while searching. Please try again."
        );
        return;
      }
      const data: FlightSearchResult = await response.json();
      setSearchResult(data);
    } catch {
      setError("Failed to search for flight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== Filter to previous full month + current month ===== */
  const filteredFlights = useMemo<FlightData[]>(() => {
    if (!searchResult?.flights?.length) return [];
    const { start, end } = getWindowBounds();
    return searchResult.flights.filter((f) => {
      const d = parseFlightDate(f.date);
      if (!d) return false;
      return d >= start && d <= end;
    });
  }, [searchResult]);

  /* ===== Flown flights only (exclude Scheduled) ===== */
  const flownFlights = useMemo<FlightData[]>(() => {
    return filteredFlights.filter(
      (f) => !f.status.toLowerCase().includes("scheduled")
    );
  }, [filteredFlights]);

  /* ===== Stats from flownFlights only ===== */
  const totalFlights = flownFlights.length;

  // Delayed count fix: use STA + best-available ATA (status "Landed HH:MM" > ata field > delayed/estimated time),
  // and only count when we can compute a diff. Exclude Scheduled already above.
  const delayedCount = useMemo(() => {
    let count = 0;
    for (const f of flownFlights) {
      // Try to extract ATA from status first (if "Landed 15:36"), else use f.ata, else delayed/estimated time.
      const ataGuess = ataFromStatus(f.status) ?? (f.ata && f.ata !== "--" ? f.ata : null);
      const perf = computeArrivalPerformance(f.sta, ataGuess ?? undefined);
      if (perf.diffMin !== null && (perf.level === "warn" || perf.level === "bad")) {
        count++;
      }
    }
    return count;
  }, [flownFlights]);

  /* ===== Top 2 aircraft types (from flownFlights, type-only) ===== */
  const topAircraft = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of flownFlights) {
      const type = extractAircraftType(f.aircraft);
      if (!type) continue;
      map.set(type, (map.get(type) || 0) + 1);
    }
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 2); // [ [type, count], ... ]
  }, [flownFlights]);

  /* ===== Premium unlock count (difference between full API vs filtered-visible) ===== */
  const extraCount = Math.max(
    0,
    (searchResult?.flights?.length ?? 0) - filteredFlights.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
          <div className="relative p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/15 backdrop-blur">
                  <PaperAirplaneIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Flight Explorer
                  </h1>
                   <p className="text-white/90 text-sm mt-1">
                    Search flight history and performance
                  </p>
                </div>
              </div>

              <div className="w-full md:w-[460px]">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-2.5 ring-1 ring-white/20">
                  <div className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-white/80 ml-2" />
                    <Input
                      placeholder="Enter flight number"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      className="bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:outline-none"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-white text-indigo-700 hover:bg-slate-100"
                    >
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  {["CX506", "CX596", "CX598", "CX502", "CX564"].map((f) => (
                    <button
                      key={f}
                      onClick={() => handleQuickSearch(f)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition"
                    >
                      {f}
                    </button>
                  ))}
                  <span className="px-2 py-1 rounded-lg bg-white/10">Press Enter ↵</span>
                  <span className="px-2 py-1 rounded-lg bg-white/10">Only Japan routes are supported currently</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4">
                <Alert className="border-white/30 bg-white/15 text-white">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {searchResult && (
          <div className="mt-10 space-y-8">
            {/* Summary header */}
            <Card className="shadow-xl border-0 overflow-hidden py-0">
              <div className="p-6 md:p-8 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <PaperAirplaneIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold">
                        {searchResult.flightNumber}
                      </h2>
                    </div>
                  </div>
                  {/* Badge shows visible records in table (filtered window) */}
                  <Badge className="bg-white/20 text-white border-white/30 text-base md:text-lg px-4 md:px-5 py-1.5">
                    {filteredFlights.length} Records
                  </Badge>
                </div>

                {/* Quick facts row */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CalendarDaysIcon className="h-5 w-5" />
                      <div>
                        <p className="text-white/80 text-sm">Latest Flight</p>
                        <p className="text-xl font-semibold">{filteredFlights[0]?.date || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5" />
                      <div>
                        <p className="text-white/80 text-sm">Route</p>
                        <p className="text-xl font-semibold">
                          {filteredFlights[0]?.from} → {filteredFlights[0]?.to}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5" />
                      <div>
                        <p className="text-white/80 text-sm">Scheduled Departure</p>
                        <p className="text-xl font-semibold">{filteredFlights[0]?.std || "--"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5" />
                      <div>
                        <p className="text-white/80 text-sm">Scheduled Arrival</p>
                        <p className="text-xl font-semibold">{filteredFlights[0]?.sta || "--"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Slim Stats: only Total (flown) + Delayed (flown) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-blue-700">
                        TOTAL FLOWN (PAST 2 MONTHS)
                      </p>
                      <p className="text-4xl font-extrabold mt-1 text-gray-900">{totalFlights}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                      <PaperAirplaneIcon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/80">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-amber-700">
                        DELAYED (&gt;15M)
                      </p>
                      <p className="text-4xl font-extrabold mt-1 text-gray-900">{Math.round(delayedCount/totalFlights * 100) + "% (" + delayedCount + "/" + totalFlights + ")"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                      <ClockIcon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Likely Aircraft Types (Top 2) - redesigned */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-50 to-fuchsia-50">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
                    <SparklesIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Likely aircraft types for this route
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Based on flown records in the last 2 months, your flight is most often operated by:
                    </p>

                    {/* Chips moved below sentence; pills contain the type, count is a small badge to the right */}
                    <div className="mt-3 flex flex-wrap gap-3">
                      {topAircraft.length > 0 ? (
                        topAircraft.map(([type, count]) => (
                          <div key={type} className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-white text-gray-900 px-3 py-1 shadow-sm ring-1 ring-gray-200 font-semibold">
                              {type}
                            </span>
                            <span className="text-xs text-gray-600 px-2 py-0.5 rounded-md bg-white ring-1 ring-gray-200">
                              ×{count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-white text-gray-500 ring-1 ring-gray-200">
                          Not enough data
                        </div>
                      )}
                    </div>

                    {topAircraft.length >= 1 && (
                      <p className="mt-3 text-xs text-gray-600">
                        Hint: There’s a high chance your upcoming flight uses{" "}
                        {topAircraft.map(([t], i) => (i === 1 ? ` or ${t}` : t)).join("")}.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History Table */}
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl flex items-center font-semibold">
                    <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Flight History (Latest 2 Months)
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-[880px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 sticky top-0 z-10">
                          <TableHead className="py-3 pl-5 text-gray-600 font-medium">Date</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium">From</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium">To</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium text-center">Aircraft</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium text-center">Flight Time</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium text-center">STD</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium text-center">ATD</TableHead>
                          <TableHead className="py-3 text-gray-600 font-medium text-center">STA</TableHead>
                          <TableHead className="py-3 pr-5 text-gray-600 font-medium">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFlights.map((f: FlightData, i: number) => {
                          const accent = statusAccentClass(f.status, f.sta, f.ata);
                          const badgeClass = statusBadgeColor(f.status, f.sta, f.ata);

                          return (
                            <TableRow
                              key={`${f.date}-${i}`}
                              className="group border-b last:border-b-0 border-gray-100 hover:bg-blue-50/40 transition-colors"
                            >
                              <TableCell className="py-3 pl-5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-4 w-1 rounded-sm bg-gray-300 group-hover:bg-blue-500 transition-colors" />
                                  <span className="text-gray-900">{f.date}</span>
                                </div>
                              </TableCell>

                              <TableCell className="py-3">
                                <span className="text-gray-800">{f.from}</span>
                              </TableCell>

                              <TableCell className="py-3">
                                <span className="text-gray-800">{f.to}</span>
                              </TableCell>

                              <TableCell className="py-3 text-center">
                                <span className="font-mono text-gray-800">{f.aircraft || "--"}</span>
                              </TableCell>

                              <TableCell className="py-3 text-center">
                                {f.flightTime !== "--" ? (
                                  <span className="inline-flex items-center rounded-md px-2 py-0.5 border text-xs font-mono text-gray-700 border-gray-200 bg-white">
                                    {f.flightTime}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">--</span>
                                )}
                              </TableCell>

                              <TableCell className="py-3 text-center">
                                <span className="font-mono font-semibold text-blue-700">{f.std}</span>
                              </TableCell>

                              <TableCell className="py-3 text-center">
                                {f.atd !== "--" ? (
                                  <span className="font-mono text-gray-700">{f.atd}</span>
                                ) : (
                                  <span className="text-gray-400">--</span>
                                )}
                              </TableCell>

                              <TableCell className="py-3 text-center">
                                <span className="font-mono text-gray-700">{f.sta}</span>
                              </TableCell>

                              <TableCell className="py-3 pr-5">
                                <div className="flex items-center gap-3">
                                  <span className={`inline-block h-4 w-1 rounded ${accent}`} />
                                  <Badge className={`border ${badgeClass} text-xs`}>{f.status}</Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {filteredFlights.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="py-10 text-center text-gray-500">
                              No records in the current + previous month window.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Unlock Block */}
            {extraCount > 0 && (
              <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                        <SparklesIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Unlock {extraCount} more {extraCount === 1 ? "record" : "records"} with Premium
                        </h3>
                        <p className="text-gray-600">
                          You’re viewing {filteredFlights.length} of {searchResult?.flights?.length ?? 0} records for this flight.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow">
                        Upgrade to Premium
                      </Button>
                      <div className="hidden sm:flex items-center text-xs text-gray-600 gap-1">
                        <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                        Cancel anytime
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Column guide floating button */}
            <div className="fixed bottom-6 right-6 z-50">
              <div className="relative">
                {showHelp && (
                  <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-2xl border p-4 mb-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Column Guide</h3>
                      <button
                        onClick={() => setShowHelp(false)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close help"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="font-medium text-gray-700">STD</span>
                        <span className="text-gray-600">Scheduled Time of Departure</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="font-medium text-gray-700">ATD</span>
                        <span className="text-gray-600">Actual Time of Departure</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="font-medium text-gray-700">STA</span>
                        <span className="text-gray-600">Scheduled Time of Arrival</span>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowHelp((v) => !v)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
                  aria-label="Toggle column guide"
                >
                  <QuestionMarkCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}