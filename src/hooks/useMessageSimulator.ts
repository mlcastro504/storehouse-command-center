
import { useEffect } from 'react';
import { ChatService } from '@/services/chatService';
import { ChatMessage } from '@/types/chat';

const mockUserIds = ['2', '3', '4']; // manager, operator, driver from mock-auth
const mockMessages: Record<string, string[]> = {
  'general': [
    "¿Alguien ha visto el pallet 34A?",
    "Reunión de equipo en 15 minutos en el muelle 3.",
    "El sistema de inventario parece lento hoy.",
    "Confirmada la recepción de la mercancía de ACME Corp."
  ],
  'almacen': [
    "Necesito ayuda en la sección de fríos.",
    "Ubicación A-12-3 está bloqueada.",
    "Entrada de mercancía de 'Proveedor X' completada."
  ],
  'gerencia': [
    "Por favor, revisen el informe de KPIs del Q2.",
    "La auditoría interna será la próxima semana.",
    "Propuesta de nuevo layout para la zona de picking."
  ]
};

const simulatorIntervals: Record<string, NodeJS.Timeout> = {};

export const useMessageSimulator = (channelIds: string[]) => {
  useEffect(() => {
    channelIds.forEach(channelId => {
      if (!simulatorIntervals[channelId]) {
        simulatorIntervals[channelId] = setInterval(() => {
          const messagesForChannel = mockMessages[channelId] || mockMessages['general'];
          const randomUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];
          const randomMessage = messagesForChannel[Math.floor(Math.random() * messagesForChannel.length)];
          
          const messageData: Partial<ChatMessage> = {
            channel_id: channelId,
            sender_id: randomUserId,
            content: randomMessage,
            message_type: 'text',
          };
          ChatService.sendMessage(messageData);
          console.log(`SIMULATOR: New message in #${channelId} from user ${randomUserId}`);
        }, 20000 + Math.random() * 10000); // New message every 20-30 seconds
      }
    });

    return () => {
      Object.keys(simulatorIntervals).forEach(key => {
        clearInterval(simulatorIntervals[key]);
        delete simulatorIntervals[key];
      });
    };
  }, [channelIds]);
};
