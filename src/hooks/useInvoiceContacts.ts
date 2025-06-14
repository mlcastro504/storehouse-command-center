
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { useMemo } from 'react';

export function useInvoiceContacts() {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const results = await db.collection('contacts').find({ is_active: true }).sort({ name: 1 }).toArray();
      return results;
    }
  });

  const validContacts = useMemo(() => {
    if (!contacts) {
      return [];
    }
    
    const processedContacts = contacts
      .map(contact => {
        if (!contact) {
          return null;
        }
        
        const id = String(contact._id ?? contact.id ?? '').trim();
        const name = contact.name ?? 'Unnamed Contact';

        if (id === '') {
          return null;
        }

        return { id, name };
      })
      .filter((contact): contact is { id: string; name: string } => contact !== null);

    return processedContacts;
  }, [contacts]);

  return { validContacts, isLoadingContacts: isLoading };
}
