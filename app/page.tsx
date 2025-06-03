import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Heart, Users, FileText, Lock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">UTI Digital</h1>
              <p className="text-xs text-slate-500">Hospital Mario Degni</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-600">
                Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Acessar Sistema</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Passagem de Plantão
                    <span className="block text-blue-600">UTI Digital</span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Sistema seguro e eficiente para gerenciamento de informações da UTI do Hospital Municipal e
                    Maternidade Prof. Mario Degni
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                      Acessar Dashboard
                    </Button>
                  </Link>
                  <Link href="/privacy">
                    <Button variant="outline" size="lg" className="px-8">
                      Política de Privacidade
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Protegido pela Lei Geral de Proteção de Dados (LGPD)</span>
                </div>
              </div>

              <div className="mx-auto lg:ml-auto">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Recursos Principais</h3>
                        <p className="text-slate-600">Tecnologia a serviço do cuidado</p>
                      </div>

                      <div className="grid gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span className="text-slate-700">Gestão completa dos leitos da UTI</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                          <FileText className="h-5 w-5 text-green-600" />
                          <span className="text-slate-700">Registro seguro de informações clínicas</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                          <Shield className="h-5 w-5 text-purple-600" />
                          <span className="text-slate-700">Conformidade total com a LGPD</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50">
                          <Lock className="h-5 w-5 text-amber-600" />
                          <span className="text-slate-700">Acesso controlado e auditado</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white/50">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Hospital Mario Degni</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Comprometidos com a excelência no atendimento e a proteção dos dados dos nossos pacientes, seguindo
                rigorosamente as diretrizes da Lei Geral de Proteção de Dados.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Segurança de Dados</h3>
                  <p className="text-slate-600 text-sm">
                    Criptografia de ponta a ponta e controles de acesso rigorosos para proteger informações sensíveis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Equipe Especializada</h3>
                  <p className="text-slate-600 text-sm">
                    Profissionais qualificados utilizando tecnologia avançada para melhor cuidado aos pacientes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Cuidado Humanizado</h3>
                  <p className="text-slate-600 text-sm">
                    Tecnologia que potencializa o cuidado humano, respeitando a dignidade e privacidade dos pacientes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container py-8 px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-900">Hospital Mario Degni</span>
              </div>
              <p className="text-sm text-slate-600">
                Hospital Municipal e Maternidade Prof. Mario Degni - Excelência em saúde pública.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">LGPD & Privacidade</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/privacy" className="hover:text-blue-600">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-600">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/data-rights" className="hover:text-blue-600">
                    Direitos dos Dados
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Suporte</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/help" className="hover:text-blue-600">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600">
                    Contato TI
                  </Link>
                </li>
                <li>
                  <Link href="/training" className="hover:text-blue-600">
                    Treinamentos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Contatos Importantes</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Psiquiatria PS Lapa: 48781724</li>
                <li>NIR PS Lapa: 48781703</li>
                <li>Clínica Médica: 48781700</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Hospital Municipal e Maternidade Prof. Mario Degni. Todos os direitos
              reservados.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-3 w-3 text-green-600" />
              <span>Sistema em conformidade com a LGPD - Lei nº 13.709/2018</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
