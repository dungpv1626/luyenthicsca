/** Khung xương hiển thị khi trang đang tải. */
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Đang tải">
      <div className="skeleton h-40 w-full !rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-36" />)}</div>
      <div className="skeleton h-56 w-full" />
    </div>
  );
}
