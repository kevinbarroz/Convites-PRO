"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { InviteForm } from "@/components/admin/InviteForm"
import { Loader2 } from "lucide-react"

export default function EditInvitePage() {
    const params = useParams()
    const id = params.id as string
    const [invite, setInvite] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const { data: inviteData, error: inviteError } = await supabase
                    .from("invites")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (inviteError) throw inviteError

                const { data: buttonsData, error: buttonsError } = await supabase
                    .from("invite_buttons")
                    .select("*")
                    .eq("invite_id", id)
                    .order("display_order", { ascending: true })

                if (buttonsError) throw buttonsError

                setInvite({ ...inviteData, buttons: buttonsData || [] })
            } catch (error) {
                console.error("Error fetching invite:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchInvite()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
        )
    }

    if (!invite) {
        return <div>Convite não encontrado.</div>
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Editar Convite</h1>
            <InviteForm initialData={invite} />
        </div>
    )
}
