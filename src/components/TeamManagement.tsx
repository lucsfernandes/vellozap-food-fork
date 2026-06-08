import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Users, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";
import { useEmployees, type Employee } from "@/hooks/useEmployees";
import EmployeeForm from "./EmployeeForm";
import WorkRecordForm from "./WorkRecordForm";
import PaymentControl from "./PaymentControl";

const TeamManagement = () => {
  const { employees, loading, refetch, removeEmployee } = useEmployees();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWorkRecordOpen, setIsWorkRecordOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();

  const roles = [
    { value: "auxiliar_cozinha", label: "Auxiliar de Cozinha" },
    { value: "atendente", label: "Atendente" },
    { value: "cozinheiro", label: "Cozinheiro" },
    { value: "chef", label: "Chef" },
    { value: "pizzaiolo", label: "Pizzaiolo" },
    { value: "motoboy", label: "Motoboy" }
  ];

  const getRoleLabel = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      chef: "bg-purple-100 text-purple-800",
      cozinheiro: "bg-blue-100 text-blue-800",
      pizzaiolo: "bg-orange-100 text-orange-800",
      auxiliar_cozinha: "bg-green-100 text-green-800",
      atendente: "bg-yellow-100 text-yellow-800",
      motoboy: "bg-red-100 text-red-800"
    };
    return colorMap[role] || "bg-gray-100 text-gray-800";
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Por diária';
      case 'hourly': return 'Por hora';
      case 'monthly': return 'Mensal';
      default: return type;
    }
  };

  const filteredEmployees = roleFilter === "all" 
    ? employees 
    : employees.filter(emp => emp.role === roleFilter);

  const handleRefreshEmployees = () => {
    void refetch();
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleWorkRecord = (employee: Employee) => {
    if (!employee.payment_type) {
      toast({
        title: "Funcionário sem forma de pagamento",
        description: "Configure primeiro a forma de pagamento deste funcionário.",
        variant: "destructive",
      });
      return;
    }
    setSelectedEmployee(employee);
    setIsWorkRecordOpen(true);
  };

  const handleDelete = async (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    const success = await removeEmployee(id);
    if (success) {
      toast({
        title: "Funcionário removido",
        description: `${employee?.name} foi removido da equipe.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team">Gerenciar Equipe</TabsTrigger>
          <TabsTrigger value="payments">Controle de Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-orange-600" />
                  <span>Equipe</span>
                </div>
                <div className="flex space-x-4">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Todas as funções" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as funções</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Funcionário
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="p-12 text-center text-gray-500">
                  Carregando equipe...
                </div>
              )}
              {!loading && (
              <>
              <div className="grid gap-4">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{employee.name}</h3>
                          <Badge className={getRoleBadgeColor(employee.role)}>
                            {getRoleLabel(employee.role)}
                          </Badge>
                          {employee.payment_type && (
                            <Badge variant="outline">
                              {getPaymentTypeLabel(employee.payment_type)}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {employee.email && <p>📧 {employee.email}</p>}
                          {employee.phone && <p>📱 {employee.phone}</p>}
                          {employee.payment_value != null && employee.payment_type && (
                            <p>💰 {getPaymentTypeLabel(employee.payment_type)}: {formatCurrency(employee.payment_value / 100)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {employee.payment_type && employee.payment_type !== 'monthly' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWorkRecord(employee)}
                            title="Registrar trabalho"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum funcionário encontrado</h3>
                  <p className="text-gray-600 mb-4">
                    {roleFilter === "all"
                      ? "Adicione funcionários à sua equipe."
                      : "Não há funcionários com essa função."
                    }
                  </p>
                  {roleFilter !== "all" && (
                    <Button variant="outline" onClick={() => setRoleFilter("all")}>
                      Ver todos
                    </Button>
                  )}
                </div>
              )}
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentControl />
        </TabsContent>
      </Tabs>

      <EmployeeForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleRefreshEmployees}
      />

      <EmployeeForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee ? {
          id: selectedEmployee.id,
          name: selectedEmployee.name,
          role: selectedEmployee.role,
          email: selectedEmployee.email ?? '',
          phone: selectedEmployee.phone ?? '',
          payment_type: selectedEmployee.payment_type ?? '',
          payment_value: selectedEmployee.payment_value ?? 0,
          pix_key: selectedEmployee.pix_key ?? '',
          bank_name: selectedEmployee.bank_name ?? '',
          agency: selectedEmployee.agency ?? '',
          account: selectedEmployee.account ?? '',
        } : null}
        onSave={handleRefreshEmployees}
      />

      {selectedEmployee && (
        <WorkRecordForm
          isOpen={isWorkRecordOpen}
          onClose={() => {
            setIsWorkRecordOpen(false);
            setSelectedEmployee(null);
          }}
          employee={{
            id: selectedEmployee.id,
            name: selectedEmployee.name,
            payment_type: selectedEmployee.payment_type ?? '',
          }}
          onSave={handleRefreshEmployees}
        />
      )}
    </div>
  );
};

export default TeamManagement;
