const paths = {
  planet: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM3 16l18-8M2 18l20-12",
  people: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3",
  ship: "m12 2 8 19-8-4-8 4L12 2Zm0 6v9M2 10l3 2M22 10l-3 2",
  vehicle: "M3 8h18v9H3V8Zm3 9v3m12-3v3M7 8l2-4h6l2 4M7 12h2m6 0h2",
  species: "M6 3h12l3 8-4 9-5 3-5-3-4-9 3-8Zm1 7 3 2m7-2-3 2m-4 5h4",
  film: "M3 3h18v18H3V3Zm4 0v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4",
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 7 7",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  close: "m5 5 14 14M19 5 5 19",
  back: "M20 12H4m6-6-6 6 6 6",
  spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  alert: "m12 2 10 19H2L12 2Zm0 6v6m0 3v1",
  reset: "M4 9a8 8 0 1 1 0 6M4 3v6h6",
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
