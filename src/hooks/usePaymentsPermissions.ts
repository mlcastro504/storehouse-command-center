
import { useAuth } from "@/hooks/useAuth";
import { Payment } from "@/types/accounting";

// Permisos estrictos para pagos
export function usePaymentsPermissions() {
  const { user, hasPermission } = useAuth();

  function canCreatePayment() {
    return !!user && user.role.level <= 3 && hasPermission("create", "payments");
  }
  function canEditPayment(payment: Payment) {
    if (!user || user.role.level > 3) return false;
    // Solo editable si pendiente y rol adecuado
    return (
      payment.status === "pending" &&
      hasPermission("update", "payments")
    );
  }
  function canDeletePayment(payment: Payment) {
    if (!user || user.role.level > 3) return false;
    return (
      payment.status === "pending" &&
      hasPermission("delete", "payments")
    );
  }
  function canViewLogs() {
    return !!user && user.role.level === 1 && hasPermission("read", "audit_logs");
  }

  return {
    canCreatePayment,
    canEditPayment,
    canDeletePayment,
    canViewLogs,
  };
}
