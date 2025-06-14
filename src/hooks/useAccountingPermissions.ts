
import { useAuth } from "@/hooks/useAuth";
import { JournalEntry } from "@/types/accounting";

/**
 * Hook para validación de permisos contables según nivel de usuario, estado y periodo.
 */
export function useAccountingPermissions() {
  const { user, hasPermission } = useAuth();

  // ¿Puede crear asientos manuales?
  function canCreateEntry() {
    // Solo admin y manager (nivel 1-3) pueden crear asientos
    return !!user && user.role.level <= 3 && hasPermission("create", "journal_entries");
  }

  // ¿Puede editar este asiento?
  function canEditEntry(entry: JournalEntry, periodClosed: boolean = false) {
    if (!user || user.role.level > 3) return false;
    // Solo editable si está en borrador y el periodo abierto
    return (
      entry.status === "draft" &&
      hasPermission("update", "journal_entries") &&
      !periodClosed
    );
  }

  // ¿Puede borrar este asiento?
  function canDeleteEntry(entry: JournalEntry, periodClosed: boolean = false) {
    if (!user || user.role.level > 2) return false;
    // Solo permitido si borrador y periodo abierto
    return (
      entry.status === "draft" &&
      hasPermission("delete", "journal_entries") &&
      !periodClosed
    );
  }

  // Si el periodo está cerrado (acceso admin-only)
  function canViewLogs() {
    return !!user && user.role.level === 1 && hasPermission("read", "audit_logs");
  }

  return {
    canCreateEntry,
    canEditEntry,
    canDeleteEntry,
    canViewLogs,
  };
}
