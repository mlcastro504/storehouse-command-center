
// Tipos para el módulo de reportes y analítica

export interface Report {
  id: string;
  name: string;
  description?: string;
  report_type: 'inventory' | 'sales' | 'purchasing' | 'quality' | 'performance' | 'financial' | 'custom';
  category: string;
  parameters: ReportParameter[];
  output_format: 'table' | 'chart' | 'dashboard' | 'pdf' | 'excel';
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  run_count: number;
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'daterange' | 'select' | 'multiselect' | 'text' | 'number';
  label: string;
  required: boolean;
  default_value?: any;
  options?: { value: any; label: string }[];
}

export interface ReportExecution {
  id: string;
  report_id: string;
  parameters: Record<string, any>;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  result_url?: string;
  error_message?: string;
  executed_by: string;
  report?: Report;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: DashboardWidget[];
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  widget_type: 'kpi' | 'chart' | 'table' | 'text';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  data_source: string;
  refresh_interval?: number;
  last_updated?: string;
}

export interface WidgetConfig {
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  kpi_metric?: string;
  table_columns?: string[];
  text_content?: string;
  filters?: Record<string, any>;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  time_period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_category: string;
  user_id: string;
  session_id: string;
  properties: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_category: 'inventory' | 'operations' | 'quality' | 'financial' | 'hr';
  value: number;
  unit: string;
  period_start: string;
  period_end: string;
  location_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  calculated_at: string;
}
