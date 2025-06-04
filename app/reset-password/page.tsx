"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simular envio de email de recuperação
    setTimeout(() => {
      setIsLoading(false)

      // Para o email compartilhado, mostrar instruções especiais
      if (email === "hpmduti@gmail.com") {
        setIsSuccess(true)
      } else {
        setError("Este email não está cadastrado no sistema. Entre em contato com o administrador.")
      }
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Email Enviado</h1>
              <p className="text-slate-600">Instruções de recuperação foram enviadas</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-slate-900">Verifique seu Email</CardTitle>
              <CardDescription className="text-slate-600">
                Enviamos instruções de recuperação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Acesso Compartilhado:</strong> Para recuperar a senha do email compartilhado da equipe médica,
                  entre em contato com o coordenador da UTI ou administrador do sistema.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Próximos passos:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Verifique sua caixa de entrada</li>
                  <li>• Procure também na pasta de spam</li>
                  <li>• Siga as instruções no email recebido</li>
                  <li>• Entre em contato com o suporte se necessário</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Login
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccess(false)
                  setEmail("")
                }}
              >
                Tentar outro email
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Recuperar Senha</h1>
            <p className="text-slate-600">Hospital Municipal e Maternidade Prof. Mario Degni</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-xl text-slate-900">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-slate-600">
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                  required
                />
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Email Compartilhado:</strong> Se você usa o email compartilhado da equipe médica
                  (hpmduti@gmail.com), entre em contato com o coordenador para recuperação de senha.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Instruções
                  </>
                )}
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Login
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            Ainda com problemas?{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              Entre em contato com o suporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
