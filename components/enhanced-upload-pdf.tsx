"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from "lucide-react"

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
  const [dragActive, setDragActive] = useState(false)
  const [extractedData, setExtractedData] = useState<Patient[]>([])

  // Simular extração de dados do PDF
  const simulateDataExtraction = (fileName: string): Patient[] => {
    const sampleData: Patient[] = [
      {
        id: 1,
        leito: "Leito 1",
        nome: "LUCI APARECIDA MORALES DI BERT, 66a",
        diagnostico: "Choque séptico (Foco A/E - hematoma coxa E infectado) / Hipovolêmico melhorado / DRC Dialítica",
        pendencias: "Avaliação CIR. GERAL p/ drenagem hematoma, Recoleta vancocinemia 04/06, HD conforme programação",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 2,
        leito: "Leito 2",
        nome: "MARIA APARECIDA DA SILVA, 71a",
        diagnostico: "DPOC exacerbado / PO TQT D:21/05 / Ins resp + RNC",
        pendencias: "CST D:29/05 gram negativo, Clostridium coletado 03/06, Desmame lento VM",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      {
        id: 3,
        leito: "Leito 3",
        nome: "JOÃO SILVA SANTOS, 45a",
        diagnostico: "IAM com supradesnivelamento de ST / Choque cardiogênico",
        pendencias: "ECO controle, Troponina seriada, Avaliação hemodinâmica",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      },
      // Leitos vazios
      ...Array.from({ length: 7 }, (_, i) => ({
        id: i + 4,
        leito: `Leito ${i + 4}`,
        nome: "",
        diagnostico: "",
        pendencias: "",
        status: "Internado",
        atualizadoEm: new Date().toISOString(),
      })),
    ]

    return sampleData
  }

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus("error")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      setUploadStatus("error")
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
            const data = simulateDataExtraction(file.name)
            setExtractedData(data)
            setUploadStatus("success")
          }, 2000)

          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const confirmUpdate = () => {
    atualizarPacientes(extractedData)
    resetUpload()
  }

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setFileName("")
    setExtractedData([])
  }

  const downloadTemplate = () => {
    // Simular download de template
    alert("Template de PDF baixado! Use este modelo para estruturar sua passagem de plantão.")
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
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Faça upload do PDF da passagem de plantão</h3>
              <p className="text-sm text-gray-600 mb-4">Arraste e solte o arquivo aqui ou clique para selecionar</p>

              <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" id="pdf-upload" />

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar PDF
                </Button>

                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Instruções:</strong> O PDF deve conter a passagem de plantão estruturada com informações dos
                pacientes. Tamanho máximo: 10MB. Formatos aceitos: PDF.
              </AlertDescription>
            </Alert>
          </>
        )}

        {(uploadStatus === "uploading" || uploadStatus === "processing") && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-600">
                  {uploadStatus === "uploading" ? "Enviando arquivo..." : "Extraindo dados dos pacientes..."}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{uploadStatus === "uploading" ? "Upload" : "Processamento"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>

            {uploadStatus === "processing" && (
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Analisando conteúdo do PDF...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>PDF processado com sucesso!</strong> Foram encontrados dados de{" "}
                {extractedData.filter((p) => p.nome).length} pacientes. Revise as informações abaixo antes de confirmar
                a atualização.
              </AlertDescription>
            </Alert>

            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4 bg-gray-50">
              {extractedData
                .filter((p) => p.nome)
                .map((paciente) => (
                  <div key={paciente.id} className="bg-white p-3 rounded border">
                    <div className="font-medium text-sm">
                      {paciente.leito}: {paciente.nome}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{paciente.diagnostico.substring(0, 100)}...</div>
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={confirmUpdate} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Atualização
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro ao processar arquivo.</strong> Verifique se o arquivo é um PDF válido e menor que 10MB.
              <Button variant="outline" size="sm" onClick={resetUpload} className="ml-2">
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
