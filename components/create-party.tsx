'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowLeft, ArrowRight, Check, Copy, Disc3, Headphones, LoaderCircle, Music2, Radio, Sparkles, Volume2, Waves } from 'lucide-react'
import { createMockParty } from '@/lib/mock-party'
import { createClient } from '@/lib/superbase/client'
import { Button } from '@/components/ui/button'

type Party = ReturnType<typeof createMockParty>

export function CreateParty() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [party, setParty] = useState<Party | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleCreateParty() {
    if (isCreating) return
    setIsCreating(true)
    setError('')

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900))
      setParty(createMockParty())
    } catch {
      setError('We couldn’t start your party. Give it another try.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCopyCode() {
    if (!party) return
    try {
      await navigator.clipboard.writeText(party.roomCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Clipboard access isn’t available. You can select and copy the code.')
    }
  }

  async function handleLogin() {
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: [
          'user-read-email',
          'user-read-private',
          'user-read-playback-state',
          'user-modify-playback-state',
          'user-read-currently-playing',
        ].join(' '),
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(`No se pudo conectar con Spotify: ${authError.message}`)
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-[#090a08] text-[#f5f5ef] selection:bg-[#d4ff4f] selection:text-[#10110d]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[34rem] w-[42rem] -translate-x-1/2 rounded-full bg-[#b8ed43]/[0.075] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.17] [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <a href="/" aria-label="Rockcolify home" className="group inline-flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-[#d4ff4f] text-[#10110d] transition-transform group-hover:rotate-[-8deg]"><Waves size={19} strokeWidth={2.6} /></span>
          <span className="text-[18px] font-semibold tracking-[-0.06em]">rockcolify<span className="text-[#d4ff4f]">.</span></span>
        </a>
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-[11px] font-medium tracking-[0.08em] text-white/45 sm:flex">
          <span className="size-1.5 rounded-full bg-[#d4ff4f] shadow-[0_0_10px_#d4ff4f]" />
          YOUR MUSIC. YOUR PEOPLE.
        </div>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center justify-center px-5 pb-14 pt-6 sm:px-10 sm:pb-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_0.88fr] lg:gap-20">
          <div className="mx-auto w-full max-w-[540px] lg:mx-0">
            {party ? (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d4ff4f]/20 bg-[#d4ff4f]/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#d4ff4f]"><Check size={14} /> You’re all set</div>
                <h1 className="text-balance text-[clamp(3rem,8vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.075em]">Your party is<br /><span className="text-[#d4ff4f]">ready to roll.</span></h1>
                <p className="mt-6 max-w-[410px] text-[15px] leading-7 text-white/45">The room is live. Send this code to your friends and let the good tracks take over.</p>
                <div className="mt-8 max-w-[420px] rounded-[22px] border border-white/[0.09] bg-[#11120f] p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35"><span>Party code</span><span className="inline-flex items-center gap-1.5 text-[#d4ff4f]"><span className="size-1.5 rounded-full bg-[#d4ff4f]" /> ROOM OPEN</span></div>
                  <div className="flex items-center justify-between gap-3">
                    <p aria-label={`Room code ${party.roomCode}`} className="font-mono text-[clamp(2.4rem,8vw,3.8rem)] font-bold leading-none tracking-[0.13em] text-white">{party.roomCode}</p>
                    <button type="button" onClick={handleCopyCode} aria-label={copied ? 'Room code copied' : 'Copy room code'} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-xs font-semibold text-white/75 transition hover:border-[#d4ff4f]/40 hover:text-[#d4ff4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4f]">
                      {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-white/35">{error || 'Anyone with the code can join your room.'}</p>
                <button type="button" onClick={() => router.push(`/host/${party.roomId}`)} className="mt-5 inline-flex h-14 w-full max-w-[420px] items-center justify-center gap-2.5 rounded-xl bg-[#d4ff4f] px-6 text-sm font-bold text-[#15170f] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e1ff83] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a08]">
                  Continue to host dashboard <ArrowRight size={17} />
                </button>
                <button type="button" onClick={() => { setParty(null); setError('') }} className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-white/40 transition hover:text-white/75"><ArrowLeft size={14} /> Back</button>
              </div>
            ) : (
              <>
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55"><Sparkles size={13} className="text-[#d4ff4f]" /> The aux is yours</div>
                <h1 className="text-balance text-[clamp(3.5rem,9vw,6.35rem)] font-semibold leading-[0.9] tracking-[-0.08em]">Ready to start<br />your <span className="text-[#d4ff4f]">party?</span></h1>
                <p className="mt-7 max-w-[410px] text-[15px] leading-7 text-white/45 sm:text-base">One room. Everyone&apos;s tracks. No one fighting over the aux. Make a party, share the code, and build the soundtrack together.</p>
                <button type="button" onClick={handleCreateParty} disabled={isCreating} className="group mt-9 inline-flex h-14 w-full max-w-[420px] items-center justify-center gap-3 rounded-xl bg-[#d4ff4f] px-6 text-sm font-bold text-[#15170f] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e1ff83] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a08]">
                  {isCreating ? <><LoaderCircle size={18} className="animate-spin" /> Spinning up your room…</> : <>Create Party <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>}
                </button>
                <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-[#ff9d88]">{error}</p>
                <div className="mt-7 flex items-center gap-3 text-xs text-white/30"><span className="flex -space-x-2"><span className="grid size-7 place-items-center rounded-full border-2 border-[#090a08] bg-[#343829]"><Music2 size={12} /></span><span className="grid size-7 place-items-center rounded-full border-2 border-[#090a08] bg-[#282f25]"><Headphones size={12} /></span><span className="grid size-7 place-items-center rounded-full border-2 border-[#090a08] bg-[#39352a]"><Radio size={12} /></span></span><span>Made for the group chat that has good taste.</span></div>
              </>
            )}
          </div>

          <div aria-hidden="true" className="relative mx-auto hidden aspect-square w-full max-w-[450px] items-center justify-center lg:flex">
            <div className="absolute inset-[7%] rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[17%] rounded-full border border-white/[0.08]" />
            <div className="absolute inset-[28%] rounded-full border border-[#d4ff4f]/[0.12]" />
            <div className="absolute inset-[10%] animate-[spin_34s_linear_infinite] rounded-full border border-dashed border-white/[0.10]" />
            <div className="absolute inset-[27%] animate-[spin_26s_linear_infinite_reverse] rounded-full border border-dashed border-[#d4ff4f]/20" />
            <div className="absolute inset-[30%] rounded-full bg-[#caff45]/[0.07] blur-[42px]" />
            <div className="relative grid size-[220px] place-items-center rounded-full border border-[#d4ff4f]/20 bg-[radial-gradient(circle_at_38%_32%,#303823_0%,#191c15_42%,#0e100c_76%)] shadow-[0_0_100px_rgba(202,255,69,0.11),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="absolute inset-3 rounded-full border border-white/[0.055]" />
              <Disc3 size={100} strokeWidth={0.75} className="text-[#d4ff4f]" />
              <div className="absolute bottom-[43px] right-[31px] grid size-11 place-items-center rounded-full border border-[#090a08] bg-[#d4ff4f] text-[#10110d] shadow-lg"><Volume2 size={18} /></div>
            </div>
            <div className="absolute left-[4%] top-[27%] flex items-center gap-2 rounded-full border border-white/[0.09] bg-[#13140f]/90 px-3 py-2 text-[11px] font-medium text-white/65 shadow-xl backdrop-blur"><span className="size-1.5 rounded-full bg-[#d4ff4f]" /> The group is listening</div>
            <div className="absolute bottom-[19%] right-[2%] flex items-center gap-2 rounded-full border border-white/[0.09] bg-[#13140f]/90 px-3 py-2 text-[11px] font-medium text-white/65 shadow-xl backdrop-blur"><Music2 size={13} className="text-[#d4ff4f]" /> Your next favorite song</div>
            <div className="absolute right-[18%] top-[9%] grid size-10 place-items-center rounded-full border border-white/[0.09] bg-[#161811] text-[#d4ff4f]"><ArrowDownRight size={17} /></div>
          </div>
        </div>
      </section>

      <Button
      onClick={handleLogin}
      className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
    >
      Conectar con Spotify Premium
    </Button>
      <footer className="relative z-10 flex items-center justify-between border-t border-white/[0.06] px-6 py-5 text-[10px] font-medium tracking-[0.1em] text-white/25 sm:px-10 lg:px-16"><span>GOOD MUSIC, BETTER COMPANY.</span><span>SET THE VIBE <span className="text-[#d4ff4f]">© 2026</span></span></footer>
    </main>
  )
}
