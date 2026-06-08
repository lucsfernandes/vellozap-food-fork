import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export type ConversationStatus = 'nova' | 'em_atendimento' | 'finalizada';
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';

/** Mirrors the backend ConversationDTO (snake_case JSON). */
export interface WhatsAppConversation {
  id: string;
  restaurant_id: string;
  customer_name: string | null;
  customer_phone: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  status: ConversationStatus;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Mirrors the backend MessageDTO (snake_case JSON). */
export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  external_id: string | null;
  text: string;
  is_from_customer: boolean;
  status: MessageStatus;
  sent_at: string | null;
  created_at: string;
}

export interface WhatsAppStatus {
  provider: string;
  connected: boolean;
}

export const useWhatsApp = (status?: ConversationStatus) => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<WhatsAppStatus | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, WhatsAppMessage[]>
  >({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiClient.get<WhatsAppConversation[]>('/whatsapp/conversations', {
        params: status ? { status } : undefined,
      });
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Erro ao carregar conversas',
        description: 'Não foi possível carregar as conversas do WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiClient.get<WhatsAppStatus>('/whatsapp/status');
      setConnection(res.data);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchConversations();
      void fetchStatus();
    } else {
      setLoading(false);
    }
  }, [user, fetchConversations, fetchStatus]);

  const getMessages = useCallback(
    async (conversationId: string): Promise<WhatsAppMessage[]> => {
      setMessagesLoading(true);
      try {
        const res = await apiClient.get<WhatsAppMessage[]>(
          `/whatsapp/conversations/${conversationId}/messages`,
        );
        setMessagesByConversation((prev) => ({ ...prev, [conversationId]: res.data }));
        return res.data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Erro ao carregar mensagens',
          description: 'Não foi possível carregar as mensagens da conversa.',
          variant: 'destructive',
        });
        return [];
      } finally {
        setMessagesLoading(false);
      }
    },
    [toast],
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string): Promise<WhatsAppMessage | null> => {
      try {
        const res = await apiClient.post<WhatsAppMessage>(
          `/whatsapp/conversations/${conversationId}/messages`,
          { text },
        );
        const sent = res.data;
        // Optimistically append the sent message and refresh the conversation list.
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] ?? []), sent],
        }));
        void fetchConversations();
        return sent;
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Erro ao enviar mensagem',
          description: 'Não foi possível enviar a mensagem. Tente novamente.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [fetchConversations, toast],
  );

  return {
    conversations,
    loading,
    connection,
    messagesByConversation,
    messagesLoading,
    getMessages,
    sendMessage,
    refetch: fetchConversations,
  };
};
