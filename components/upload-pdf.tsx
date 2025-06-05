"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/components/lgpd-audit"
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Download } from "lucide-react"

interface Patient {
  id: number
  leito: string
  nome: string
  diagnostico: string
  pendencias: string
  status: string
  atualizadoEm: string
}

interface UploadPDFProps {
  atualizarPacientes: (pacientes: Patient[]) => void
}

export function UploadPDF({ atualizarPacientes }: UploadPDFProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [loggedUser] = useState("hpmduti@gmail.com")

  // Simular extração de dados do PDF
  const simulateDataExtraction = (): Patient[] => {
    return [
      {
        id: 1,
        leito: "Leito 1",
        nome: "LUCI APARECIDA MORALES DI BERT, 66a",
        diagnostico:
          "Choque séptico (Foco A/E - hematoma coxa E infectado) / Hipovolêmico melhorado / FAARV revertida / DRC Dialítica / Mieloma Múltiplo em investigação",
        pendencias:
          "Avaliação CIR. GERAL p/ drenagem hematoma/coleção, Recoleta vancocinemia 04/06, Hemodiálise conforme programação nefro",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 2,
        leito: "Leito 2",
        nome: "MARIA APARECIDA DA SILVA, 71a",
        diagnostico: "DPOC exacerbado / PO TQT D:21/05 / Ins resp + RNC / Tabagista",
        pendencias:
          "CST D:29/05 gram negativo em identificação, Clostridium coletado 03/06, Desmame lento VM conforme tolerância",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 3,
        leito: "Leito 3",
        nome: "MARIA SOCORRO MARQUES PEREIRA, 61a",
        diagnostico: "PO LE + COLECTOMIA DIREITA + ILEOTRANSVERSOANASTOMOSE + URETEROPLASTIA / Íleo paralítico",
        pendencias: "Anatomopatológico 29/05 em andamento, Seguimento conjunto CG, NPT central iniciada 03/06",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 4,
        leito: "Leito 4",
        nome: "ISABEL CRISTINA MARTINS DA SILVA, 42a",
        diagnostico:
          "PO drenagem abscesso parede / PO histerectomia + salpingectomia / LRA KDIGO III / Íleo adinâmico em melhora",
        pendencias:
          "Cultura secreção lesão 29/05: gram negativo, Avaliação CG para progressão dieta, Furosemida 2amp 8/8h",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 5,
        leito: "Leito 5",
        nome: "JOÃO PITA MARINHO, 83a",
        diagnostico:
          "DRC Agudizado (Cr 3,4 - basal 2,5) / ICC Perfil B (Pro BNP 83559) / DPOC exacerbado com infecção / Sd Consumptiva A/E",
        pendencias:
          "ECO pendente, US rins e vias urinárias, Marcadores tumorais e função tireoidiana, 2ª amostra BARR para suspender isolamento respiratório",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: i + 6,
        leito: `Leito ${i + 6}`,
        nome: "",
        diagnostico: "",
        pendencias: "",
        status: "Vago",
        atualizadoEm: new Date().toISOString(),
      })),
    ]
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione um arquivo com menos de 10MB.",
        variant: "destructive",
      })
      return
    }

    setFileName(file.name)
    setUploadStatus("uploading")
    setUploadProgress(0)

    // Simular upload
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setUploadStatus("processing")

          // Simular processamento
          setTimeout(() => {
            const extractedData = simulateDataExtraction()
            atualizarPacientes(extractedData)
            setUploadStatus("success")

            // Log de auditoria
            logAuditEvent({
              action: "upload_pdf_handover",
              user: loggedUser,
              data: {
                fileName: file.name,
                fileSize: file.size,
                patientsUpdated: extractedData.filter((p) => p.nome).length,
                timestamp: new Date().toISOString(),
              },
            })

            toast({
              title: "PDF processado com sucesso",
              description: `${extractedData.filter((p) => p.nome).length} pacientes foram atualizados.`,
            })
          }, 2000)

          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setFileName("")
  }

  const handleDownloadTemplate = () => {
    logAuditEvent({
      action: "download_pdf_template",
      user: loggedUser,
      data: { timestamp: new Date().toISOString() },
    })

    toast({
      title: "Template baixado",
      description: "Modelo de PDF para passagem de plantão foi baixado.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Upload de Passagem de Plantão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadStatus === "idle" && (
          <>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">Faça upload do PDF da passagem de plantão</h3>
              <p className="text-sm text-blue-700 mb-4">O sistema irá extrair automaticamente os dados dos pacientes</p>

              <input type="file" className="hidden" id="pdf-upload" accept=".pdf" onChange={handleFileUpload} />

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar PDF
                </Button>

                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Modelo
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Instruções:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Selecione o PDF oficial da passagem de plantão</li>
                    <li>O arquivo deve conter informações estruturadas dos pacientes</li>
                    <li>Dados existentes serão substituídos pelos novos</li>
                    <li>A ação será registrada no sistema de auditoria</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {(uploadStatus === "uploading" || uploadStatus === "processing") && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{fileName}</p>
                <p className="text-sm text-slate-600">
                  {uploadStatus === "uploading" ? "Enviando arquivo..." : "Extraindo dados dos pacientes..."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{uploadStatus === "uploading" ? "Upload" : "Processamento"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>

            {uploadStatus === "processing" && (
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <span className="text-sm text-slate-600">Processando dados da passagem de plantão...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="text-sm text-green-800">
                <p className="font-medium">PDF processado com sucesso!</p>
                <p>Os dados dos pacientes foram atualizados automaticamente.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetUpload} className="mt-3">
              Fazer novo upload
            </Button>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Erro ao processar PDF</p>
                <p>Verifique se o arquivo é um PDF válido e tente novamente.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetUpload} className="mt-3">
              Tentar novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
