
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageCircle, CheckCheck, Phone, Loader2 } from "lucide-react";
import { useWhatsApp } from "@/hooks/useWhatsApp";

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

const WhatsAppChat = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [filter, setFilter] = useState("todas");
  const [sending, setSending] = useState(false);

  const {
    conversations,
    loading,
    messagesByConversation,
    messagesLoading,
    getMessages,
    sendMessage,
  } = useWhatsApp();

  // Load messages whenever a conversation is selected.
  useEffect(() => {
    if (selectedConversation) {
      void getMessages(selectedConversation);
    }
  }, [selectedConversation, getMessages]);

  const filteredConversations = conversations.filter((conversation) => {
    switch (filter) {
      case "nao_lidas":
        return conversation.unread_count > 0;
      case "finalizadas":
        return conversation.status === "finalizada";
      default:
        return true;
    }
  });

  const currentConversation = conversations.find((c) => c.id === selectedConversation);
  const currentMessages = selectedConversation
    ? messagesByConversation[selectedConversation] ?? []
    : [];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      "nova": { label: "Nova", variant: "default" as const, color: "bg-red-500" },
      "em_atendimento": { label: "Em atendimento", variant: "secondary" as const, color: "bg-yellow-500" },
      "finalizada": { label: "Finalizada", variant: "outline" as const, color: "bg-green-500" }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    if (!statusInfo) return null;
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
        <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
      </div>
    );
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    setSending(true);
    const sent = await sendMessage(selectedConversation, messageText.trim());
    if (sent) {
      setMessageText("");
    }
    setSending(false);
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
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-gray-500">
              <MessageCircle className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm">Nenhuma conversa por aqui ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-orange-50 border-l-4 border-orange-600' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {conversation.customer_name ?? conversation.customer_phone}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{conversation.customer_phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">{formatTime(conversation.last_message_at)}</div>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-green-600 text-white text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">{conversation.last_message ?? ''}</p>
                  <div className="flex justify-between items-center">
                    {getStatusBadge(conversation.status)}
                    {conversation.order_id && (
                      <Badge variant="outline" className="text-xs">
                        Pedido #{conversation.order_id.slice(0, 8)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coluna direita - Chat ativo */}
      <Card className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    {currentConversation.customer_name ?? currentConversation.customer_phone}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{currentConversation.customer_phone}</span>
                    </div>
                    {currentConversation.order_id && (
                      <Badge variant="outline">
                        Pedido #{currentConversation.order_id.slice(0, 8)}
                      </Badge>
                    )}
                  </div>
                </div>
                {getStatusBadge(currentConversation.status)}
              </div>
            </CardHeader>

            {/* Área de mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messagesLoading && currentMessages.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_from_customer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.is_from_customer
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                          message.is_from_customer ? 'text-gray-500' : 'text-green-100'
                        }`}>
                          <span>{formatTime(message.sent_at ?? message.created_at)}</span>
                          {!message.is_from_customer && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Campo de digitação */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  onClick={handleSend}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!messageText.trim() || sending}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
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
