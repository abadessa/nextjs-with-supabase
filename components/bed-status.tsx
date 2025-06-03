import { Badge } from "@/components/ui/badge"

type BedStatusProps = {
  status: "critical" | "stable" | "improving" | "empty" | "blocked"
}

export function BedStatus({ status }: BedStatusProps) {
  switch (status) {
    case "critical":
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Crítico</Badge>
    case "stable":
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Estável</Badge>
    case "improving":
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Melhorando</Badge>
    case "empty":
      return <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">Vago</Badge>
    case "blocked":
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Bloqueado</Badge>
    default:
      return null
  }
}
