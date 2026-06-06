import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Calendar, 
  Clock, 
  DollarSign, 
  Download, 
  Filter, 
  MessageSquare, 
  MoreHorizontal, 
  Package, 
  Plus, 
  Settings, 
  Star, 
  TrendingUp, 
  Users,
  Gift,
  MessageCircle,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '@/utils/currency';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import WhatsAppChat from '@/components/WhatsAppChat';
import PromotionsManagement from '@/components/PromotionsManagement';
import TeamManagement from '@/components/TeamManagement';
import RestaurantSettings from '@/components/RestaurantSettings';
import OrderExport from '@/components/OrderExport';
import MenuManagement from '@/components/MenuManagement';
import Header from '@/components/Header';

const RestaurantDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [overviewOrderStatusFilter, setOverviewOrderStatusFilter] = useState('all');
  const [statsPeriodFilter, setStatsPeriodFilter] = useState('mes');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data para demonstração com formatação monetária brasileira
  const stats = {
    totalOrders: 127,
    totalRevenue: 2840.50,
    avgOrderValue: 22.36,
    pendingOrders: 8,
    deliveredOrders: 119,
    ifoodSavings: 426.08 // 15% de economia em taxas do iFood
  };

  // Mock data detalhado para os pedidos
  const detailedOrders = [
    {
      id: '#001',
      customer: 'João Silva',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      items: [
        { name: 'Pizza Margherita G', quantity: 1, unitPrice: 32.90, total: 32.90 },
        { name: 'Coca-Cola 350ml', quantity: 1, unitPrice: 3.00, total: 3.00 }
      ],
      value: 35.90,
      status: 'pending',
      time: '14:23',
      paymentMethod: 'PIX',
      paymentStatus: 'Pendente',
      notes: 'Sem cebola na pizza'
    },
    {
      id: '#002',
      customer: 'Maria Santos',
      phone: '(11) 88888-8888',
      address: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
      items: [
        { name: 'Hambúrguer Clássico', quantity: 1, unitPrice: 25.50, total: 25.50 },
        { name: 'Batata Frita', quantity: 1, unitPrice: 8.00, total: 8.00 }
      ],
      value: 33.50,
      status: 'preparing',
      time: '14:15',
      paymentMethod: 'Dinheiro',
      paymentStatus: 'Pago',
      notes: ''
    },
    {
      id: '#003',
      customer: 'Pedro Costa',
      phone: '(11) 77777-7777',
      address: 'Rua Augusta, 789 - Consolação, São Paulo - SP',
      items: [
        { name: 'Salada Caesar', quantity: 1, unitPrice: 15.90, total: 15.90 },
        { name: 'Água 500ml', quantity: 1, unitPrice: 3.00, total: 3.00 }
      ],
      value: 18.90,
      status: 'ready',
      time: '14:10',
      paymentMethod: 'Cartão de Débito',
      paymentStatus: 'Pago',
      notes: 'Molho à parte'
    },
    {
      id: '#004',
      customer: 'Ana Lima',
      phone: '(11) 66666-6666',
      address: 'Rua dos Três Irmãos, 321 - Vila Progredior, São Paulo - SP',
      items: [
        { name: 'Pizza Calabresa G', quantity: 1, unitPrice: 38.00, total: 38.00 },
        { name: 'Guaraná 350ml', quantity: 1, unitPrice: 4.00, total: 4.00 }
      ],
      value: 42.00,
      status: 'delivered',
      time: '13:45',
      paymentMethod: 'PIX',
      paymentStatus: 'Pago',
      notes: ''
    }
  ];

  const orders = detailedOrders.map(order => ({
    id: order.id,
    customer: order.customer,
    items: order.items.map(item => `${item.name}`).join(', '),
    total: formatCurrency(order.value),
    status: order.status,
    time: order.time,
    phone: order.phone
  }));

  const recentOrders = orders.slice(0, 5);

  const handleOrderClick = (orderId: string) => {
    const order = detailedOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsOrderModalOpen(true);
    }
  };

  const filteredOrders = orderStatusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderStatusFilter);

  const filteredOverviewOrders = overviewOrderStatusFilter === 'all' 
    ? recentOrders 
    : recentOrders.filter(order => order.status === overviewOrderStatusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pedido recebido';
      case 'preparing': return 'Em preparo';
      case 'ready': return 'Saiu para entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Mock data para gráficos
  const salesData = [
    { name: 'Seg', vendas: 120 },
    { name: 'Ter', vendas: 180 },
    { name: 'Qua', vendas: 150 },
    { name: 'Qui', vendas: 220 },
    { name: 'Sex', vendas: 280 },
    { name: 'Sáb', vendas: 350 },
    { name: 'Dom', vendas: 300 },
  ];

  const productData = [
    { name: 'Pizza', value: 45, color: '#f97316' },
    { name: 'Hambúrguer', value: 30, color: '#3b82f6' },
    { name: 'Salada', value: 15, color: '#10b981' },
    { name: 'Bebidas', value: 10, color: '#8b5cf6' },
  ];

  const handleSettingsClick = () => {
    setActiveTab('settings');
  };

  const handleLogoutClick = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  const getStatsLabel = (period: string) => {
    switch (period) {
      case 'hoje': return 'hoje';
      case 'semana': return 'nesta semana';
      case 'mes': return 'neste mês';
      default: return 'neste mês';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        restaurantName="📱 VelloZap"
        showCart={false}
        showSettingsDropdown={true}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogoutClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="menu">Cardápio</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="promotions">Promoções</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Period Filter */}
            <div className="flex justify-end">
              <Select value={statsPeriodFilter} onValueChange={setStatsPeriodFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards - Reorganized */}
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">+12% em relação {getStatsLabel(statsPeriodFilter)} passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">Necessitam atenção</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Entregues</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
                  <p className="text-xs text-muted-foreground">+15% em relação {getStatsLabel(statsPeriodFilter)} passado</p>
                </CardContent>
              </Card>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+8% em relação {getStatsLabel(statsPeriodFilter)} passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">+3% em relação {getStatsLabel(statsPeriodFilter)} passado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Economizado</CardTitle>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.ifoodSavings)}</div>
                  <p className="text-xs text-muted-foreground">Economia vs. taxas iFood</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <CardDescription>Últimos pedidos recebidos</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={overviewOrderStatusFilter} onValueChange={setOverviewOrderStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pedido recebido</SelectItem>
                      <SelectItem value="preparing">Em preparo</SelectItem>
                      <SelectItem value="ready">Saiu para entrega</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOverviewOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.items}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{order.total}</p>
                          <p className="text-sm text-gray-500">{order.time}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOrderClick(order.id)}
                        >
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendas da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="vendas" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Pedidos</CardTitle>
                  <CardDescription>Visualize e gerencie todos os pedidos</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pedido recebido</SelectItem>
                      <SelectItem value="preparing">Em preparo</SelectItem>
                      <SelectItem value="ready">Saiu para entrega</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                  <OrderExport orders={detailedOrders} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.items}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{order.total}</p>
                          <p className="text-sm text-gray-500">{order.time}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOrderClick(order.id)}
                        >
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <MenuManagement />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
            <WhatsAppChat />
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <PromotionsManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <RestaurantSettings />
          </TabsContent>
        </Tabs>
      </div>

      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
};

export default RestaurantDashboard;
