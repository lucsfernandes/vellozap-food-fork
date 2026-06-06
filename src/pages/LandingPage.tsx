import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle, MessageCircle, Users, TrendingUp, Star, Menu, X, Smartphone, Clock, Zap, FileText, Gift, UserCheck, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    restaurant: "",
    preferWhatsapp: ""
  });
  const { toast } = useToast();

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a success message. In production, this would save to backend
    console.log("Demo request:", demoForm);
    toast({
      title: "Solicitação enviada!",
      description: "Entraremos em contato em breve para agendar sua demonstração.",
    });
    setIsDemoModalOpen(false);
    setDemoForm({ name: "", whatsapp: "", email: "", restaurant: "", preferWhatsapp: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">📱 VelloZap</div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors">Recursos</a>
              <a href="#pricing" className="text-gray-700 hover:text-orange-600 transition-colors">Planos</a>
              <a href="#integrations" className="text-gray-700 hover:text-orange-600 transition-colors">Integrações</a>
              <a href="#testimonials" className="text-gray-700 hover:text-orange-600 transition-colors">Depoimentos</a>
              <Link to="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">Contato</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Cadastrar
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700">Recursos</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700">Planos</a>
              <a href="#integrations" className="block px-3 py-2 text-gray-700">Integrações</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700">Depoimentos</a>
              <Link to="/contact" className="block px-3 py-2 text-gray-700">Contato</Link>
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Entrar</Button>
                </Link>
                <Link to="/auth">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-orange-100 text-orange-800">
            📱 100% via WhatsApp - Sem app para o cliente!
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme seu <span className="text-orange-600">delivery</span> com pedidos direto no WhatsApp
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Seus clientes fazem pedidos 100% via WhatsApp - rápido, direto e familiar. 
            Sem necessidade de baixar apps ou acessar links complexos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4">
                Cadastrar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Solicitar Demonstração
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Solicitar Demonstração</DialogTitle>
                  <DialogDescription>
                    Preencha seus dados e entraremos em contato para agendar uma demonstração personalizada.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-name">Nome</Label>
                    <Input
                      id="demo-name"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-whatsapp">WhatsApp</Label>
                    <Input
                      id="demo-whatsapp"
                      value={demoForm.whatsapp}
                      onChange={(e) => setDemoForm({...demoForm, whatsapp: e.target.value})}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-email">E-mail</Label>
                    <Input
                      id="demo-email"
                      type="email"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({...demoForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-restaurant">Nome do Restaurante</Label>
                    <Input
                      id="demo-restaurant"
                      value={demoForm.restaurant}
                      onChange={(e) => setDemoForm({...demoForm, restaurant: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-prefer">Prefere ser contatado via WhatsApp?</Label>
                    <Select value={demoForm.preferWhatsapp} onValueChange={(value) => setDemoForm({...demoForm, preferWhatsapp: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                    Solicitar Demonstração
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que seus clientes vão preferir o WhatsApp?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              <strong>Pedidos 100% via WhatsApp</strong> – o cliente realiza todo o processo sem baixar app.
              Comunicação rápida, direta e familiar - exatamente como o público brasileiro 
              gosta de fazer pedidos de delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">100% via WhatsApp</CardTitle>
                <CardDescription>
                  Seus clientes fazem pedidos direto no WhatsApp. Sem app para baixar, 
                  sem cadastros complicados, sem barreiras.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Comunicação Direta</CardTitle>
                <CardDescription>
                  Atualizações de status em tempo real via WhatsApp. Seus clientes 
                  sempre sabem quando o pedido está pronto.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Gestão Inteligente</CardTitle>
                <CardDescription>
                  Dashboard completo para gerenciar pedidos, cardápio e relatórios. 
                  Tecnologia avançada com simplicidade para o cliente.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Menu Exclusivo</CardTitle>
                <CardDescription>
                  Cardápio online com URL própria para seus clientes navegarem 
                  e fazerem pedidos facilmente.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Promoções</CardTitle>
                <CardDescription>
                  Crie promoções e envie para os clientes com descontos 
                  automáticos via WhatsApp.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Gestão de Pessoas (Mini-RH)</CardTitle>
                <CardDescription>
                  Controle completo de colaboradores e pagamentos, 
                  tudo integrado ao seu sistema.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Exportação de Relatórios</CardTitle>
                <CardDescription>
                  Relatórios completos de vendas e RH para sua contabilidade, 
                  em PDF e CSV.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integrações que fazem a diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnologias integradas que criam uma experiência completa e automatizada 
              para pequenos restaurantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <CardDescription>
                  Pedidos automatizados e envio de atualizações de status diretamente 
                  para o cliente via WhatsApp.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Pix</CardTitle>
                <CardDescription>
                  Integração completa com Pix para pagamentos simples, rápidos 
                  e seguros direto pelo WhatsApp.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Dashboard Online</CardTitle>
                <CardDescription>
                  Painel completo de controle acessível de qualquer lugar, 
                  sem necessidade de instalar aplicativos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Supabase</CardTitle>
                <CardDescription>
                  Tecnologia de ponta para garantir segurança, performance 
                  e confiabilidade da sua operação.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planos flexíveis que crescem com seu restaurante. Comece hoje mesmo!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Básico</CardTitle>
                <div className="text-4xl font-bold text-orange-600 mt-4">
                  R$ 89,90
                  <span className="text-lg text-gray-500 font-normal">/mês</span>
                </div>
                <CardDescription className="mt-4">
                  Perfeito para começar com delivery via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dashboard básico</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Comunicação via WhatsApp</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pedidos via Dashboard</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Filtros de pedidos por status</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Exportação de pedidos em CSV</span>
                  </li>
                </ul>
                <Link to="/auth" className="block mt-8">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Começar Agora
                  </Button>
                </Link>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">Setup inicial: R$ 149,90</p>
                </div>
              </CardContent>
            </Card>

            {/* Plano Pro */}
            <Card className="border-2 border-orange-500 shadow-lg hover:shadow-xl transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-4 py-1">Mais Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-orange-600 mt-4">
                  R$ 129,90
                  <span className="text-lg text-gray-500 font-normal">/mês</span>
                </div>
                <CardDescription className="mt-4">
                  Para restaurantes que querem automatizar processos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4 font-semibold">
                  Tudo do Básico, mais:
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Integração WhatsApp Business</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cadastro de equipe e gerenciamento</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Promoções via WhatsApp</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Gestão de cardápio completa</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Exportação PDF e CSV</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mini-Analytics com relatórios</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Personalização de logo</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Configuração de raio e horários</span>
                  </li>
                </ul>
                <Link to="/auth" className="block mt-8">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Começar Agora
                  </Button>
                </Link>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">Setup inicial: R$ 149,90</p>
                </div>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-orange-600 mt-4">
                  A consultar
                </div>
                <CardDescription className="mt-4">
                  Para redes de restaurantes e operações avançadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4 font-semibold">
                  Tudo do Pro, mais:
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Módulo Mini-RH completo</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Até 10 usuários (multi-usuário)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multi-lojas para redes</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Gestão avançada de pessoas</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Relatórios financeiros e RH</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Suporte dedicado</span>
                  </li>
                </ul>
                <Link to="/contact" className="block mt-8">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Entrar em Contato
                  </Button>
                </Link>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">Consulte condições especiais</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que escolher o VelloZap?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Familiar para seus clientes</h3>
                    <p className="text-orange-100">WhatsApp é o app mais usado no Brasil - seus clientes já sabem usar.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Sem taxas por venda</h3>
                    <p className="text-orange-100">Pague apenas o plano mensal, sem comissões por vendas realizadas.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Suporte especializado</h3>
                    <p className="text-orange-100">Equipe especializada em delivery sempre pronta para ajudar.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Atualizações automáticas</h3>
                    <p className="text-orange-100">Novas funcionalidades incluídas automaticamente no seu plano.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
                <p className="mb-6">Junte-se a mais de 1.000 restaurantes que já transformaram seu delivery.</p>
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                    Cadastrar Agora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-lg">
                  "Nossos clientes adoraram fazer pedidos pelo WhatsApp! As vendas aumentaram 40% em 2 meses."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-orange-600">JS</span>
                  </div>
                  <div>
                    <p className="font-semibold">João Silva</p>
                    <p className="text-sm text-gray-500">Pizzaria Bella Vista</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-lg">
                  "Muito mais prático! Nossos clientes não precisam baixar app, fazem tudo pelo WhatsApp mesmo."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-orange-600">MS</span>
                  </div>
                  <div>
                    <p className="font-semibold">Maria Santos</p>
                    <p className="text-sm text-gray-500">Burger House</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-lg">
                  "A integração com WhatsApp é perfeita. Conseguimos organizar melhor nossos pedidos."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-orange-600">PC</span>
                  </div>
                  <div>
                    <p className="font-semibold">Pedro Costa</p>
                    <p className="text-sm text-gray-500">Sushi Express</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para revolucionar seu delivery?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Comece hoje mesmo e veja seus clientes fazendo pedidos direto no WhatsApp.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4">
              Cadastrar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-orange-600 mb-4">📱 VelloZap</div>
              <p className="text-gray-400">
                A plataforma completa para delivery via WhatsApp.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VelloZap. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
