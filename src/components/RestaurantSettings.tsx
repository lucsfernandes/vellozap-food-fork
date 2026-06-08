import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Clock, CreditCard, MapPin, MessageCircle, User, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoUpload from "@/components/LogoUpload";
import PaymentSettings from "@/components/PaymentSettings";
import PaymentFlow from "@/components/PaymentFlow";
import DeliveryZoneManager from "@/components/DeliveryZoneManager";
import { useRestaurantProfile } from "@/hooks/useRestaurantProfile";
import { useOperatingHours, type OperatingHourInput } from "@/hooks/useOperatingHours";

// day_of_week is 0=Monday..6=Sunday per the backend contract.
const DAY_LABELS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

interface RestaurantFormData {
  restaurant_name: string;
  responsible_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  whatsapp_number: string;
  delivery_radius: string;
}

const emptyFormData: RestaurantFormData = {
  restaurant_name: "",
  responsible_name: "",
  cnpj: "",
  email: "",
  phone: "",
  address: "",
  whatsapp_number: "",
  delivery_radius: "",
};

interface ScheduleRow {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const defaultSchedule: ScheduleRow[] = DAY_LABELS.map((_, index) => ({
  day_of_week: index,
  is_open: false,
  open_time: "",
  close_time: "",
}));

const RestaurantSettings = () => {
  const { profile, loading: profileLoading, updateProfile } = useRestaurantProfile();
  const { hours, loading: hoursLoading, saveHours } = useOperatingHours();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResponsibleEditOpen, setIsResponsibleEditOpen] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);

  const [formData, setFormData] = useState<RestaurantFormData>(emptyFormData);

  // Responsável: o backend só persiste `responsible_name`. Os demais campos
  // (CPF, foto, e-mail/telefone do responsável) não têm endpoint de persistência,
  // então ficam como estado local de UI (sem valores de demonstração).
  const [responsibleData, setResponsibleData] = useState({
    full_name: "",
    cpf: "",
    phone: "",
    email: "",
    photo: "",
  });

  const [operatingHours, setOperatingHours] = useState<ScheduleRow[]>(defaultSchedule);

  // TODO: não existe endpoint de persistência para formas de pagamento no backend.
  // Mantemos como estado local de UI (sem valores de demonstração) até que um
  // campo/endpoint dedicado exista no serviço.
  const [paymentMethods, setPaymentMethods] = useState({
    pix: false,
    money: false,
    credit: false,
    debit: false,
  });

  const { toast } = useToast();

  // Inicializa o formulário a partir do perfil real do restaurante.
  useEffect(() => {
    if (profile) {
      setFormData({
        restaurant_name: profile.restaurant_name ?? "",
        responsible_name: profile.responsible_name ?? "",
        cnpj: profile.cnpj ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        whatsapp_number: profile.whatsapp_number ?? "",
        delivery_radius: profile.delivery_radius ?? "",
      });
      setResponsibleData((prev) => ({
        ...prev,
        full_name: profile.responsible_name ?? "",
      }));
    }
  }, [profile]);

  // Carrega os horários de funcionamento do backend, completando os 7 dias.
  useEffect(() => {
    const next = defaultSchedule.map((row) => {
      const match = hours.find((h) => h.day_of_week === row.day_of_week);
      if (!match) return row;
      return {
        day_of_week: row.day_of_week,
        is_open: match.is_open,
        open_time: match.open_time ?? "",
        close_time: match.close_time ?? "",
      };
    });
    setOperatingHours(next);
  }, [hours]);

  const handleSaveRestaurantInfo = async () => {
    setIsSavingInfo(true);
    const ok = await updateProfile({
      restaurant_name: formData.restaurant_name,
      responsible_name: formData.responsible_name || null,
      cnpj: formData.cnpj || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      whatsapp_number: formData.whatsapp_number || null,
      delivery_radius: formData.delivery_radius || null,
    });
    setIsSavingInfo(false);
    if (ok) {
      setIsEditDialogOpen(false);
    }
  };

  const handleSaveResponsibleInfo = async () => {
    // Apenas `responsible_name` é persistido; os demais campos são locais.
    const ok = await updateProfile({
      responsible_name: responsibleData.full_name || null,
    });
    if (ok) {
      setFormData((prev) => ({ ...prev, responsible_name: responsibleData.full_name }));
      setIsResponsibleEditOpen(false);
    }
  };

  const handleSaveWhatsapp = async () => {
    await updateProfile({ whatsapp_number: formData.whatsapp_number || null });
  };

  const handleSaveDeliveryRadius = async (value: string) => {
    setFormData({ ...formData, delivery_radius: value });
    await updateProfile({ delivery_radius: value || null });
  };

  const handleOperatingHourChange = (
    index: number,
    field: "is_open" | "open_time" | "close_time",
    value: string | boolean,
  ) => {
    const updatedHours = [...operatingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOperatingHours(updatedHours);
  };

  const handleSaveOperatingHours = async () => {
    setIsSavingHours(true);
    const body: OperatingHourInput[] = operatingHours.map((row) => ({
      day_of_week: row.day_of_week,
      is_open: row.is_open,
      open_time: row.is_open ? row.open_time || null : null,
      close_time: row.is_open ? row.close_time || null : null,
    }));
    await saveHours(body);
    setIsSavingHours(false);
  };

  const handlePaymentMethodChange = (method: string, enabled: boolean) => {
    setPaymentMethods({ ...paymentMethods, [method]: enabled });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResponsibleData({ ...responsibleData, photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const responsibleInitials = responsibleData.full_name
    ? responsibleData.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="operations">Operação</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="payment-flow">Fluxo de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <LogoUpload />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Informações do Restaurante
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome do Restaurante</p>
                    <p className="text-lg">{formData.restaurant_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome do Responsável</p>
                    <p className="text-lg">{formData.responsible_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CNPJ</p>
                    <p className="text-lg">{formData.cnpj || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-mail</p>
                    <p className="text-lg">{formData.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone</p>
                    <p className="text-lg">{formData.phone || "—"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Endereço</p>
                    <p className="text-lg">{formData.address || "—"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nova seção: Informações do Responsável */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-orange-600" />
                  <span>Informações do Responsável</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResponsibleEditOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={responsibleData.photo} alt="Foto do responsável" />
                    <AvatarFallback className="text-lg">{responsibleInitials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                    <p className="text-lg">{responsibleData.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="text-lg">{responsibleData.cpf || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone</p>
                    <p className="text-lg">{responsibleData.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-mail</p>
                    <p className="text-lg">{responsibleData.email || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-orange-600" />
                <span>Integração WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp_business">Número do WhatsApp Business</Label>
                  <Input
                    id="whatsapp_business"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    onBlur={handleSaveWhatsapp}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Como conectar a API do WhatsApp</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Para integrar completamente com o WhatsApp Business, siga estes passos:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Crie uma conta WhatsApp Business API</li>
                    <li>Configure um provedor oficial (ex: 360Dialog, Z-API)</li>
                    <li>Obtenha suas credenciais de API</li>
                    <li>Configure os webhooks para receber mensagens</li>
                  </ol>
                  <p className="text-xs text-blue-600 mt-3">
                    * A integração completa será disponibilizada em breve
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Horário de Funcionamento</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveOperatingHours}
                  disabled={isSavingHours || hoursLoading}
                >
                  {isSavingHours ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hoursLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {operatingHours.map((schedule, index) => (
                    <div key={schedule.day_of_week} className="flex items-center space-x-4">
                      <div className="w-32">
                        <span className="text-sm font-medium">{DAY_LABELS[schedule.day_of_week]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={schedule.is_open}
                          onChange={(e) => handleOperatingHourChange(index, "is_open", e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Aberto</span>
                      </div>
                      {schedule.is_open && (
                        <>
                          <Input
                            type="time"
                            value={schedule.open_time}
                            onChange={(e) => handleOperatingHourChange(index, "open_time", e.target.value)}
                            className="w-32"
                          />
                          <span>às</span>
                          <Input
                            type="time"
                            value={schedule.close_time}
                            onChange={(e) => handleOperatingHourChange(index, "close_time", e.target.value)}
                            className="w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <span>Formas de Pagamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.pix}
                    onChange={(e) => handlePaymentMethodChange("pix", e.target.checked)}
                    className="rounded"
                  />
                  <span>PIX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.money}
                    onChange={(e) => handlePaymentMethodChange("money", e.target.checked)}
                    className="rounded"
                  />
                  <span>Dinheiro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.credit}
                    onChange={(e) => handlePaymentMethodChange("credit", e.target.checked)}
                    className="rounded"
                  />
                  <span>Cartão de Crédito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.debit}
                    onChange={(e) => handlePaymentMethodChange("debit", e.target.checked)}
                    className="rounded"
                  />
                  <span>Cartão de Débito</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * A persistência das formas de pagamento será disponibilizada em breve.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span>Configuração de Entrega</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Configuração básica de raio (mantida para compatibilidade) */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="delivery_radius">Raio Máximo de Entrega (Configuração Simples)</Label>
                    <Select
                      value={formData.delivery_radius}
                      onValueChange={handleSaveDeliveryRadius}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o raio de entrega" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5km">Até 5km</SelectItem>
                        <SelectItem value="10km">Até 10km</SelectItem>
                        <SelectItem value="15km">Até 15km</SelectItem>
                        <SelectItem value="20km">Até 20km</SelectItem>
                        <SelectItem value="30km">Até 30km</SelectItem>
                        <SelectItem value="50km">Até 50km</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configuração básica ou use o sistema avançado abaixo
                    </p>
                  </div>
                </div>

                {/* Divisor */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Sistema Avançado de Entrega por CEP</h3>
                  <DeliveryZoneManager />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSettings />
        </TabsContent>

        <TabsContent value="payment-flow">
          <PaymentFlow />
        </TabsContent>
      </Tabs>

      {/* Modal para editar informações do restaurante */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Informações do Restaurante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant_name">Nome do Restaurante *</Label>
                <Input
                  id="restaurant_name"
                  value={formData.restaurant_name}
                  onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible_name">Nome do Responsável *</Label>
                <Input
                  id="responsible_name"
                  value={formData.responsible_name}
                  onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro - cidade, estado"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="flex-1"
              disabled={isSavingInfo}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRestaurantInfo}
              disabled={isSavingInfo || !formData.restaurant_name.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isSavingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar informações do responsável */}
      <Dialog open={isResponsibleEditOpen} onOpenChange={setIsResponsibleEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Informações do Responsável</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={responsibleData.photo} alt="Foto do responsável" />
                <AvatarFallback className="text-lg">{responsibleInitials}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Alterar Foto</span>
                  </Button>
                </Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={responsibleData.full_name}
                  onChange={(e) => setResponsibleData({ ...responsibleData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={responsibleData.cpf}
                  onChange={(e) => setResponsibleData({ ...responsibleData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resp_phone">Telefone *</Label>
                <Input
                  id="resp_phone"
                  value={responsibleData.phone}
                  onChange={(e) => setResponsibleData({ ...responsibleData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resp_email">E-mail *</Label>
                <Input
                  id="resp_email"
                  type="email"
                  value={responsibleData.email}
                  onChange={(e) => setResponsibleData({ ...responsibleData, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsResponsibleEditOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveResponsibleInfo} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantSettings;
