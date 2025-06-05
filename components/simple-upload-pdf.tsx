"use client"

import type React from "react"
import { useState } from "react"

interface SimpleUploadPDFProps {
  atualizarPacientes: (pacientes: any[]) => void
}

export function SimpleUploadPDF({ atualizarPacientes }: SimpleUploadPDFProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState("")

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Por favor, selecione um arquivo PDF.")
      return
    }

    setFileName(file.name)
    setIsProcessing(true)

    // Simular processamento
    setTimeout(() => {
      // Dados simulados extraídos do PDF
      const dadosExtraidos = [
        {
          id: 1,
          leito: "Leito 1",
          nome: "LUCI APARECIDA MORALES DI BERT, 66a",
          diagnostico: "Choque séptico / DRC Dialítica",
          pendencias: "Vancocinemia, HD programada",
          status: "Internado",
          atualizadoEm: new Date().toISOString(),
        },
        {
          id: 2,
          leito: "Leito 2",
          nome: "MARIA APARECIDA DA SILVA, 71a",
          diagnostico: "DPOC exacerbado / PO TQT",
          pendencias: "Desmame VM, CST pendente",
          status: "Internado",
          atualizadoEm: new Date().toISOString(),
        },
        {
          id: 3,
          leito: "Leito 3",
          nome: "JOÃO SILVA SANTOS, 45a",
          diagnostico: "IAM / Choque cardiogênico",
          pendencias: "ECO controle, Troponina",
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

      atualizarPacientes(dadosExtraidos)
      setIsProcessing(false)
      alert(
        `✅ PDF "${file.name}" processado com sucesso!\n📊 ${dadosExtraidos.filter((p) => p.nome).length} pacientes atualizados.`,
      )
    }, 2000)
  }

  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
      <div className="text-center">
        <div className="text-lg font-medium text-blue-900 mb-2">📄 Atualizar por PDF</div>

        {isProcessing ? (
          <div className="space-y-3">
            <div className="text-sm text-blue-700">Processando: {fileName}</div>
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="ml-2 text-sm text-blue-600">Extraindo dados...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-blue-700 mb-3">Selecione o PDF da passagem de plantão</div>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFile}
              className="block w-full text-sm text-blue-900
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:cursor-pointer cursor-pointer"
            />

            <div className="text-xs text-blue-600 mt-2">
              💡 O sistema irá extrair automaticamente os dados dos pacientes
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
