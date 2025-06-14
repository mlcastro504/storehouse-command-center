
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

export function ContactsList() {
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const db = await connectToDatabase();
      const contactsData = await db.collection('contacts').find().sort({ name: 1 }).toArray();
      return contactsData.map((c: any) => ({
        ...c,
        id: c.id ?? c._id?.toString?.() ?? "",
      }));
    }
  });

  const getContactTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      customer: 'default',
      supplier: 'secondary',
      both: 'outline'
    };

    const labels: Record<string, string> = {
      customer: 'Cliente',
      supplier: 'Proveedor',
      both: 'Ambos'
    };

    return (
      <Badge variant={variants[type] || 'outline'}>
        {labels[type] || type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="warehouse-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contactos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestión de clientes y proveedores
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>RFC/NIF</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts?.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  {contact.name}
                </TableCell>
                <TableCell>
                  {getContactTypeBadge(contact.contact_type)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {contact.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {contact.tax_id || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                    {contact.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
