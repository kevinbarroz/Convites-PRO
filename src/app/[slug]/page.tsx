"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { MapPin, CheckCircle, AlignLeft, X, Mail, Loader2, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface InviteData {
    id: string
    title: string
    cover_mobile: string
    cover_desktop: string
    background_mobile: string
    background_desktop: string
    music_url?: string
    buttons: {
        id: string
        label: string
        type: "location" | "rsvp" | "text"
        content: string
    }[]
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void
        YT: any
    }
}

export default function InvitePage() {
    const params = useParams()
    const slug = params.slug as string
    const [invite, setInvite] = useState<InviteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [activeModal, setActiveModal] = useState<string | null>(null)
    const [rsvpName, setRsvpName] = useState("")
    const [rsvpWhatsapp, setRsvpWhatsapp] = useState("")
    const [rsvpLoading, setRsvpLoading] = useState(false)
    const [rsvpSuccess, setRsvpSuccess] = useState(false)

    // Music Player State
    const [isPlaying, setIsPlaying] = useState(false)
    const playerRef = useRef<any>(null)
    const [playerReady, setPlayerReady] = useState(false)

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                if (!supabase) return

                const { data, error } = await supabase
                    .from("invites")
                    .select("*, invite_buttons(*)")
                    .eq("slug", slug)
                    .single()

                if (error) throw error

                // Map invite_buttons to buttons for compatibility
                if (data.invite_buttons) {
                    data.buttons = data.invite_buttons
                    data.buttons.sort((a: any, b: any) => a.display_order - b.display_order)
                }

                setInvite(data)

                // Increment view count
                await supabase.rpc("increment_views", { invite_id: data.id })

                // Fallback update if RPC fails or doesn't exist
                const { error: viewError } = await supabase
                    .from("invites")
                    .update({ views_count: (data.views_count || 0) + 1 })
                    .eq("id", data.id)

            } catch (error) {
                console.error("Error fetching invite:", error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchInvite()
        }
    }, [slug])

    // Initialize YouTube Player
    useEffect(() => {
        if (loading) return
        if (!invite?.music_url) return
        // If player already exists, don't re-initialize
        if (playerRef.current) return

        // Extract video ID
        let videoId = ""
        try {
            const url = new URL(invite.music_url)
            if (url.hostname.includes("youtube.com")) {
                videoId = url.searchParams.get("v") || ""
            } else if (url.hostname.includes("youtu.be")) {
                videoId = url.pathname.slice(1)
            }
        } catch (e) {
            // console.error("Invalid music URL")
        }

        if (!videoId) return

        const initPlayer = () => {
            const playerElement = document.getElementById('youtube-player-container')

            if (!playerElement) {
                return;
            }

            playerRef.current = new window.YT.Player('youtube-player-container', {
                height: '1',
                width: '1',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'loop': 1,
                    'playlist': videoId, // Required for loop to work
                    'autoplay': 0,
                },
                events: {
                    'onReady': (event: any) => {
                        setPlayerReady(true)
                        playerRef.current = event.target

                        // If invite is already open, play immediately
                        if (isOpen) {
                            event.target.playVideo()
                            setIsPlaying(true)
                        }
                    },
                    'onStateChange': (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true)
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false)
                        }
                    },
                    // 'onError': (event: any) => {
                    //     console.error("YouTube Player Error:", event.data)
                    // }
                }
            })
        }

        // Load YouTube API
        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = "https://www.youtube.com/iframe_api"
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

            window.onYouTubeIframeAPIReady = initPlayer
        } else {
            initPlayer()
        }

        // Cleanup
        return () => {
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy()
                playerRef.current = null
            }
        }

    }, [invite?.music_url, loading])

    // Handle Play/Pause when opening invite
    useEffect(() => {
        if (isOpen && playerReady && playerRef.current) {
            playerRef.current.playVideo()
            setIsPlaying(true)
        }
    }, [isOpen, playerReady])

    const toggleMusic = () => {
        if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return

        if (isPlaying) {
            playerRef.current.pauseVideo()
        } else {
            playerRef.current.playVideo()
        }
        setIsPlaying(!isPlaying)
    }

    const handleRsvp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!invite || !rsvpName || !supabase) return

        setRsvpLoading(true)
        try {
            const { error } = await supabase.from("rsvps").insert({
                invite_id: invite.id,
                name: rsvpName,
                whatsapp: rsvpWhatsapp,
            })

            if (error) throw error
            setRsvpSuccess(true)
        } catch (error: any) {
            console.error("Error saving RSVP:", error)
            alert("Erro ao confirmar presença: " + (error.message || "Erro desconhecido"))
        } finally {
            setRsvpLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!invite) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <p>Convite não encontrado.</p>
            </div>
        )
    }

    const activeButton = invite.buttons.find((b) => b.id === activeModal)

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans">
            {/* YouTube Player - Must not be display:none for autoplay to work on some devices */}
            <div className="absolute top-0 left-0 h-1 w-1 opacity-0 pointer-events-none overflow-hidden">
                <div id="youtube-player-container"></div>
            </div>

            {/* Music Control - Top Left */}
            {isOpen && invite.music_url && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 z-50 text-white hover:bg-white/10"
                    onClick={toggleMusic}
                >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
            )}

            {/* CTA Button - Top Right */}
            {isOpen && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-50 text-xs text-white/70 hover:bg-white/10 hover:text-white border border-white/20 backdrop-blur-sm"
                    onClick={async () => {
                        // Track click
                        if (supabase) {
                            await supabase.rpc("increment_cta_clicks", { invite_id: invite.id })
                        }
                        // Open WhatsApp
                        window.open("https://wa.me/5511999999999", "_blank")
                    }}
                >
                    Faça seu convite Digital
                </Button>
            )}

            {/* Background Image (Open State) */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-1000",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Mobile Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center md:hidden"
                    style={{ backgroundImage: `url(${invite.background_mobile})` }}
                />
                {/* Desktop Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center hidden md:block"
                    style={{ backgroundImage: `url(${invite.background_desktop})` }}
                />
                {/* No overlay here as requested */}
            </div>

            {/* State 1: Cover (Closed State) */}
            <div
                className={cn(
                    "absolute inset-0 z-20 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out cursor-pointer",
                    isOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
                )}
                onClick={() => {
                    setIsOpen(true)
                    // Try to play immediately on user interaction
                    if (playerReady && playerRef.current && typeof playerRef.current.playVideo === 'function') {
                        try {
                            playerRef.current.playVideo()
                            setIsPlaying(true)
                        } catch (err) {
                            // console.error("Autoplay failed:", err)
                        }
                    }
                }}
            >
                {/* Mobile Cover */}
                <div
                    className="absolute inset-0 bg-cover bg-center md:hidden"
                    style={{ backgroundImage: `url(${invite.cover_mobile})` }}
                />
                {/* Desktop Cover */}
                <div
                    className="absolute inset-0 bg-cover bg-center hidden md:block"
                    style={{ backgroundImage: `url(${invite.cover_desktop})` }}
                />

                {/* No overlay here as requested */}

                <div className="z-10 flex flex-col items-center gap-4 p-4 text-center animate-pulse">
                    <Mail className="h-12 w-12 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    <p className="text-lg font-light tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        Toque para abrir
                    </p>
                </div>
            </div>

            {/* State 2: Content (Buttons at bottom) */}
            <div
                className={cn(
                    "absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-4 px-4 transition-all duration-1000 delay-300",
                    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
            >
                <div className="flex w-full max-w-md justify-center gap-3">
                    {invite.buttons.map((btn) => (
                        <Button
                            key={btn.id}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white transition-all duration-300 h-10 text-xs uppercase tracking-wider"
                            onClick={() => setActiveModal(btn.id)}
                        >
                            {btn.type === "location" && <MapPin className="mr-2 h-3 w-3" />}
                            {btn.type === "rsvp" && <CheckCircle className="mr-2 h-3 w-3" />}
                            {btn.type === "text" && <AlignLeft className="mr-2 h-3 w-3" />}
                            {btn.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <Dialog
                isOpen={!!activeModal}
                onClose={() => {
                    setActiveModal(null)
                    setRsvpSuccess(false)
                    setRsvpName("")
                }}
                title={activeButton?.label}
            >
                {activeButton?.type === "location" && (
                    <div className="space-y-4">
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-800">
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={activeButton.content}
                            ></iframe>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => window.open(activeButton.content, "_blank")}
                        >
                            Abrir no Google Maps
                        </Button>
                    </div>
                )}

                {activeButton?.type === "text" && (
                    <div className="prose prose-invert">
                        <p className="whitespace-pre-wrap text-zinc-300">{activeButton.content}</p>
                    </div>
                )}

                {activeButton?.type === "rsvp" && (
                    <div className="space-y-4">
                        {rsvpSuccess ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                <div className="rounded-full bg-green-500/20 p-3">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Presença Confirmada!</h3>
                                <p className="text-zinc-400">Obrigado por confirmar.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRsvp} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">
                                        Nome Completo
                                    </label>
                                    <Input
                                        value={rsvpName}
                                        onChange={(e) => setRsvpName(e.target.value)}
                                        placeholder="Digite seu nome"
                                        required
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">
                                        Whatsapp
                                    </label>
                                    <Input
                                        value={rsvpWhatsapp}
                                        onChange={(e) => setRsvpWhatsapp(e.target.value)}
                                        placeholder="(DDD) 99999-9999"
                                        required
                                        className="bg-zinc-900 border-zinc-700"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={rsvpLoading}>
                                    {rsvpLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Confirmar Presença"
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    )
}
