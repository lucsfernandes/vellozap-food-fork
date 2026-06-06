
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { Clock, MapPin, Phone, Building } from 'lucide-react';

interface RestaurantInfoStepProps {
  onValidChange: (isValid: boolean) => void;
}

const RestaurantInfoStep = ({ onValidChange }: RestaurantInfoStepProps) => {
  const { profile, updateProfile } = useRestaurantProfile();
  const [formData, setFormData] = useState({
    restaurant_name: '',
    responsible_name: '',
    phone: '',
    email: '',
    address: '',
    delivery_type: 'delivery',
    delivery_radius: '10km'
  });

  const [operatingHours] = useState([
    { day: 'Segunda-feira', open: '18:00', close: '23:00', isOpen: true },
    { day: 'Terça-feira', open: '18:00', close: '23:00', isOpen: true },
    { day: 'Quarta-feira', open: '18:00', close: '23:00', isOpen: true },
    { day: 'Quinta-feira', open: '18:00', close: '23:00', isOpen: true },
    { day: 'Sexta-feira', open: '18:00', close: '23:00', isOpen: true },
    { day: 'Sábado', open: '18:00', close: '23:00', isOpen: true },
    { day: 'Domingo', open: '18:00', close: '23:00', isOpen: false }
  ]);

  useEffect(() => {
    if (profile) {
      setFormData({
        restaurant_name: profile.restaurant_name || '',
        responsible_name: profile.responsible_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
        delivery_type: profile.delivery_type || 'delivery',
        delivery_radius: profile.delivery_radius || '10km'
      });
    }
  }, [profile]);

  useEffect(() => {
    const isValid = formData.restaurant_name.trim() !== '' && 
                   formData.responsible_name.trim() !== '' &&
                   formData.phone.trim() !== '';
    onValidChange(isValid);

    // Auto-save changes
    if (isValid) {
      const timeoutId = setTimeout(() => {
        updateProfile(formData);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, onValidChange, updateProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-orange-600" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant_name">Nome do Restaurante *</Label>
              <Input
                id="restaurant_name"
                value={formData.restaurant_name}
                onChange={(e) => handleInputChange('restaurant_name', e.target.value)}
                placeholder="Ex: Pizzaria do João"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsible_name">Nome do Responsável *</Label>
              <Input
                id="responsible_name"
                value={formData.responsible_name}
                onChange={(e) => handleInputChange('responsible_name', e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@restaurante.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número, bairro, cidade, estado, CEP"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span>Tipo de Atendimento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Delivery</Label>
              <Select value={formData.delivery_type} onValueChange={(value) => handleInputChange('delivery_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Retirada</SelectItem>
                  <SelectItem value="both">Delivery e Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Raio de Entrega</Label>
              <Select value={formData.delivery_radius} onValueChange={(value) => handleInputChange('delivery_radius', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5km">Até 5km</SelectItem>
                  <SelectItem value="10km">Até 10km</SelectItem>
                  <SelectItem value="15km">Até 15km</SelectItem>
                  <SelectItem value="20km">Até 20km</SelectItem>
                  <SelectItem value="30km">Até 30km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Horário de Funcionamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operatingHours.map((schedule, index) => (
              <div key={schedule.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="w-32">
                  <span className="text-sm font-medium">{schedule.day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {schedule.isOpen ? (
                    <>
                      <span className="text-sm">{schedule.open} às {schedule.close}</span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Aberto</span>
                    </>
                  ) : (
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">Fechado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Você pode ajustar os horários detalhadamente nas configurações mais tarde.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantInfoStep;
