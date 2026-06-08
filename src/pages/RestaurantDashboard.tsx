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
import { useOrders, type StatsPeriod, type OrderStatus, type OrderDetailed } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import WhatsAppChat from '@/components/WhatsAppChat';
import PromotionsManagement from '@/components/PromotionsManagement';
import TeamManagement from '@/components/TeamManagement';
import RestaurantSettings from '@/components/RestaurantSettings';
import OrderExport from '@/components/OrderExport';
import MenuManagement from '@/components/MenuManagement';
import Header from '@/components/Header';

const weekdayFormat = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const RestaurantDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailed | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [overviewOrderStatusFilter, setOverviewOrderStatusFilter] = useState('all');
  const [statsPeriodFilter, setStatsPeriodFilter] = useState('mes');
  const [activeTab, setActiveTab] = useState('overview');

  const { signOut } = useAuth();
  const {
    orders: apiOrders,
    stats: apiStats,
    getOrder,
    exportOrders,
  } = useOrders(statsPeriodFilter as StatsPeriod);

  // Stats from the backend (money fields arrive as integer cents → reais).
  const stats = {
    totalOrders: apiStats?.totalOrders ?? 0,
    totalRevenue: (apiStats?.totalRevenue ?? 0) / 100,
    avgOrderValue: (apiStats?.avgOrderValue ?? 0) / 100,
    pendingOrders: apiStats?.pendingOrders ?? 0,
    deliveredOrders: apiStats?.deliveredOrders ?? 0,
    // Estimated savings vs. iFood's ~15% commission, derived from real revenue.
    ifoodSavings: ((apiStats?.totalRevenue ?? 0) / 100) * 0.15,
  };

  // Map the real order list rows to the display shape used by the JSX.
  const orders = apiOrders.map((order) => ({
    id: order.id,
    displayId: `#${order.id.slice(0, 8)}`,
    customer: order.customer_name,
    subtitle: order.customer_phone,
    total: formatCurrency(order.total_amount / 100),
    status: order.status,
    time: weekdayFormat(order.created_at),
  }));

  const recentOrders = orders.slice(0, 5);

  const handleOrderClick = async (orderId: string) => {
    const order = await getOrder(orderId);
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

  // Weekly sales derived from the real orders (grouped by weekday, in reais).
  const salesData = (() => {
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const totals = labels.map((name) => ({ name, vendas: 0 }));
    apiOrders.forEach((o) => {
      totals[new Date(o.created_at).getDay()].vendas += o.total_amount / 100;
    });
    // Reorder Monday→Sunday for display.
    return [1, 2, 3, 4, 5, 6, 0].map((i) => totals[i]);
  })();

  // Per-product breakdown is not available from the order-list endpoint.
  const productData: Array<{ name: string; value: number; color: string }> = [];

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

  const handleSettingsClick = () => {
    setActiveTab('settings');
  };

  const handleLogoutClick = async () => {
    await signOut();
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
                  <p className="text-xs text-muted-foreground">Pedidos {getStatsLabel(statsPeriodFilter)}</p>
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
                  <p className="text-xs text-muted-foreground">Entregues {getStatsLabel(statsPeriodFilter)}</p>
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
                  <p className="text-xs text-muted-foreground">Faturamento {getStatsLabel(statsPeriodFilter)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">Valor médio por pedido</p>
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
                          <span className="font-medium">{order.displayId}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.subtitle}</p>
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
                  {productData.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                      Sem dados de produtos no período
                    </div>
                  ) : (
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
                  )}
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
                  <OrderExport
                    onExportPdf={() => exportOrders('pdf')}
                    onExportCsv={(period) => exportOrders('csv', { period: Number(period) })}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{order.displayId}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.subtitle}</p>
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
