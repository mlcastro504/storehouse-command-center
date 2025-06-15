
import { ChatChannel } from '@/types/chat';

type MockChatChannel = Pick<ChatChannel, 'id' | 'name' | 'type' | 'is_archived'> & {
    unreadCount: number;
    members: number;
    lastMessage: string;
};

export const mockChannels: MockChatChannel[] = [
  {
    id: 'general',
    name: 'general',
    type: 'public',
    unreadCount: 0,
    members: 25,
    lastMessage: 'Bienvenidos al canal general.',
    is_archived: false,
  },
  {
    id: 'almacen',
    name: 'almacen',
    type: 'public',
    unreadCount: 0,
    members: 12,
    lastMessage: 'Todo listo para hoy.',
    is_archived: false,
  },
  {
    id: 'gerencia',
    name: 'gerencia',
    type: 'private',
    unreadCount: 0,
    members: 5,
    lastMessage: 'Reunión mañana a las 10.',
    is_archived: false,
  }
];

export const contextualChats = [
    {
      id: 'order-2024-001',
      name: 'Pedido #2024-001',
      type: 'contextual' as const,
      context: {
        type: 'Orden de Venta',
        orderNumber: '2024-001',
        description: 'Pedido urgente - 150 productos'
      },
      unreadCount: 0,
      lastActivity: '2 min',
      members: 3
    },
    {
      id: 'task-pick-456',
      name: 'Tarea Picking #456',
      type: 'contextual' as const,
      context: {
        type: 'Tarea de Picking',
        taskNumber: 'PICK-456',
        description: 'Problema con ubicación A-12-3'
      },
      unreadCount: 0,
      lastActivity: '5 min',
      members: 2
    }
  ];
