"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Phone, Mail, Clock, Users } from "lucide-react"

export default function Support() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Suporte Técnico</h1>
            <p className="text-slate-600">Hospital Municipal e Maternidade Prof. Mario Degni</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-blue-600" />
                Contato Telefônico
              </CardTitle>
              <CardDescription>Para emergências e suporte imediato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-900">Emergência UTI</p>
                <p className="text-red-800">(11) 5667-6000 - Ramal 2500</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Suporte TI</p>
                <p className="text-blue-800">(11) 5667-6000 - Ramal 1200</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                Email de Suporte
              </CardTitle>
              <CardDescription>Para questões não urgentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">TI Hospital</p>
                <p className="text-blue-800">ti@hpmd.sp.gov.br</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900">Coordenação UTI</p>
                <p className="text-green-800">uti.coord@hpmd.sp.gov.br</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Horários de Atendimento
              </CardTitle>
              <CardDescription>Disponibilidade do suporte técnico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Segunda a Sexta</span>
                  <span>07:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sábados</span>
                  <span>08:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Emergências</span>
                  <span className="text-red-600">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                Problemas Comuns
              </CardTitle>
              <CardDescription>Soluções rápidas para questões frequentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Esqueci minha senha</p>
                  <p className="text-gray-600">Use a opção "Recuperar Senha" na tela de login</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Sistema lento</p>
                  <p className="text-gray-600">Limpe o cache do navegador e tente novamente</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Erro de acesso</p>
                  <p className="text-gray-600">Verifique suas credenciais ou contate o suporte</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Acesso Compartilhado</h3>
              <p className="text-sm text-yellow-800">
                O email compartilhado (hpmduti@gmail.com) é de uso exclusivo da equipe médica autorizada. Para problemas
                com este acesso, contate diretamente a coordenação da UTI.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">LGPD - Proteção de Dados</h3>
              <p className="text-sm text-blue-800">
                Todas as interações com o suporte são registradas conforme a Lei 13.709/2018. Seus dados pessoais são
                tratados com total segurança e confidencialidade.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
