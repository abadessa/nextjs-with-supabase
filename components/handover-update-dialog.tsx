"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { FileText, Upload, Save, CheckCircle2, AlertCircle, Edit3, RefreshCw } from "lucide-react"

interface HandoverUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (content: string) => void
}

export function HandoverUpdateDialog({ open, onOpenChange, onSave }: HandoverUpdateDialogProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [extractedText, setExtractedText] = useState("")
  const [editedText, setEditedText] = useState("")
  const [fileName, setFileName] = useState("")

  // Função para simular extração de texto do PDF
  const simulateTextExtraction = (fileName: string): string => {
    // Simulação de texto extraído baseado na passagem de plantão real
    return `PASSAGEM DE PLANTÃO UTI - ${new Date().toLocaleDateString("pt-BR")}

LEITO 5001 - LUCI APARECIDA MORALES DI BERT, 66a
Origem: UPA III LAPA (D:20/05) / DIH:21/05
SAPS3: 76 | 67,5%

Diagnósticos:
- Choque séptico (Foco A/E - hematoma coxa E infectado)
- Hipovolêmico melhorado
- FAARV revertida D:26/05
- DRC Dialítica
- Mieloma Múltiplo em investigação

Dispositivos: PICC, AVC, Permcath
Antibióticos: 
- VANCOMICINA (21/05 - suspensa por vancocinemia 27,83)
- MEROPENEM (24/05) - 10 dias
- FLUCONAZOL (27/05) - 7 dias

Exames críticos:
- USG partes moles: coleção 999,6ml hematoma coxa E
- Hb 8,3, Leuco 16620, PLQ 83.000
- KAPPA 95,29 / LAMBDA 130,58

Pendências:
- Avaliação CIR. GERAL p/ drenagem hematoma
- Recoleta vancocinemia 04/06
- HD conforme programação

Metas:
- Vigilância infecciosa
- Dieta pastosa + enteral 20ml/hr
- Hemodiálise conforme nefrologia

---

LEITO 5002 - MARIA APARECIDA DA SILVA, 71a
Origem: UPA Rio Pequeno (08/05/2025)

Diagnósticos:
- DPOC exacerbado
- PO TQT D:21/05
- Ins resp + RNC

Dispositivos: TQT, SVD, PICC MSD, SNE
Antibióticos: TAZOCIN (28/05)

Exames:
- Hb 8,1, Leuco 2460, PLQ 145.000
- CST D:29/05: gram negativo em crescimento

Pendências:
- Desmame lento VM
- Clostridium coletado 03/06

Metas:
- Cuidados TQT
- BD com espaçador
- Quetiapina 25mg 12/12h

---

LEITO 5003 - MARIA SOCORRO MARQUES PEREIRA, 61a
Origem: Centro Cirúrgico (DIH: 28/05/2025)

Diagnósticos:
- PO LE + COLECTOMIA DIREITA + ILEOTRANSVERSOANASTOMOSE
- Íleo paralítico

Dispositivos: SVD 3 vias + AVP + PICC
Antibióticos: CEFTRIAXONA + METRONIDAZOL (28/05)

Exames:
- Hb 10,7, Leuco 18450, PLQ 368.000
- PCR 16,7, Anatomopatológico pendente

Pendências:
- Seguimento CG
- NPT central

Metas:
- Jejum + NPT central
- SNG aberta + procinéticos
- Hidratação parcimoniosa

---

LEITO 5004 - ISABEL CRISTINA MARTINS DA SILVA, 42a
Origem: CCGO (DIH: 16/05/25)

Diagnósticos:
- PO drenagem abscesso parede
- PO histerectomia + salpingectomia
- LRA KDIGO III

Dispositivos: SVD + PICC MSD
Antibióticos: MEROPENEM (31/05)

Exames:
- Cr 5,1, U 82
- Cultura secreção: gram negativo

Pendências:
- Avaliação nefrologia
- Não sacar SVD

Metas:
- Analgesia otimizada
- Furosemida 8/8h
- Não deambular - risco evisceração

---

LEITO 6001 - JOÃO PITA MARINHO, 83a
Origem: UPA Rio Pequeno (D:28/05) / DI UTI D:02/06

Diagnósticos:
- DRC Agudizado (Cr 3,4 - basal 2,5)
- ICC Perfil B (Pro BNP 83559)
- DPOC exacerbado com infecção

Dispositivos: AVP
Antibióticos: CEFTRIAXONE (28/05) + AZITROMICINA (02/06)

Pendências:
- ECO, US rins
- Marcadores tumorais
- 2ª amostra BARR

Metas:
- Reconciliação medicamentosa
- Furosemida 40mg/dia
- Acompanhamento nefrologia

---

LEITO 6002 - GEORGINA VIEIRA DE ALMEIDA, 66a
Origem: PS Lapa (D:02/06) / DI UTI D:03/06

Diagnósticos:
- Bacteremia A/E
- Dor abdominal A/E
- IRC dialítica

Dispositivos: AVP, Permicath
Antibióticos: CEFTRIAXONE + METRONIDAZOL (03/06)

Pendências:
- Laudo TC abdome
- HMC pareadas + cateter
- HD rotina

Metas:
- ATB empírico foco abdominal
- Analgesia S/N
- Seguimento CG

---

LEITOS BLOQUEADOS: 3001, 3002, 4001, 4002
LEITOS VAGOS: 7001, 7002, 7003

Atualizado em: ${new Date().toLocaleString("pt-BR")}`
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

    // Adicionar verificação de tamanho do arquivo
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
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
            const text = simulateTextExtraction(file.name)
            setExtractedText(text)
            setEditedText(text)
            setUploadStatus("success")

            toast({
              title: "PDF processado com sucesso",
              description: "Texto extraído e pronto para edição.",
            })
          }, 2000)

          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSave = () => {
    if (!editedText.trim()) {
      toast({
        title: "Conteúdo vazio",
        description: "Por favor, adicione o conteúdo da passagem de plantão.",
        variant: "destructive",
      })
      return
    }

    onSave(editedText)

    toast({
      title: "Passagem de plantão atualizada",
      description: "Os dados foram salvos com sucesso.",
    })

    // Reset do estado
    setUploadStatus("idle")
    setUploadProgress(0)
    setExtractedText("")
    setEditedText("")
    setFileName("")

    onOpenChange(false)
  }

  const resetDialog = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setExtractedText("")
    setEditedText("")
    setFileName("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetDialog()
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[95vw] md:w-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Atualizar Passagem de Plantão
          </DialogTitle>
          <DialogDescription>
            Faça upload do PDF da passagem de plantão para extrair e editar o conteúdo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {uploadStatus === "idle" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">Selecione o PDF da Passagem de Plantão</h3>
                <p className="text-sm text-blue-700 mb-4">
                  O sistema irá extrair automaticamente o texto do PDF para edição
                </p>

                <input type="file" className="hidden" id="pdf-upload" accept=".pdf" onChange={handleFileUpload} />

                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar PDF
                </Button>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Instruções:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Selecione o PDF oficial da passagem de plantão</li>
                      <li>O texto será extraído automaticamente</li>
                      <li>Você poderá revisar e editar antes de salvar</li>
                      <li>As alterações substituirão a passagem atual</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(uploadStatus === "uploading" || uploadStatus === "processing") && (
            <div className="space-y-6 py-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{fileName}</p>
                  <p className="text-sm text-slate-600">
                    {uploadStatus === "uploading" ? "Enviando arquivo..." : "Extraindo texto do PDF..."}
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
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-4" />
                    <span className="text-sm text-slate-600 block">Extraindo dados da passagem de plantão...</span>
                    <span className="text-xs text-slate-500 block mt-2">Isso pode levar alguns segundos</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">PDF processado com sucesso!</p>
                    <p>Revise e edite o conteúdo abaixo antes de salvar.</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Conteúdo da Passagem de Plantão</label>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Edit3 className="h-3 w-3" />
                    Editável
                  </div>
                </div>

                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="flex-1 min-h-[300px] md:min-h-[400px] font-mono text-sm resize-none overflow-auto"
                  placeholder="O conteúdo extraído do PDF aparecerá aqui..."
                />

                <div className="text-xs text-slate-500 text-right">{editedText.length} caracteres</div>
              </div>
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
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {uploadStatus === "idle" || uploadStatus === "error" ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          ) : uploadStatus === "success" ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={resetDialog} className="flex-1 sm:flex-none">
                Novo PDF
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-none" disabled={!editedText.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Atualização
              </Button>
            </div>
          ) : (
            <Button disabled>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Processando...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
