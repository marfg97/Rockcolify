import Link from 'next/link'
import { ArrowLeft, Check, Disc3 } from 'lucide-react'

type HostPageProps = {
  params: Promise<{ roomId: string }>
}

export default async function HostPage({ params }: HostPageProps) {
  const { roomId } = await params

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#090a08] px-5 text-[#f5f5ef]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-[#b8ed43]/[0.075] blur-[130px]" />
      <section className="relative w-full max-w-lg rounded-[28px] border border-white/[0.09] bg-[#11120f] p-7 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-[#d4ff4f] text-[#10110d]"><Check size={25} strokeWidth={2.5} /></div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4ff4f]">Room created</p>
        <h1 className="text-3xl font-semibold tracking-[-0.06em]">Your party is live.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/45">This is a preview of your host dashboard. The room is ready for your crew.</p>
        <div className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-white/45"><Disc3 size={15} className="text-[#d4ff4f]" /><span>Mock room ID</span><code className="max-w-[180px] truncate font-mono text-white/75">{roomId}</code></div>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-white/45 transition hover:text-[#d4ff4f]"><ArrowLeft size={14} /> Back to Rockcolify</Link>
      </section>
    </main>
  )
}
