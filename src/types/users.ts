
// Tipos para el módulo de usuarios y roles

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  username?: string;
  phone?: string;
  avatar_url?: string;
  employee_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_login_at?: string;
  timezone?: string;
  language: string;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
  teams?: UserTeam[];
  permissions?: UserPermission[];
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  level: number; // 1-10, donde 1 es admin supremo
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: RolePermission[];
  users_count?: number;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'assign' | 'approve';
  resource: string;
  is_system_permission: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  role?: Role;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
  permission?: Permission;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  permission?: Permission;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  team_lead_id?: string;
  department?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: UserTeam[];
  team_lead?: User;
}

export interface UserTeam {
  id: string;
  user_id: string;
  team_id: string;
  role_in_team: 'member' | 'lead' | 'admin';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  user?: User;
  team?: Team;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export' | 'scan';
  module: string;
  resource: string;
  resource_id?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
