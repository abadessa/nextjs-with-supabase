"use client"

import { EnhancedHandover } from "@/components/enhanced-handover"
import { LGPDAuditProvider } from "@/components/lgpd-audit-provider"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function EnhancedHandoverPage() {
  const router = useRouter()
  const [loggedUser, setLoggedUser] = useState("")

  useEffect(() => {
    const authToken = Cookies.get("auth_token")
    const userEmail = Cookies.get("user_email")

    if (!authToken) {
      router.push("/login")
      return
    }

    if (userEmail) {
      setLoggedUser(userEmail)
    }
  }, [router])

  if (!loggedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p>Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <LGPDAuditProvider user={loggedUser}>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto py-8 px-4">
          <EnhancedHandover />
        </div>
        <Toaster />
      </div>
    </LGPDAuditProvider>
  )
}
