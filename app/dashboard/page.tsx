"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Key } from "lucide-react"
import { PrintPatientCard } from "@/components/print-patient-card"

interface Bed {
  id: string
  name: string
  status: "empty" | "occupied" | "blocked"
  patientName?: string
  patientAge?: string
  patientGender?: string
  patientDiagnosis?: string
  patientId?: string
}

export default function DashboardPage() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [newBedName, setNewBedName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useUser()
  const [loggedUser, setLoggedUser] = useState<any>(null)

  useEffect(() => {
    if (user) {
      setLoggedUser(user)
    }
  }, [user])

  useEffect(() => {
    fetchBeds()
  }, [])

  const fetchBeds = async () => {
    try {
      const response = await fetch("/api/beds")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBeds(data)
    } catch (error) {
      console.error("Failed to fetch beds:", error)
      toast.error("Failed to fetch beds.")
    }
  }

  const handleCreateBed = async () => {
    try {
      const response = await fetch("/api/beds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newBedName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newBed = await response.json()
      setBeds([...beds, newBed])
      setNewBedName("")
      toast.success("Bed created successfully!")
    } catch (error) {
      console.error("Failed to create bed:", error)
      toast.error("Failed to create bed.")
    }
  }

  const handleDeleteBed = async (bedId: string) => {
    try {
      const response = await fetch(`/api/beds/${bedId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setBeds(beds.filter((bed) => bed.id !== bedId))
      toast.success("Bed deleted successfully!")
    } catch (error) {
      console.error("Failed to delete bed:", error)
      toast.error("Failed to delete bed.")
    }
  }

  const handleOpenDialog = (bedId: string) => {
    setSelectedBedId(bedId)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedBedId(null)
    setIsDialogOpen(false)
  }

  const handleConfirmDelete = () => {
    if (selectedBedId) {
      handleDeleteBed(selectedBedId)
      handleCloseDialog()
    }
  }

  const handleAttachFileToPatient = async (bed: Bed) => {
    router.push(`/attach-file?bedId=${bed.id}`)
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="New Bed Name"
            value={newBedName}
            onChange={(e) => setNewBedName(e.target.value)}
          />
          <Button onClick={handleCreateBed}>Create Bed</Button>
        </div>
      </div>

      <Table>
        <TableCaption>A list of beds in your hospital.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Patient Age</TableHead>
            <TableHead>Patient Gender</TableHead>
            <TableHead>Patient Diagnosis</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beds.map((bed) => (
            <TableRow key={bed.id}>
              <TableCell>{bed.name}</TableCell>
              <TableCell>{bed.status}</TableCell>
              <TableCell>{bed.patientName || "-"}</TableCell>
              <TableCell>{bed.patientAge || "-"}</TableCell>
              <TableCell>{bed.patientGender || "-"}</TableCell>
              <TableCell>{bed.patientDiagnosis || "-"}</TableCell>
              <TableCell className="text-right">
                {bed.status !== "empty" && bed.status !== "blocked" && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.preventDefault()
                        handleAttachFileToPatient(bed)
                      }}
                      title="Anexar arquivo para atualizar dados do paciente"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <div onClick={(e) => e.preventDefault()}>
                      <PrintPatientCard patient={bed} loggedUser={loggedUser} />
                    </div>
                  </div>
                )}
                <div className="relative">
                  <Button variant="destructive" size="sm" onClick={() => handleOpenDialog(bed.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bed and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
