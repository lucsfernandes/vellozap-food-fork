
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Bell, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: string;
}

interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
  restaurantName?: string;
  showCart?: boolean;
  showSettingsDropdown?: boolean;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

const Header = ({ 
  cartItemsCount = 0, 
  onCartClick, 
  restaurantName = "Vello", 
  showCart = true,
  showSettingsDropdown = false,
  onSettingsClick,
  onLogoutClick
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  // TODO: integrar com endpoint de notificações quando existir
  const notifications: NotificationItem[] = [];

  const unreadCount = notifications.length;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">{restaurantName}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {showCart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCartClick}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            )}

            {showSettingsDropdown && (
              <>
                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-sm">Notificações</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          Nenhuma notificação no momento
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-4 border-b last:border-b-0">
                            <div className="w-full">
                              <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                    <div className="p-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver todas as notificações
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" alt="Perfil" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block">Perfil</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={onSettingsClick}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogoutClick}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!showSettingsDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {isLoggedIn ? <User className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {isLoggedIn ? "Perfil" : "Entrar"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  {!isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/auth">Sou Cliente</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/auth">Sou Restaurante</Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
                      <DropdownMenuItem>Meus Pedidos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { void signOut(); }}>
                        Sair
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
