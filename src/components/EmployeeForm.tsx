
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';

interface Employee {
  id?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  payment_type: string;
  payment_value: number;
  pix_key: string;
  bank_name: string;
  agency: string;
  account: string;
}

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSave: () => void;
}

const EmployeeForm = ({ isOpen, onClose, employee, onSave }: EmployeeFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    payment_type: '',
    payment_value: 0,
    pix_key: '',
    bank_name: '',
    agency: '',
    account: ''
  });
  const [loading, setLoading] = useState(false);
  const { profile } = useRestaurantProfile();
  const { toast } = useToast();

  const roles = [
    { value: "auxiliar_cozinha", label: "Auxiliar de Cozinha" },
    { value: "atendente", label: "Atendente" },
    { value: "cozinheiro", label: "Cozinheiro" },
    { value: "chef", label: "Chef" },
    { value: "pizzaiolo", label: "Pizzaiolo" },
    { value: "motoboy", label: "Motoboy" }
  ];

  const paymentTypes = [
    { value: "daily", label: "Por diária" },
    { value: "hourly", label: "Por hora" },
    { value: "monthly", label: "Por mês (salário fixo)" }
  ];

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        role: employee.role || '',
        payment_type: employee.payment_type || '',
        // API integer cents → UI decimal BRL.
        payment_value: employee.payment_value ? employee.payment_value / 100 : 0,
        pix_key: employee.pix_key || '',
        bank_name: employee.bank_name || '',
        agency: employee.agency || '',
        account: employee.account || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        payment_type: '',
        payment_value: 0,
        pix_key: '',
        bank_name: '',
        agency: '',
        account: ''
      });
    }
  }, [employee]);

  const handleSave = async () => {
    if (!formData.name || !formData.role || !formData.payment_type || !formData.pix_key) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, função, forma de pagamento e chave PIX.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        role: formData.role,
        payment_type: formData.payment_type || null,
        // UI decimal BRL → API integer cents.
        payment_value: formData.payment_value ? Math.round(formData.payment_value * 100) : null,
        pix_key: formData.pix_key || null,
        bank_name: formData.bank_name || null,
        agency: formData.agency || null,
        account: formData.account || null,
      };
      if (employee?.id) {
        await apiClient.patch(`/employees/${employee.id}`, payload);
      } else {
        await apiClient.post('/employees', payload);
      }

      toast({
        title: employee ? "Funcionário atualizado" : "Funcionário adicionado",
        description: `${formData.name} foi ${employee ? 'atualizado' : 'adicionado'} com sucesso.`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o funcionário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentLabel = () => {
    switch (formData.payment_type) {
      case 'daily': return 'Valor da diária (R$)';
      case 'hourly': return 'Valor por hora (R$)';
      case 'monthly': return 'Salário mensal (R$)';
      default: return 'Valor (R$)';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Editar Funcionário' : 'Adicionar Funcionário'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Informações de Pagamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_type">Forma de Pagamento *</Label>
                <Select value={formData.payment_type} onValueChange={(value) => setFormData({ ...formData, payment_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_value">{getPaymentLabel()} *</Label>
                <Input
                  id="payment_value"
                  type="number"
                  step="0.01"
                  value={formData.payment_value}
                  onChange={(e) => setFormData({ ...formData, payment_value: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Dados Bancários</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX *</Label>
                <Input
                  id="pix_key"
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  placeholder="CPF, email, telefone ou chave aleatória"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Banco</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Nome do banco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agência</Label>
                  <Input
                    id="agency"
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    placeholder="0000-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Conta</Label>
                  <Input
                    id="account"
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    placeholder="00000-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
