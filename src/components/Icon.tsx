const P: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  test: "M9 3h6v3H9z M7 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2 M8 12h8 M8 16h5",
  pencil: "M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  sparkles: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 3v4 M21 5h-4",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6",
  school: "M22 10 12 5 2 10l10 5z M6 12v5c3 2 9 2 12 0v-5 M22 10v6",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5V5a2 2 0 0 1 2-2h14v14H6.5A2.5 2.5 0 0 0 4 19.5z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  x: "M18 6 6 18 M6 6l12 12",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  chart: "M3 3v18h18 M7 14l4-4 3 3 5-6",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.2 13.9 7 23l5-3 5 3-1.2-9.1",
  check: "M20 6 9 17l-5-5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  map: "M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  play: "M6 4l14 8-14 8z",
  send: "M22 2 11 13 M22 2l-7 20-4-9-9-4z",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
};

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof P | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {(P[name] ?? "").split(" M").map((d, i) => <path key={i} d={(i ? "M" : "") + d} />)}
    </svg>
  );
}
