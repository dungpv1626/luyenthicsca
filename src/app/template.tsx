/** Chuyển trang mượt: mỗi lần điều hướng nội dung hiện lên nhẹ nhàng. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
