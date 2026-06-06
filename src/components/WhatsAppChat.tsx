
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageCircle, Clock, CheckCheck, Phone } from "lucide-react";

// Tipos para as mensagens e conversas
interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromCustomer: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'nova' | 'em_atendimento' | 'finalizada';
  orderId?: string;
  messages: Message[];
}

const WhatsAppChat = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [filter, setFilter] = useState("todas");

  // Dados simulados (mock data)
  const mockConversations: Conversation[] = [
    {
      id: "1",
      customerName: "João Silva",
      customerPhone: "(11) 99999-1234",
      lastMessage: "Obrigado! Quando fica pronto?",
      lastMessageTime: "14:30",
      unreadCount: 2,
      status: "nova",
      orderId: "#001",
      messages: [
        {
          id: "1",
          text: "Olá! Gostaria de fazer um pedido",
          timestamp: "14:25",
          isFromCustomer: true,
          status: "read"
        },
        {
          id: "2",
          text: "Olá João! Claro, em que posso ajudá-lo?",
          timestamp: "14:26",
          isFromCustomer: false,
          status: "read"
        },
        {
          id: "3",
          text: "Quero uma pizza margherita grande",
          timestamp: "14:28",
          isFromCustomer: true,
          status: "read"
        },
        {
          id: "4",
          text: "Perfeito! Pizza margherita grande - R$ 35,90. Confirma o pedido?",
          timestamp: "14:29",
          isFromCustomer: false,
          status: "delivered"
        },
        {
          id: "5",
          text: "Sim, confirmo! Obrigado! Quando fica pronto?",
          timestamp: "14:30",
          isFromCustomer: true,
          status: "sent"
        }
      ]
    },
    {
      id: "2",
      customerName: "Maria Santos",
      customerPhone: "(11) 99999-5678",
      lastMessage: "Pedido confirmado, obrigada!",
      lastMessageTime: "13:45",
      unreadCount: 0,
      status: "finalizada",
      orderId: "#002",
      messages: [
        {
          id: "1",
          text: "Boa tarde! Gostaria de ver o cardápio",
          timestamp: "13:40",
          isFromCustomer: true,
          status: "read"
        },
        {
          id: "2",
          text: "Boa tarde Maria! Aqui está nosso cardápio: [link]",
          timestamp: "13:41",
          isFromCustomer: false,
          status: "read"
        },
        {
          id: "3",
          text: "Vou querer uma pizza portuguesa média",
          timestamp: "13:43",
          isFromCustomer: true,
          status: "read"
        },
        {
          id: "4",
          text: "Pizza portuguesa média - R$ 32,90. Pedido confirmado!",
          timestamp: "13:44",
          isFromCustomer: false,
          status: "read"
        },
        {
          id: "5",
          text: "Pedido confirmado, obrigada!",
          timestamp: "13:45",
          isFromCustomer: true,
          status: "read"
        }
      ]
    },
    {
      id: "3",
      customerName: "Pedro Costa",
      customerPhone: "(11) 99999-9012",
      lastMessage: "Olá, vocês entregam na Vila Mariana?",
      lastMessageTime: "12:15",
      unreadCount: 1,
      status: "nova",
      messages: [
        {
          id: "1",
          text: "Olá, vocês entregam na Vila Mariana?",
          timestamp: "12:15",
          isFromCustomer: true,
          status: "sent"
        }
      ]
    }
  ];

  const filteredConversations = mockConversations.filter(conversation => {
    switch (filter) {
      case "nao_lidas":
        return conversation.unreadCount > 0;
      case "finalizadas":
        return conversation.status === "finalizada";
      default:
        return true;
    }
  });

  const currentConversation = mockConversations.find(c => c.id === selectedConversation);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "nova": { label: "Nova", variant: "default" as const, color: "bg-red-500" },
      "em_atendimento": { label: "Em atendimento", variant: "secondary" as const, color: "bg-yellow-500" },
      "finalizada": { label: "Finalizada", variant: "outline" as const, color: "bg-green-500" }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
        <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
      </div>
    );
  };

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    // Aqui será implementada a lógica de envio via API do WhatsApp
    console.log(`Enviando mensagem para ${currentConversation?.customerName}: ${messageText}`);
    setMessageText("");
  };

  const markAsRead = (conversationId: string) => {
    console.log(`Marcando conversa ${conversationId} como lida`);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex space-x-4">
      {/* Coluna esquerda - Lista de conversas */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span>Conversas WhatsApp</span>
            </div>
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar conversas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="nao_lidas">Não lidas</SelectItem>
              <SelectItem value="finalizadas">Finalizadas</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-orange-50 border-l-4 border-orange-600' : ''
                }`}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  if (conversation.unreadCount > 0) {
                    markAsRead(conversation.id);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{conversation.customerName}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />
                      <span>{conversation.customerPhone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">{conversation.lastMessageTime}</div>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-green-600 text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                <div className="flex justify-between items-center">
                  {getStatusBadge(conversation.status)}
                  {conversation.orderId && (
                    <Badge variant="outline" className="text-xs">
                      Pedido {conversation.orderId}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coluna direita - Chat ativo */}
      <Card className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{currentConversation.customerName}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{currentConversation.customerPhone}</span>
                    </div>
                    {currentConversation.orderId && (
                      <Badge variant="outline">
                        Pedido {currentConversation.orderId}
                      </Badge>
                    )}
                  </div>
                </div>
                {getStatusBadge(currentConversation.status)}
              </div>
            </CardHeader>
            
            {/* Área de mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {currentConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isFromCustomer
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        message.isFromCustomer ? 'text-gray-500' : 'text-green-100'
                      }`}>
                        <span>{message.timestamp}</span>
                        {!message.isFromCustomer && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Campo de digitação */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!messageText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Integração com WhatsApp Business será implementada em breve
              </p>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para visualizar e responder mensagens
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default WhatsAppChat;
