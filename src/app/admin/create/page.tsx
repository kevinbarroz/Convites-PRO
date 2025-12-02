import { InviteForm } from "@/components/admin/InviteForm"

export default function CreateInvitePage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Criar Novo Convite</h1>
            <InviteForm />
        </div>
    )
}
