
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { Plus, Trash2, Users, UserCheck } from 'lucide-react';

interface Employee {
  id?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  payment_type: string;
  payment_value: number;
  pix_key: string;
}

interface TeamStepProps {
  onValidChange: (isValid: boolean) => void;
}

const TeamStep = ({ onValidChange }: TeamStepProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useRestaurantProfile();
  const { toast } = useToast();

  useEffect(() => {
    // Esta etapa é opcional, sempre permite prosseguir
    onValidChange(true);
    loadExistingEmployees();
  }, [onValidChange, profile]);

  const loadExistingEmployees = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('restaurant_id', profile.id);

      if (error) {
        console.error('Error loading employees:', error);
        return;
      }

      if (data && data.length > 0) {
        setEmployees(data.map(emp => ({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          phone: emp.phone || '',
          email: emp.email || '',
          payment_type: emp.payment_type || '',
          payment_value: emp.payment_value || 0,
          pix_key: emp.pix_key || ''
        })));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const addEmployee = () => {
    setEmployees([...employees, { 
      name: '', 
      role: 'atendente', 
      phone: '', 
      email: '', 
      payment_type: '',
      payment_value: 0,
      pix_key: ''
    }]);
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const updateEmployee = (index: number, field: keyof Employee, value: string | number) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = { ...updatedEmployees[index], [field]: value };
    setEmployees(updatedEmployees);
  };

  const saveEmployees = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const validEmployees = employees.filter(emp => emp.name.trim() !== '');

      for (const employee of validEmployees) {
        if (employee.id) {
          // Update existing employee
          await supabase
            .from('employees')
            .update({
              name: employee.name,
              role: employee.role,
              phone: employee.phone || null,
              email: employee.email || null,
              payment_type: employee.payment_type || null,
              payment_value: employee.payment_value || null,
              pix_key: employee.pix_key || null
            })
            .eq('id', employee.id);
        } else {
          // Create new employee
          await supabase
            .from('employees')
            .insert({
              restaurant_id: profile.id,
              name: employee.name,
              role: employee.role,
              phone: employee.phone || null,
              email: employee.email || null,
              payment_type: employee.payment_type || null,
              payment_value: employee.payment_value || null,
              pix_key: employee.pix_key || null
            });
        }
      }

      toast({
        title: "Equipe salva!",
        description: "Os membros da equipe foram adicionados com sucesso.",
      });
    } catch (error) {
      console.error('Error saving employees:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a equipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'gerente', label: 'Gerente' },
    { value: 'atendente', label: 'Atendente' },
    { value: 'cozinheiro', label: 'Cozinheiro' },
    { value: 'motoboy', label: 'Motoboy' },
    { value: 'caixa', label: 'Caixa' },
    { value: 'pizzaiolo', label: 'Pizzaiolo' },
    { value: 'auxiliar_cozinha', label: 'Auxiliar de Cozinha' }
  ];

  const paymentTypes = [
    { value: "daily", label: "Por diária" },
    { value: "hourly", label: "Por hora" },
    { value: "monthly", label: "Por mês (salário fixo)" }
  ];

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Valor da diária (R$)';
      case 'hourly': return 'Valor por hora (R$)';
      case 'monthly': return 'Salário mensal (R$)';
      default: return 'Valor (R$)';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span>Configurar Equipe (Opcional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Esta etapa é opcional</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Você pode adicionar membros da sua equipe agora ou fazer isso mais tarde nas configurações.
                  Isso ajuda a organizar responsabilidades e controlar acessos.
                </p>
              </div>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum membro adicionado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro membro da sua equipe
              </p>
              <Button onClick={addEmployee} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Membro
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Membro {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmployee(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input
                        value={employee.name}
                        onChange={(e) => updateEmployee(index, 'name', e.target.value)}
                        placeholder="Nome do funcionário"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cargo/Função</Label>
                      <Select 
                        value={employee.role} 
                        onValueChange={(value) => updateEmployee(index, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={employee.phone}
                        onChange={(e) => updateEmployee(index, 'phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={employee.email}
                        onChange={(e) => updateEmployee(index, 'email', e.target.value)}
                        placeholder="funcionario@email.com"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3 text-sm">Informações de Pagamento (Opcional)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <Select 
                          value={employee.payment_type} 
                          onValueChange={(value) => updateEmployee(index, 'payment_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {employee.payment_type && (
                        <div className="space-y-2">
                          <Label>{getPaymentLabel(employee.payment_type)}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={employee.payment_value}
                            onChange={(e) => updateEmployee(index, 'payment_value', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                          />
                        </div>
                      )}
                      
                      {employee.payment_type && (
                        <div className="space-y-2">
                          <Label>Chave PIX</Label>
                          <Input
                            value={employee.pix_key}
                            onChange={(e) => updateEmployee(index, 'pix_key', e.target.value)}
                            placeholder="CPF, email ou telefone"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={addEmployee}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Membro</span>
                </Button>
                
                <Button
                  onClick={saveEmployees}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? 'Salvando...' : 'Salvar Equipe'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">💼 Benefícios de cadastrar sua equipe:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Controle de responsabilidades por área</li>
          <li>• Controle de pagamentos e registros de trabalho</li>
          <li>• Histórico de ações por funcionário</li>
          <li>• Facilita a organização interna e contábil</li>
          <li>• Exportação de relatórios para contabilidade</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamStep;
