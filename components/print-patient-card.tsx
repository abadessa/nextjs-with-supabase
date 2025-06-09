"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { logAuditEvent } from "@/components/lgpd-audit"

// Tipo para antibióticos
type Antibiotic = {
  name: string
  startDate: string
  daysInUse: number
  dose?: string
  frequency?: string
  pendingLabs?: string[]
  indication?: string
  status?: string
}

// Interface simplificada para os dados do paciente
interface PatientData {
  id: string
  name: string
  diagnosis: string
  admittedFrom: string
  pendingIssues?: string[]
  exams?: string[]
  goals?: string[]
  status: string
  devices?: string
  medications?: string
  allergies?: string
  comorbidities?: string
  antibiotics?: Antibiotic[]
  saps3?: string
}

interface PrintPatientCardProps {
  patient: PatientData
  loggedUser?: string
}

export function PrintPatientCard({ patient, loggedUser = "Sistema" }: PrintPatientCardProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)

    // Log de auditoria
    try {
      logAuditEvent({
        action: "print_patient_data",
        user: loggedUser,
        data: {
          patientId: patient.id,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.log("Erro no log de auditoria:", error)
    }

    // Criar conteúdo para impressão
    const printContent = generatePrintContent(patient, loggedUser)

    // Abrir nova janela para impressão
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()

      // Aguardar carregamento e imprimir
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
        setIsPrinting(false)
      }
    } else {
      setIsPrinting(false)
      alert("Por favor, permita pop-ups para imprimir")
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "CRÍTICO"
      case "stable":
        return "ESTÁVEL"
      case "empty":
        return "VAGO"
      case "blocked":
        return "BLOQUEADO"
      default:
        return "INTERNADO"
    }
  }

  const generatePrintContent = (patient: PatientData, user: string) => {
    const currentDate = new Date().toLocaleDateString("pt-BR")
    const currentTime = new Date().toLocaleString("pt-BR")

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resumo do Paciente - Leito ${patient.id}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10mm;
            margin-bottom: 8mm;
        }
        
        .hospital-name {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 3mm;
        }
        
        .document-title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        .date {
            font-size: 10pt;
            color: #666;
        }
        
        .patient-header {
            background: #f5f5f5;
            padding: 5mm;
            margin-bottom: 6mm;
            border: 1px solid #ddd;
        }
        
        .patient-id {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        .patient-name {
            font-size: 14pt;
            font-weight: bold;
            color: #333;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2mm 4mm;
            border-radius: 3mm;
            font-size: 9pt;
            font-weight: bold;
            margin-left: 5mm;
        }
        
        .status-critical {
            background: #fee;
            color: #c00;
            border: 1px solid #fcc;
        }
        
        .status-stable {
            background: #efe;
            color: #060;
            border: 1px solid #cfc;
        }
        
        .section {
            margin-bottom: 5mm;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #999;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
            color: #333;
        }
        
        .section-content {
            font-size: 10pt;
            margin-left: 3mm;
        }
        
        .list {
            margin: 0;
            padding-left: 5mm;
        }
        
        .list li {
            margin-bottom: 1mm;
        }
        
        .allergies {
            color: #c00 !important;
            font-weight: bold;
        }
        
        .antibiotics-item {
            border-left: 3px solid #007acc;
            padding-left: 3mm;
            margin-bottom: 2mm;
        }
        
        .antibiotic-name {
            font-weight: bold;
            color: #007acc;
        }
        
        .antibiotic-details {
            font-size: 9pt;
            color: #666;
        }
        
        .footer {
            position: fixed;
            bottom: 10mm;
            left: 15mm;
            right: 15mm;
            border-top: 1px solid #000;
            padding-top: 3mm;
            font-size: 8pt;
            text-align: center;
        }
        
        .confidential {
            font-weight: bold;
            color: #c00;
            margin-top: 2mm;
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">Hospital Municipal e Maternidade Prof. Mario Degni</div>
        <div class="document-title">RESUMO DO PACIENTE - UTI</div>
        <div class="date">Impresso em: ${currentDate}</div>
    </div>

    <div class="patient-header">
        <div class="patient-id">
            Leito: ${patient.id}
            <span class="status-badge status-${patient.status}">${getStatusText(patient.status)}</span>
        </div>
        <div class="patient-name">${patient.name}</div>
    </div>

    <div class="section">
        <div class="section-title">Diagnóstico</div>
        <div class="section-content">${patient.diagnosis}</div>
    </div>

    <div class="section">
        <div class="section-title">Origem</div>
        <div class="section-content">${patient.admittedFrom}</div>
    </div>

    ${
      patient.saps3
        ? `
    <div class="section">
        <div class="section-title">SAPS 3</div>
        <div class="section-content">${patient.saps3}</div>
    </div>
    `
        : ""
    }

    ${
      patient.devices
        ? `
    <div class="section">
        <div class="section-title">Dispositivos</div>
        <div class="section-content">${patient.devices}</div>
    </div>
    `
        : ""
    }

    ${
      patient.medications
        ? `
    <div class="section">
        <div class="section-title">Medicações</div>
        <div class="section-content">${patient.medications}</div>
    </div>
    `
        : ""
    }

    ${
      patient.antibiotics && patient.antibiotics.length > 0
        ? `
    <div class="section">
        <div class="section-title">Antibióticos</div>
        <div class="section-content">
            ${patient.antibiotics
              .map(
                (atb) => `
                <div class="antibiotics-item">
                    <div class="antibiotic-name">${atb.name}</div>
                    <div class="antibiotic-details">
                        ${atb.daysInUse} dias de uso
                        ${atb.indication ? ` • ${atb.indication}` : ""}
                        ${atb.status ? ` • ${atb.status}` : ""}
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
    </div>
    `
        : ""
    }

    ${
      patient.pendingIssues && patient.pendingIssues.length > 0
        ? `
    <div class="section">
        <div class="section-title">Pendências</div>
        <div class="section-content">
            <ul class="list">
                ${patient.pendingIssues.map((issue) => `<li>${issue}</li>`).join("")}
            </ul>
        </div>
    </div>
    `
        : ""
    }

    ${
      patient.goals && patient.goals.length > 0
        ? `
    <div class="section">
        <div class="section-title">Metas Assistenciais</div>
        <div class="section-content">
            <ul class="list">
                ${patient.goals.map((goal) => `<li>${goal}</li>`).join("")}
            </ul>
        </div>
    </div>
    `
        : ""
    }

    ${
      patient.allergies
        ? `
    <div class="section">
        <div class="section-title">Alergias</div>
        <div class="section-content allergies">${patient.allergies}</div>
    </div>
    `
        : ""
    }

    ${
      patient.comorbidities
        ? `
    <div class="section">
        <div class="section-title">Comorbidades</div>
        <div class="section-content">${patient.comorbidities}</div>
    </div>
    `
        : ""
    }

    <div class="footer">
        <div>Documento gerado em: ${currentTime}</div>
        <div>Usuário: ${user}</div>
        <div class="confidential">DOCUMENTO CONFIDENCIAL - USO EXCLUSIVO DA EQUIPE ASSISTENCIAL</div>
    </div>
</body>
</html>
    `
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint} disabled={isPrinting}>
      <Printer className="h-4 w-4" />
      {isPrinting ? "Preparando..." : "Imprimir"}
    </Button>
  )
}
