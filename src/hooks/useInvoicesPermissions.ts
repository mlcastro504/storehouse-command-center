
import { useAuth } from "@/hooks/useAuth";
import { Invoice } from "@/types/accounting";

// Permisos estrictos para facturas
export function useInvoicesPermissions() {
  const { user, hasPermission } = useAuth();

  // Solo admin y manager (nivel 1-3) pueden crear
  function canCreateInvoice() {
    return !!user && user.role.level <= 3 && hasPermission("create", "invoices");
  }
  // Solo draft y periodo abierto editable/eliminable
  function canEditInvoice(invoice: Invoice) {
    if (!user || user.role.level > 3) return false;
    return (
      invoice.status === "draft" &&
      hasPermission("update", "invoices")
    );
  }
  function canDeleteInvoice(invoice: Invoice) {
    if (!user || user.role.level > 3) return false;
    return (
      invoice.status === "draft" &&
      hasPermission("delete", "invoices")
    );
  }
  // Solo admin ve logs de facturas
  function canViewLogs() {
    return !!user && user.role.level === 1 && hasPermission("read", "audit_logs");
  }

  return {
    canCreateInvoice,
    canEditInvoice,
    canDeleteInvoice,
    canViewLogs,
  };
}
