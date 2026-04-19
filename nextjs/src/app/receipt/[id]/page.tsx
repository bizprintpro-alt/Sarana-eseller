'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ReceiptItem {
  name: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

interface Receipt {
  id: string;
  billId: string;
  qrData: string;
  lottery: string | null;
  amount: number;
  vatAmount: number;
  cityTax: number;
  buyerTIN: string | null;
  items: ReceiptItem[];
  status: string;
  createdAt: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}/receipt`)
      .then((r) => r.json())
      .then((body) => {
        // Envelope: { success: true, data: Receipt } | { success: false, error }
        // Legacy:    Receipt | { error }
        if (body?.success === false) throw new Error(body.error || 'Баримт олдсонгүй');
        const data = body?.success === true ? body.data : body;
        if (data?.error) throw new Error(data.error);
        setReceipt(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (!receipt) return;
    const text = `еБаримт: ${receipt.billId}\nСугалаа: ${receipt.lottery}\nДүн: ${receipt.amount.toLocaleString()}₮`;
    if (navigator.share) {
      await navigator.share({ title: 'еБаримт баримт', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Хуулагдлаа!');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loading}>Уншиж байна...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.error}>{error || 'Баримт олдсонгүй'}</p>
        </div>
      </div>
    );
  }

  const subtotal = receipt.amount - receipt.vatAmount - receipt.cityTax;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>еБаримт</h1>
          <p style={styles.subtitle}>Татварын баримт</p>
        </div>

        {/* Bill ID */}
        <div style={styles.section}>
          <div style={styles.row}>
            <span style={styles.label}>Баримтын дугаар</span>
            <span style={styles.value}>{receipt.billId}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Огноо</span>
            <span style={styles.value}>
              {new Date(receipt.createdAt).toLocaleDateString('mn-MN')}
            </span>
          </div>
          {receipt.buyerTIN && (
            <div style={styles.row}>
              <span style={styles.label}>ТТД</span>
              <span style={styles.value}>{receipt.buyerTIN}</span>
            </div>
          )}
          <div style={styles.row}>
            <span style={styles.label}>Төлөв</span>
            <span style={{
              ...styles.value,
              color: receipt.status === 'SUCCESS' ? '#22c55e' : '#f59e0b',
            }}>
              {receipt.status === 'SUCCESS' ? 'Амжилттай' : receipt.status}
            </span>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div style={styles.qrSection}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={styles.qr}>
            <rect width="120" height="120" fill="#ffffff" rx="8" />
            <rect x="10" y="10" width="30" height="30" fill="#1a1a2e" />
            <rect x="80" y="10" width="30" height="30" fill="#1a1a2e" />
            <rect x="10" y="80" width="30" height="30" fill="#1a1a2e" />
            <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
            <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
            <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
            <rect x="20" y="20" width="10" height="10" fill="#1a1a2e" />
            <rect x="90" y="20" width="10" height="10" fill="#1a1a2e" />
            <rect x="20" y="90" width="10" height="10" fill="#1a1a2e" />
            <rect x="50" y="10" width="8" height="8" fill="#1a1a2e" />
            <rect x="50" y="25" width="8" height="8" fill="#1a1a2e" />
            <rect x="50" y="50" width="8" height="8" fill="#1a1a2e" />
            <rect x="62" y="50" width="8" height="8" fill="#1a1a2e" />
            <rect x="50" y="62" width="8" height="8" fill="#1a1a2e" />
            <rect x="74" y="74" width="8" height="8" fill="#1a1a2e" />
            <rect x="86" y="62" width="8" height="8" fill="#1a1a2e" />
            <rect x="98" y="86" width="8" height="8" fill="#1a1a2e" />
            <rect x="50" y="86" width="8" height="8" fill="#1a1a2e" />
            <rect x="62" y="74" width="8" height="8" fill="#1a1a2e" />
          </svg>
          <p style={styles.qrHint}>QR кодыг уншуулна уу</p>
        </div>

        {/* Lottery */}
        {receipt.lottery && (
          <div style={styles.lotterySection}>
            <p style={styles.lotteryLabel}>Сугалааны дугаар</p>
            <p style={styles.lotteryNumber}>{receipt.lottery}</p>
          </div>
        )}

        {/* Items */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Барааны жагсаалт</p>
          {receipt.items.map((item, i) => (
            <div key={i} style={styles.itemRow}>
              <div style={{ flex: 1 }}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemQty}>
                  {item.qty} x {item.unitPrice.toLocaleString()}₮
                </p>
              </div>
              <span style={styles.itemTotal}>
                {item.totalPrice.toLocaleString()}₮
              </span>
            </div>
          ))}
        </div>

        {/* Tax breakdown */}
        <div style={styles.taxSection}>
          <div style={styles.row}>
            <span style={styles.label}>Дүн</span>
            <span style={styles.value}>{subtotal.toLocaleString()}₮</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>НӨАТ (10%)</span>
            <span style={styles.value}>{receipt.vatAmount.toLocaleString()}₮</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Хотын татвар (2%)</span>
            <span style={styles.value}>{receipt.cityTax.toLocaleString()}₮</span>
          </div>
          <div style={{ ...styles.row, ...styles.totalRow }}>
            <span style={styles.totalLabel}>Нийт дүн</span>
            <span style={styles.totalValue}>
              {receipt.amount.toLocaleString()}₮
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={handlePrint} style={styles.btnPrimary}>
            Хэвлэх
          </button>
          <button onClick={handleShare} style={styles.btnSecondary}>
            Хуваалцах
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'var(--esl-bg, #0f0f1a)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--esl-card, #1a1a2e)',
    borderRadius: 16,
    padding: 24,
    color: 'var(--esl-text, #e0e0e0)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 20,
    borderBottom: '1px solid var(--esl-border, #2a2a3e)',
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--esl-primary, #4f8cff)',
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--esl-muted, #888)',
    margin: '4px 0 0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--esl-muted, #888)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
  },
  label: {
    fontSize: 14,
    color: 'var(--esl-muted, #999)',
  },
  value: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--esl-text, #e0e0e0)',
  },
  qrSection: {
    textAlign: 'center' as const,
    margin: '20px 0',
  },
  qr: {
    borderRadius: 8,
  },
  qrHint: {
    fontSize: 12,
    color: 'var(--esl-muted, #888)',
    marginTop: 8,
  },
  lotterySection: {
    textAlign: 'center' as const,
    background: 'var(--esl-bg, #0f0f1a)',
    borderRadius: 12,
    padding: '12px 16px',
    marginBottom: 16,
  },
  lotteryLabel: {
    fontSize: 12,
    color: 'var(--esl-muted, #888)',
    margin: 0,
  },
  lotteryNumber: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f59e0b',
    letterSpacing: 2,
    margin: '4px 0 0',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--esl-border, #2a2a3e)',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
  },
  itemQty: {
    fontSize: 12,
    color: 'var(--esl-muted, #888)',
    margin: '2px 0 0',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 600,
  },
  taxSection: {
    borderTop: '1px solid var(--esl-border, #2a2a3e)',
    paddingTop: 12,
    marginBottom: 20,
  },
  totalRow: {
    borderTop: '2px solid var(--esl-primary, #4f8cff)',
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--esl-primary, #4f8cff)',
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    background: 'var(--esl-primary, #4f8cff)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: '1px solid var(--esl-border, #2a2a3e)',
    background: 'transparent',
    color: 'var(--esl-text, #e0e0e0)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center' as const,
    color: 'var(--esl-muted, #888)',
    padding: 40,
  },
  error: {
    textAlign: 'center' as const,
    color: '#ef4444',
    padding: 40,
  },
};
