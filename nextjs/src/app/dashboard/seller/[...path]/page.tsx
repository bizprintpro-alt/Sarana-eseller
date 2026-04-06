import { redirect } from 'next/navigation'

export default function SellerCatchAll({
  params,
}: {
  params: { path: string[] }
}) {
  redirect('/dashboard/store/' + params.path.join('/'))
}
