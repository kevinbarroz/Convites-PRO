"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Save, Loader2, GripVertical } from "lucide-react"

interface InviteButton {
    id?: string
    label: string
    type: "location" | "rsvp" | "text"
    content: string
    display_order: number
}

interface InviteFormProps {
    initialData?: {
        id: string
        title: string
        slug: string
        cover_mobile: string
        cover_desktop: string
        background_mobile: string
        background_desktop: string
        music_url?: string
        buttons: InviteButton[]
    }
}

export function InviteForm({ initialData }: InviteFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(initialData?.title || "")
    const [slug, setSlug] = useState(initialData?.slug || "")
    const [musicUrl, setMusicUrl] = useState(initialData?.music_url || "")

    // New image states
    const [coverMobile, setCoverMobile] = useState(initialData?.cover_mobile || "")
    const [coverDesktop, setCoverDesktop] = useState(initialData?.cover_desktop || "")
    const [backgroundMobile, setBackgroundMobile] = useState(initialData?.background_mobile || "")
    const [backgroundDesktop, setBackgroundDesktop] = useState(initialData?.background_desktop || "")

    const [buttons, setButtons] = useState<InviteButton[]>(
        initialData?.buttons || []
    )

    const handleAddButton = () => {
        setButtons([
            ...buttons,
            {
                label: "Novo Botão",
                type: "text",
                content: "",
                display_order: buttons.length,
            },
        ])
    }

    const handleRemoveButton = (index: number) => {
        const newButtons = [...buttons]
        newButtons.splice(index, 1)
        setButtons(newButtons)
    }

    const handleButtonChange = (index: number, field: keyof InviteButton, value: any) => {
        const newButtons = [...buttons]
        newButtons[index] = { ...newButtons[index], [field]: value }
        setButtons(newButtons)
    }

    const [uploading, setUploading] = useState(false)

    const uploadImage = async (file: File) => {
        try {
            setUploading(true)
            const fileExt = file.name.split(".").pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from("images").getPublicUrl(filePath)
            return data.publicUrl
        } catch (error: any) {
            alert("Erro ao fazer upload da imagem: " + error.message)
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }
        const file = e.target.files[0]
        const url = await uploadImage(file)
        if (url) {
            setter(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let inviteId = initialData?.id

            // 1. Upsert Invite
            const inviteData = {
                title,
                slug,
                cover_mobile: coverMobile,
                cover_desktop: coverDesktop,
                background_mobile: backgroundMobile,
                background_desktop: backgroundDesktop,
                music_url: musicUrl,
            }

            if (inviteId) {
                const { error } = await supabase
                    .from("invites")
                    .update(inviteData)
                    .eq("id", inviteId)
                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from("invites")
                    .insert(inviteData)
                    .select()
                    .single()
                if (error) throw error
                inviteId = data.id
            }

            // 2. Handle Buttons (Delete all and recreate for simplicity in MVP)
            if (inviteId) {
                // Delete existing buttons if editing
                if (initialData?.id) {
                    await supabase.from("invite_buttons").delete().eq("invite_id", inviteId)
                }

                // Insert new buttons
                if (buttons.length > 0) {
                    const buttonsToInsert = buttons.map((btn, index) => ({
                        invite_id: inviteId,
                        label: btn.label,
                        type: btn.type,
                        content: btn.content,
                        display_order: index,
                    }))

                    const { error: btnError } = await supabase
                        .from("invite_buttons")
                        .insert(buttonsToInsert)
                    if (btnError) throw btnError
                }
            }

            router.push("/admin")
            router.refresh()
            router.push("/admin")
            router.refresh()
        } catch (error: any) {
            console.error("Save error:", error)
            if (error.message?.includes("invites_slug_key") || error.code === "23505") {
                alert("Erro: Este link (slug) já está em uso. Por favor, escolha um nome diferente para a URL.")
            } else {
                alert("Erro ao salvar: " + error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Informações Básicas</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Título do Evento</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Casamento Ana & João"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug (URL)</label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="casamento-ana"
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Música de Fundo (Link do YouTube)</label>
                        <Input
                            value={musicUrl}
                            onChange={(e) => setMusicUrl(e.target.value)}
                            placeholder="Ex: https://www.youtube.com/watch?v=..."
                        />
                        <p className="text-xs text-zinc-500">
                            Cole o link completo do vídeo do YouTube. A música tocará automaticamente ao abrir o convite.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Cover Images */}
                    <div className="space-y-4 p-4 border border-zinc-800 rounded-lg">
                        <h3 className="font-medium text-zinc-300">Capa (Convite Fechado)</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Mobile (9:16)</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setCoverMobile)}
                                    disabled={uploading}
                                />
                                {coverMobile && (
                                    <div className="h-16 w-9 relative rounded overflow-hidden border border-zinc-700 shrink-0">
                                        <img src={coverMobile} alt="Capa Mobile" className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Desktop (16:9)</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setCoverDesktop)}
                                    disabled={uploading}
                                />
                                {coverDesktop && (
                                    <div className="h-9 w-16 relative rounded overflow-hidden border border-zinc-700 shrink-0">
                                        <img src={coverDesktop} alt="Capa Desktop" className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Background Images */}
                    <div className="space-y-4 p-4 border border-zinc-800 rounded-lg">
                        <h3 className="font-medium text-zinc-300">Fundo (Convite Aberto)</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Mobile (9:16)</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setBackgroundMobile)}
                                    disabled={uploading}
                                />
                                {backgroundMobile && (
                                    <div className="h-16 w-9 relative rounded overflow-hidden border border-zinc-700 shrink-0">
                                        <img src={backgroundMobile} alt="Fundo Mobile" className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Desktop (16:9)</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setBackgroundDesktop)}
                                    disabled={uploading}
                                />
                                {backgroundDesktop && (
                                    <div className="h-9 w-16 relative rounded overflow-hidden border border-zinc-700 shrink-0">
                                        <img src={backgroundDesktop} alt="Fundo Desktop" className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Botões Interativos</h2>
                    <Button type="button" onClick={handleAddButton} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Botão
                    </Button>
                </div>

                <div className="space-y-4">
                    {buttons.map((button, index) => (
                        <Card key={index} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="mt-3 text-zinc-500 cursor-move">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="grid gap-4 flex-1 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Rótulo</label>
                                        <Input
                                            value={button.label}
                                            onChange={(e) => handleButtonChange(index, "label", e.target.value)}
                                            placeholder="Ex: Localização"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Tipo</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={button.type}
                                            onChange={(e) => handleButtonChange(index, "type", e.target.value)}
                                        >
                                            <option value="text">Texto / Aviso</option>
                                            <option value="location">Localização (Maps)</option>
                                            <option value="rsvp">Confirmar Presença (RSVP)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Conteúdo</label>
                                        <Input
                                            value={button.content}
                                            onChange={(e) => handleButtonChange(index, "content", e.target.value)}
                                            placeholder={
                                                button.type === "location"
                                                    ? "URL do Google Maps Embed"
                                                    : button.type === "text"
                                                        ? "Texto do modal"
                                                        : "Deixe vazio para RSVP padrão"
                                            }
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 mt-6"
                                    onClick={() => handleRemoveButton(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Convite
                </Button>
            </div>
        </form >
    )
}
