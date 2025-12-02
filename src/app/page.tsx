"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Sparkles, Lock, Smartphone } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const trackClick = async () => {
    if (supabase) {
      await supabase.rpc("increment_home_cta_clicks")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Sparkles className="h-5 w-5" />
            <span>ConvitesPRO</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Admin Login
              </Button>
            </Link>
            <Link href="https://wa.me/5511999999999" target="_blank" onClick={trackClick}>
              <Button size="sm" className="rounded-full">
                Contato
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
              A experiência premium em convites digitais.
            </h1>
            <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
              Minimalista. Elegante. Exclusivo. Crie convites que impressionam desde o primeiro clique.
            </p>
            <div className="space-x-4 pt-4">
              <Link href="https://wa.me/5511999999999" target="_blank" onClick={trackClick}>
                <Button size="lg" className="rounded-full px-8">
                  Solicitar Orçamento <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-900/50 border-y border-zinc-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 p-3">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Mobile First</h3>
                <p className="text-zinc-400">
                  Design pensado para a tela do celular, onde seus convidados realmente estão.
                </p>
              </div>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 p-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Confirmação Simples</h3>
                <p className="text-zinc-400">
                  Sistema de RSVP integrado e intuitivo. Acompanhe em tempo real.
                </p>
              </div>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 p-3">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Totalmente Seguro</h3>
                <p className="text-zinc-400">
                  Painel administrativo protegido para você gerenciar tudo com tranquilidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Como funciona?
            </h2>
            <div className="grid gap-8 md:grid-cols-3 pt-8 text-left">
              <div className="flex flex-col gap-2 p-4 border border-zinc-800 rounded-xl bg-zinc-900/20">
                <span className="text-4xl font-bold text-zinc-700">01</span>
                <h3 className="text-xl font-bold">Design</h3>
                <p className="text-zinc-400">
                  Nós criamos o design exclusivo do seu convite seguindo sua identidade.
                </p>
              </div>
              <div className="flex flex-col gap-2 p-4 border border-zinc-800 rounded-xl bg-zinc-900/20">
                <span className="text-4xl font-bold text-zinc-700">02</span>
                <h3 className="text-xl font-bold">Link</h3>
                <p className="text-zinc-400">
                  Você recebe um link personalizado (ex: convites.pro/casamento-ana).
                </p>
              </div>
              <div className="flex flex-col gap-2 p-4 border border-zinc-800 rounded-xl bg-zinc-900/20">
                <span className="text-4xl font-bold text-zinc-700">03</span>
                <h3 className="text-xl font-bold">Envio</h3>
                <p className="text-zinc-400">
                  Envie pelo WhatsApp. Seus convidados confirmam presença em segundos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-zinc-800">
        <p className="text-xs text-center text-zinc-500">
          © 2024 ConvitesPRO. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
