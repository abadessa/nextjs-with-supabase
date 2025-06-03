import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Shield, Eye, Lock, Users } from "lucide-react"

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200">
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
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidade</h1>
            <p className="text-slate-600">Hospital Municipal e Maternidade Prof. Mario Degni - Sistema UTI Digital</p>
            <p className="text-sm text-slate-500 mt-2">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Compromisso com a LGPD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  O Hospital Municipal e Maternidade Prof. Mario Degni está comprometido com a proteção dos dados
                  pessoais e sensíveis de pacientes, profissionais e usuários, em conformidade com a Lei Geral de
                  Proteção de Dados (Lei nº 13.709/2018).
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>Base Legal:</strong> O tratamento de dados pessoais sensíveis de saúde é realizado com base
                    no Art. 11, II, alínea "a" da LGPD, para finalidades de assistência à saúde e proteção da vida.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Dados Coletados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Dados de Pacientes</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Nome e identificação</li>
                      <li>• Dados clínicos e diagnósticos</li>
                      <li>• Medicações e procedimentos</li>
                      <li>• Sinais vitais e exames</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Dados de Usuários</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Credenciais de acesso</li>
                      <li>• Logs de atividade</li>
                      <li>• Registros de auditoria</li>
                      <li>• Dados de navegação</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-600" />
                  Finalidades do Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Assistência à Saúde</h4>
                      <p className="text-sm text-slate-600">
                        Prestação de cuidados médicos, passagem de plantão e continuidade do tratamento.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Segurança do Paciente</h4>
                      <p className="text-sm text-slate-600">
                        Monitoramento de condições clínicas e prevenção de eventos adversos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Gestão Hospitalar</h4>
                      <p className="text-sm text-slate-600">
                        Organização de leitos, recursos e planejamento assistencial.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  Seus Direitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Direitos do Titular</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Confirmação da existência de tratamento</li>
                      <li>• Acesso aos dados pessoais</li>
                      <li>• Correção de dados incompletos</li>
                      <li>• Portabilidade dos dados</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">Como Exercer</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Email: dpo@mariodegni.sp.gov.br</li>
                      <li>• Telefone: (11) 3000-0000</li>
                      <li>• Presencialmente na recepção</li>
                      <li>• Portal do paciente online</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medidas de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Lock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-slate-900 mb-1">Criptografia</h4>
                    <p className="text-xs text-slate-600">Dados protegidos com criptografia de ponta a ponta</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Shield className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-slate-900 mb-1">Controle de Acesso</h4>
                    <p className="text-xs text-slate-600">Acesso restrito apenas a profissionais autorizados</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Eye className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-slate-900 mb-1">Auditoria</h4>
                    <p className="text-xs text-slate-600">Monitoramento contínuo de todas as atividades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Encarregado de Proteção de Dados (DPO)</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      <p className="text-sm text-slate-600">
                        <strong>Email:</strong> dpo@mariodegni.sp.gov.br
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>Telefone:</strong> (11) 3000-0000
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      Para dúvidas sobre esta política ou exercício de direitos, entre em contato conosco. Responderemos
                      em até 15 dias úteis conforme previsto na LGPD.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container py-4 px-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Hospital Municipal e Maternidade Prof. Mario Degni
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Heart className="h-3 w-3 text-blue-600" />
              <span>Política de Privacidade em conformidade com a LGPD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
