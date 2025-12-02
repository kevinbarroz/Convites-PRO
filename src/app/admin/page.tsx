"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Plus, Eye, Users, Trash2, ExternalLink, Edit, Smartphone, Monitor } from "lucide-react"

interface Invite {
    id: string
    title: string
    slug: string
    views_count: number
    cta_clicks?: number
    created_at: string
}

export default function AdminDashboard() {
    const [invites, setInvites] = useState<Invite[]>([])
    const [totalViews, setTotalViews] = useState(0)
    const [totalRsvps, setTotalRsvps] = useState(0)
    const [totalInviteCtaClicks, setTotalInviteCtaClicks] = useState(0)
    const [homeCtaClicks, setHomeCtaClicks] = useState(0)
    const [loading, setLoading] = useState(true)
    const [previewInvite, setPreviewInvite] = useState<Invite | null>(null)

    // Details Modal State
    const [detailsInvite, setDetailsInvite] = useState<Invite | null>(null)
    const [detailsRsvps, setDetailsRsvps] = useState<any[]>([])
    const [detailsLoading, setDetailsLoading] = useState(false)

    const handleOpenDetails = async (invite: Invite) => {
        setDetailsInvite(invite)
        setDetailsLoading(true)
        setDetailsRsvps([])

        try {
            if (!supabase) return
            const { data, error } = await supabase
                .from("rsvps")
                .select("*")
                .eq("invite_id", invite.id)
                .order("created_at", { ascending: false })

            if (error) throw error
            setDetailsRsvps(data || [])
        } catch (error) {
            console.error("Error fetching details:", error)
        } finally {
            setDetailsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            if (!supabase) return

            // Fetch invites
            const { data: invitesData, error: invitesError } = await supabase
                .from("invites")
                .select("*")
                .order("created_at", { ascending: false })

            if (invitesError) throw invitesError
            setInvites(invitesData || [])

            // Calculate total views
            const views = invitesData?.reduce((acc, curr) => acc + (curr.views_count || 0), 0) || 0
            setTotalViews(views)

            // Calculate total invite CTA clicks
            const inviteClicks = invitesData?.reduce((acc, curr) => acc + (curr.cta_clicks || 0), 0) || 0
            setTotalInviteCtaClicks(inviteClicks)

            // Fetch total RSVPs
            const { count, error: rsvpsError } = await supabase
                .from("rsvps")
                .select("*", { count: "exact", head: true })

            if (rsvpsError) throw rsvpsError
            setTotalRsvps(count || 0)

            // Fetch Home CTA clicks
            const { data: metricsData, error: metricsError } = await supabase
                .from("site_metrics")
                .select("value")
                .eq("key", "home_cta_clicks")
                .single()

            if (!metricsError && metricsData) {
                setHomeCtaClicks(metricsData.value)
            }

        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este convite?")) return

        try {
            if (!supabase) return
            const { error } = await supabase.from("invites").delete().eq("id", id)
            if (error) throw error
            fetchData()
        } catch (error) {
            console.error("Error deleting invite:", error)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Link href="/admin/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Novo Convite
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                        <Eye className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Confirmações</CardTitle>
                        <Users className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRsvps}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cliques CTA (Convites)</CardTitle>
                        <Smartphone className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalInviteCtaClicks}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cliques CTA (Home)</CardTitle>
                        <Monitor className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{homeCtaClicks}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Seus Convites</h2>
                {loading ? (
                    <div className="text-zinc-500">Carregando...</div>
                ) : invites.length === 0 ? (
                    <div className="text-zinc-500">Nenhum convite criado ainda.</div>
                ) : (
                    <div className="grid gap-4">
                        {invites.map((invite) => (
                            <Card key={invite.id} className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{invite.title}</h3>
                                        <p className="text-sm text-zinc-400">/{invite.slug}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" /> {invite.views_count} views
                                            </span>
                                            <span>
                                                Criado em {new Date(invite.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPreviewInvite(invite)}
                                            className="hidden md:flex"
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDetails(invite)}
                                            className="flex"
                                        >
                                            <Users className="mr-2 h-4 w-4" /> Detalhes
                                        </Button>
                                        <Link href={`/${invite.slug}`} target="_blank">
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/edit/${invite.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-950/20"
                                            onClick={() => handleDelete(invite.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <Dialog
                isOpen={!!previewInvite}
                onClose={() => setPreviewInvite(null)}
                title={`Visualizando: ${previewInvite?.title}`}
            >
                <div className="flex flex-col h-[80vh]">
                    <div className="flex-1 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative">
                        <iframe
                            src={`/${previewInvite?.slug}`}
                            className="w-full h-full"
                            title="Preview"
                        />
                    </div>
                    <div className="mt-4 flex justify-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Monitor className="h-4 w-4" /> Desktop
                        </span>
                        <span className="flex items-center gap-1">
                            <Smartphone className="h-4 w-4" /> Mobile (Redimensione a janela)
                        </span>
                    </div>
                </div>
            </Dialog>

            {/* Details Modal */}
            <Dialog
                isOpen={!!detailsInvite}
                onClose={() => setDetailsInvite(null)}
                title={`Relatório: ${detailsInvite?.title}`}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Eye className="h-5 w-5 text-zinc-400 mb-2" />
                                <div className="text-2xl font-bold">{detailsInvite?.views_count || 0}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Visualizações</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Users className="h-5 w-5 text-zinc-400 mb-2" />
                                <div className="text-2xl font-bold">{detailsRsvps.length}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Confirmados</div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-2 bg-zinc-950 border-zinc-800">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Smartphone className="h-5 w-5 text-zinc-400 mb-2" />
                                <div className="text-2xl font-bold">{detailsInvite?.cta_clicks || 0}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Cliques CTA</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-zinc-300 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Lista de Presença
                        </h3>

                        {detailsLoading ? (
                            <div className="text-center py-8 text-zinc-500">Carregando lista...</div>
                        ) : detailsRsvps.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                Ninguém confirmou presença ainda.
                            </div>
                        ) : (
                            <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-900 text-zinc-400 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Nome</th>
                                            <th className="px-4 py-3">Whatsapp</th>
                                            <th className="px-4 py-3 text-right">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                                        {detailsRsvps.map((rsvp) => (
                                            <tr key={rsvp.id} className="hover:bg-zinc-900/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-zinc-200">{rsvp.name}</td>
                                                <td className="px-4 py-3 text-zinc-400">{rsvp.whatsapp || "-"}</td>
                                                <td className="px-4 py-3 text-right text-zinc-500 text-xs">
                                                    {new Date(rsvp.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
