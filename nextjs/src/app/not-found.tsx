import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 72, fontWeight: 900, margin: 0, color: '#E8242C' }}>404</h1>
      <p style={{ color: '#666', fontSize: 16, margin: 0 }}>
        Хайсан хуудас олдсонгүй
      </p>
      <p style={{ color: '#999', fontSize: 13, maxWidth: 400, margin: 0 }}>
        Линк хуучирсан эсвэл буруу бичигдсэн байж магадгүй.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Link
          href="/"
          style={{
            background: '#1B3A5C',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Нүүр хуудас
        </Link>
        <Link
          href="/feed"
          style={{
            background: '#fff',
            color: '#1B3A5C',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            border: '1px solid #1B3A5C',
          }}
        >
          Зарын булан
        </Link>
      </div>
    </main>
  );
}
