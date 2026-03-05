import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>页面未找到 / Page Not Found</p>
      <Link href="/">返回首页</Link>
    </div>
  );
}
