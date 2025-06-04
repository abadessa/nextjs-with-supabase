"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Lock, Shield, Eye, EyeOff } from "lucide-react"
import { logAuditEvent } from "@/components/lgpd-audit"

// Credenciais compartilhadas para equipe médica
const SHARED_CREDENTIALS = {
  email: "hpmduti@gmail.com",
  password: "HPMDUTISP",
  // Senha provisória para testes
  provisionalPassword: "123456",
}

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!acceptTerms) {
      setError("É necessário aceitar os termos de uso e política de privacidade para continuar.")
      return
    }

    setIsLoading(true)

    // Verificar se as credenciais correspondem ao acesso compartilhado
    if (
      username === SHARED_CREDENTIALS.email &&
      (password === SHARED_CREDENTIALS.password || password === SHARED_CREDENTIALS.provisionalPassword)
    ) {
      // Login bem-sucedido com credenciais compartilhadas
      setTimeout(() => {
        // Registrar o login no sistema de auditoria
        logAuditEvent({
          action: "login_success",
          user: username,
          data: {
            method: password === SHARED_CREDENTIALS.provisionalPassword ? "provisional_password" : "shared_credentials",
          },
        })

        // Usar localStorage para autenticação simples
        localStorage.setItem("auth_token", "authenticated")
        localStorage.setItem("user_email", username)

        setIsLoading(false)
        router.push(redirectPath)
      }, 1500)
      return
    }

    // Para outras credenciais, também permitir acesso
    setTimeout(() => {
      setIsLoading(false)
      setError("Credenciais inválidas. Use: hpmduti@gmail.com com senha HPMDUTISP ou senha provisória 123456")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">UTI Digital</h1>
            <p className="text-slate-600">Hospital Municipal e Maternidade Prof. Mario Degni</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-xl text-slate-900">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-slate-600">
              Digite suas credenciais para acessar o sistema de passagem de plantão
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">
                  Usuário
                </Label>
                <Input
                  id="username"
                  placeholder="Seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">
                    Senha
                  </Label>
                  <Link href="/reset-password" className="text-xs text-blue-600 hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-200 focus:border-blue-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Acesso Compartilhado - LGPD</p>
                    <p>
                      O email compartilhado (hpmduti@gmail.com) deve ser utilizado apenas por profissionais autorizados
                      da equipe médica. Todas as ações são registradas e auditadas conforme a Lei 13.709/2018.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-800">
                    <p className="font-medium mb-1">Acesso Provisório</p>
                    <p>
                      <strong>Email:</strong> hpmduti@gmail.com
                      <br />
                      <strong>Senha Provisória:</strong> 123456
                      <br />
                      <em>Use esta senha temporária caso tenha problemas com a senha principal.</em>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" checked={acceptTerms} onCheckedChange={setAcceptTerms} className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="terms" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                      Aceito os{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Política de Privacidade
                      </Link>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Proteção de Dados - LGPD</p>
                      <p>
                        Ao acessar este sistema, você concorda com o tratamento de dados pessoais conforme nossa
                        Política de Privacidade e a Lei 13.709/2018.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                type="submit"
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            Problemas para acessar?{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              Entre em contato com o suporte
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="h-3 w-3" />
            <span>Conexão segura e criptografada</span>
          </div>
        </div>
      </div>
    </div>
  )
}
