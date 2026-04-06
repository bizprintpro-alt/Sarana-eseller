import { NextResponse } from 'next/server'
import { getVatMonitorData } from '@/lib/tax/vatMonitor'

export async function GET() {
  try {
    const data = await getVatMonitorData()
    const stats = {
      vatRegistered: data.filter((d) => d.vatStatus === 'exceeded').length,
      warning: data.filter((d) => d.vatStatus === 'warning').length,
      exceeded: data.filter((d) => d.vatStatus === 'exceeded').length,
    }
    return NextResponse.json({ shops: data, stats })
  } catch (error) {
    return NextResponse.json({ shops: [], stats: { vatRegistered: 0, warning: 0, exceeded: 0 } })
  }
}
