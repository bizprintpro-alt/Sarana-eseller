import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#08090F] py-12 px-[6%] text-center">
      <div className="text-xl font-black text-white mb-3">
        eseller<em className="text-brand not-italic">.mn</em>
      </div>
      <p className="text-sm text-white/25">
        &copy; 2026 eseller.mn — Монголын борлуулагчдын дижитал экосистем
      </p>
      <p className="text-sm text-white/25 mt-1.5">
        Улаанбаатар, Монгол &nbsp;&middot;&nbsp;{' '}
        <Link href="#" className="text-white/25 no-underline hover:text-white/50 transition">
          Холбоо барих
        </Link>{' '}
        &nbsp;&middot;&nbsp;{' '}
        <Link href="#" className="text-white/25 no-underline hover:text-white/50 transition">
          Нөхцөл
        </Link>
      </p>
    </footer>
  );
}
