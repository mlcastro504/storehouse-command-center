
import { useAuth } from "@/hooks/useAuth";
import { JournalEntry } from "@/types/accounting";

/**
 * Hook for strict accounting permissions.
 * - Only admin (level 1) and manager (level 2/3) can create entries.
 * - Only admin and manager can edit entries that are DRAFT and NOT in closed period.
 * - Only admin and manager can delete entries if DRAFT and NOT in closed period.
 * - Only admin can view audit logs of all actions in accounting.
 * - No one (except admin) can edit/delete posted/cancelled entries or entries in closed periods.
 */
export function useAccountingPermissions() {
  const { user, hasPermission } = useAuth();

  // Can create a new journal entry
  function canCreateEntry() {
    // Only admin and manager (level 1-3) can create
    return !!user && user.role.level <= 3 && hasPermission("create", "journal_entries");
  }

  // Can edit a given journal entry
  function canEditEntry(entry: JournalEntry, periodClosed: boolean = false) {
    if (!user || user.role.level > 3) return false;
    // Only editable if draft, period open, and user has permission
    return (
      entry.status === "draft" &&
      hasPermission("update", "journal_entries") &&
      !periodClosed
    );
  }

  // Can delete a journal entry (only draft, period open, and higher role)
  function canDeleteEntry(entry: JournalEntry, periodClosed: boolean = false) {
    if (!user || user.role.level > 3) return false;
    // Only allowed if in draft, period open, and permission
    return (
      entry.status === "draft" &&
      hasPermission("delete", "journal_entries") &&
      !periodClosed
    );
  }

  // Only admin can view audit logs
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
