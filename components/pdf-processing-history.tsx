"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, User, Download, Eye, CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface ProcessingRecord {
  id: string
  fileName: string
  processedAt: string
  processedBy: string
  patientsCount: number
  status: "success" | "error" | "processing"
  fileSize: number
  processingTime: number
  changes: {
    newPatients: number
    updatedPatients: number
    newAntibiotics: number
    newPendencies: number
  }
}

export function PDFProcessingHistory() {
  const [records] = useState<ProcessingRecord[]>([
    {
      id: "1",
      fileName: "Passagem_Plantao_09_06_2025.pdf",
      processedAt: "2025-06-09T14:30:00Z",
      processedBy: "hpmduti@gmail.com",
      patientsCount: 9,
      status: "success",
      fileSize: 2.4 * 1024 * 1024, // 2.4MB
      processingTime: 3.2,
      changes: {
        newPatients: 2,
        updatedPatients: 7,
        newAntibiotics: 5,
        newPendencies: 12,
      },
    },
    {
      id: "2",
      fileName: "Passagem_Plantao_08_06_2025.pdf",
      processedAt: "2025-06-08T14:15:00Z",
      processedBy: "hpmduti@gmail.com",
      patientsCount: 8,
      status: "success",
      fileSize: 2.1 * 1024 * 1024,
      processingTime: 2.8,
      changes: {
        newPatients: 1,
        updatedPatients: 7,
        newAntibiotics: 3,
        newPendencies: 8,
      },
    },
    {
      id: "3",
      fileName: "Passagem_Plantao_07_06_2025.pdf",
      processedAt: "2025-06-07T14:45:00Z",
      processedBy: "hpmduti@gmail.com",
      patientsCount: 7,
      status: "success",
      fileSize: 1.9 * 1024 * 1024,
      processingTime: 2.5,
      changes: {
        newPatients: 0,
        updatedPatients: 7,
        newAntibiotics: 2,
        newPendencies: 6,
      },
    },
  ])

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Histórico de Processamentos
        </CardTitle>
        <p className="text-sm text-slate-600">Registro de todos os PDFs de passagem de plantão processados</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <h4 className="font-medium text-sm">{record.fileName}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(record.processedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {record.processedBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(record.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-900">{record.patientsCount}</div>
                  <div className="text-blue-600">Pacientes</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-900">{record.changes.newAntibiotics}</div>
                  <div className="text-green-600">Novos ATB</div>
                </div>
                <div className="bg-amber-50 p-2 rounded">
                  <div className="font-medium text-amber-900">{record.changes.newPendencies}</div>
                  <div className="text-amber-600">Pendências</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="font-medium text-slate-900">{record.processingTime}s</div>
                  <div className="text-slate-600">Tempo</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tamanho: {formatFileSize(record.fileSize)}</span>
                  <span>
                    {record.changes.newPatients} novos, {record.changes.updatedPatients} atualizados
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
