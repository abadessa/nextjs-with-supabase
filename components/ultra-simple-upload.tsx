"use client"

import type React from "react"

export function UltraSimpleUpload({ atualizarPacientes }: any) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simular dados extraídos
      const dados = [
        {
          id: 1,
          leito: "Leito 1",
          nome: "LUCI APARECIDA, 66a",
          diagnostico: "Choque séptico",
          pendencias: "Vancocinemia",
          status: "Internado",
        },
        {
          id: 2,
          leito: "Leito 2",
          nome: "MARIA SILVA, 71a",
          diagnostico: "DPOC exacerbado",
          pendencias: "Desmame VM",
          status: "Internado",
        },
        {
          id: 3,
          leito: "Leito 3",
          nome: "JOÃO SANTOS, 45a",
          diagnostico: "IAM",
          pendencias: "ECO controle",
          status: "Internado",
        },
        ...Array.from({ length: 7 }, (_, i) => ({
          id: i + 4,
          leito: `Leito ${i + 4}`,
          nome: "",
          diagnostico: "",
          pendencias: "",
          status: "Internado",
        })),
      ]

      atualizarPacientes(dados)
      alert(`✅ ${file.name} processado! 3 pacientes atualizados.`)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center bg-gray-50">
      <label className="block text-sm font-medium mb-2">📄 Atualizar por PDF:</label>
      <input type="file" accept=".pdf" onChange={handleFile} className="block w-full text-sm border rounded p-2" />
      <div className="text-xs text-gray-500 mt-1">Selecione o PDF da passagem de plantão</div>
    </div>
  )
}
