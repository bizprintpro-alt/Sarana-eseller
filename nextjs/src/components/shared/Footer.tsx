import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#07080D] py-16 px-[6%] border-t border-white/[.06]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
          <div>
            <div className="text-xl font-black text-white mb-2">
              eseller<em className="text-[#CC0000] not-italic">.mn</em>
            </div>
            <p className="text-sm text-white/30">Монголын борлуулагчдын дижитал экосистем</p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/store" className="text-white/40 no-underline hover:text-white transition">Дэлгүүр</Link>
            <Link href="/login" className="text-white/40 no-underline hover:text-white transition">Нэвтрэх</Link>
            <Link href="/login#register" className="text-white/40 no-underline hover:text-white transition">Бүртгүүлэх</Link>
            <Link href="#" className="text-white/40 no-underline hover:text-white transition">Холбоо барих</Link>
          </div>
        </div>
        <div className="border-t border-white/[.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">&copy; 2026 eseller.mn — Бүх эрх хуулиар хамгаалагдсан</p>
          <div className="flex gap-6 text-xs">
            <Link href="#" className="text-white/20 no-underline hover:text-white/40 transition">Нөхцөл</Link>
            <Link href="#" className="text-white/20 no-underline hover:text-white/40 transition">Нууцлал</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
