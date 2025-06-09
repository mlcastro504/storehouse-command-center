
-- Crear tabla para tareas de picking
CREATE TABLE public.picking_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_number character varying NOT NULL UNIQUE,
  order_id uuid, -- Referencia a órdenes de venta
  stock_move_task_id uuid, -- Referencia a tareas de stock move
  product_id uuid NOT NULL,
  quantity_requested integer NOT NULL,
  quantity_picked integer DEFAULT 0,
  source_location_id uuid NOT NULL,
  destination_location_id uuid NOT NULL,
  task_type character varying NOT NULL DEFAULT 'sale', -- 'sale', 'transfer', 'replenishment', 'quality_control'
  priority character varying NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status character varying NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'partial'
  assigned_to uuid, -- ID del operario
  assigned_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_duration_minutes integer DEFAULT 15,
  actual_duration_minutes integer,
  validation_code_required boolean NOT NULL DEFAULT true,
  validation_code_used character varying,
  notes text,
  error_reason character varying,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  channel_origin character varying, -- 'shopify', 'amazon', 'manual', etc.
  is_training_mode boolean NOT NULL DEFAULT false
);

-- Crear tabla para líneas de picking (detalle de productos escaneados)
CREATE TABLE public.picking_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  picking_task_id uuid NOT NULL,
  product_id uuid NOT NULL,
  location_id uuid NOT NULL,
  quantity_to_pick integer NOT NULL,
  quantity_picked integer DEFAULT 0,
  status character varying NOT NULL DEFAULT 'pending', -- 'pending', 'picked', 'short_picked', 'not_found'
  sequence_number integer NOT NULL DEFAULT 1,
  scanned_barcode character varying,
  picked_by uuid,
  picked_at timestamp with time zone,
  notes text,
  validation_errors jsonb DEFAULT '[]'::jsonb,
  user_id uuid NOT NULL
);

-- Crear tabla para el historial de picking
CREATE TABLE public.picking_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  picking_task_id uuid NOT NULL,
  action_type character varying NOT NULL, -- 'assigned', 'started', 'scanned', 'completed', 'cancelled', 'error'
  performed_by uuid NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb,
  location_id uuid,
  product_id uuid,
  quantity integer,
  notes text,
  user_id uuid NOT NULL
);

-- Crear tabla para configuración de zonas de picking por usuario
CREATE TABLE public.user_picking_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  location_id uuid NOT NULL,
  can_pick boolean NOT NULL DEFAULT true,
  can_assign_tasks boolean NOT NULL DEFAULT false,
  is_zone_leader boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- Crear tabla para métricas de rendimiento de picking
CREATE TABLE public.picking_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  operator_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed integer DEFAULT 0,
  tasks_assigned integer DEFAULT 0,
  total_items_picked integer DEFAULT 0,
  total_duration_minutes integer DEFAULT 0,
  average_time_per_task numeric DEFAULT 0,
  error_count integer DEFAULT 0,
  accuracy_percentage numeric DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, operator_id, date)
);

-- Agregar campos necesarios a la tabla de órdenes existente (solo si no existen)
DO $$ 
BEGIN
  -- Agregar campos de picking a órdenes si no existen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ecommerce_orders' AND column_name='picking_status') THEN
    ALTER TABLE public.ecommerce_orders ADD COLUMN picking_status character varying DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ecommerce_orders' AND column_name='picking_started_at') THEN
    ALTER TABLE public.ecommerce_orders ADD COLUMN picking_started_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ecommerce_orders' AND column_name='picking_completed_at') THEN
    ALTER TABLE public.ecommerce_orders ADD COLUMN picking_completed_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ecommerce_orders' AND column_name='picking_assigned_to') THEN
    ALTER TABLE public.ecommerce_orders ADD COLUMN picking_assigned_to uuid;
  END IF;
END $$;

-- Crear índices para optimizar consultas
CREATE INDEX idx_picking_tasks_status ON public.picking_tasks(status);
CREATE INDEX idx_picking_tasks_assigned_to ON public.picking_tasks(assigned_to);
CREATE INDEX idx_picking_tasks_priority ON public.picking_tasks(priority);
CREATE INDEX idx_picking_tasks_created_at ON public.picking_tasks(created_at);
CREATE INDEX idx_picking_tasks_task_type ON public.picking_tasks(task_type);
CREATE INDEX idx_picking_lines_picking_task_id ON public.picking_lines(picking_task_id);
CREATE INDEX idx_picking_history_picking_task_id ON public.picking_history(picking_task_id);
CREATE INDEX idx_picking_history_timestamp ON public.picking_history(timestamp);
CREATE INDEX idx_picking_metrics_date ON public.picking_metrics(date);
CREATE INDEX idx_picking_metrics_operator_id ON public.picking_metrics(operator_id);

-- Habilitar RLS en todas las tablas de picking
ALTER TABLE public.picking_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_picking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_metrics ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS básicas (los usuarios solo ven sus propios datos)
CREATE POLICY "Users can view their own picking tasks" ON public.picking_tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own picking tasks" ON public.picking_tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own picking tasks" ON public.picking_tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own picking lines" ON public.picking_lines
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own picking lines" ON public.picking_lines
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own picking lines" ON public.picking_lines
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own picking history" ON public.picking_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own picking history" ON public.picking_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own picking zones" ON public.user_picking_zones
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own picking zones" ON public.user_picking_zones
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own picking metrics" ON public.picking_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own picking metrics" ON public.picking_metrics
  FOR ALL USING (user_id = auth.uid());

-- Crear función para generar número de tarea automáticamente
CREATE OR REPLACE FUNCTION public.generate_picking_task_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  task_prefix text := 'PICK';
BEGIN
  -- Obtener el siguiente número secuencial
  SELECT COALESCE(MAX(CAST(SUBSTRING(task_number FROM '[0-9]+$') AS integer)), 0) + 1
  INTO next_number
  FROM public.picking_tasks
  WHERE task_number ~ '^PICK[0-9]+$';
  
  -- Asignar el número de tarea
  NEW.task_number := task_prefix || LPAD(next_number::text, 6, '0');
  
  RETURN NEW;
END;
$$;

-- Crear trigger para generar número de tarea
CREATE TRIGGER trigger_generate_picking_task_number
  BEFORE INSERT ON public.picking_tasks
  FOR EACH ROW
  WHEN (NEW.task_number IS NULL OR NEW.task_number = '')
  EXECUTE FUNCTION public.generate_picking_task_number();

-- Crear función para actualizar métricas automáticamente
CREATE OR REPLACE FUNCTION public.update_picking_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo actualizar si la tarea se completó
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.picking_metrics (
      user_id,
      operator_id,
      date,
      tasks_completed,
      total_items_picked,
      total_duration_minutes
    ) VALUES (
      NEW.user_id,
      NEW.assigned_to,
      CURRENT_DATE,
      1,
      NEW.quantity_picked,
      NEW.actual_duration_minutes
    )
    ON CONFLICT (user_id, operator_id, date) 
    DO UPDATE SET
      tasks_completed = picking_metrics.tasks_completed + 1,
      total_items_picked = picking_metrics.total_items_picked + NEW.quantity_picked,
      total_duration_minutes = picking_metrics.total_duration_minutes + COALESCE(NEW.actual_duration_minutes, 0),
      average_time_per_task = (picking_metrics.total_duration_minutes + COALESCE(NEW.actual_duration_minutes, 0)) / (picking_metrics.tasks_completed + 1),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para actualizar métricas
CREATE TRIGGER trigger_update_picking_metrics
  AFTER UPDATE ON public.picking_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_picking_metrics();

-- Crear función para registrar historial automáticamente
CREATE OR REPLACE FUNCTION public.log_picking_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Registrar cambios de estado importantes
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.picking_history (
      picking_task_id,
      action_type,
      performed_by,
      details,
      user_id
    ) VALUES (
      NEW.id,
      'created',
      NEW.created_by,
      jsonb_build_object('priority', NEW.priority, 'task_type', NEW.task_type),
      NEW.user_id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Registrar asignación
    IF NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS NULL THEN
      INSERT INTO public.picking_history (
        picking_task_id,
        action_type,
        performed_by,
        details,
        user_id
      ) VALUES (
        NEW.id,
        'assigned',
        NEW.assigned_to,
        jsonb_build_object('assigned_at', NEW.assigned_at),
        NEW.user_id
      );
    END IF;
    
    -- Registrar inicio
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
      INSERT INTO public.picking_history (
        picking_task_id,
        action_type,
        performed_by,
        details,
        user_id
      ) VALUES (
        NEW.id,
        'started',
        NEW.assigned_to,
        jsonb_build_object('started_at', NEW.started_at),
        NEW.user_id
      );
    END IF;
    
    -- Registrar finalización
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      INSERT INTO public.picking_history (
        picking_task_id,
        action_type,
        performed_by,
        details,
        quantity,
        user_id
      ) VALUES (
        NEW.id,
        'completed',
        NEW.assigned_to,
        jsonb_build_object('completed_at', NEW.completed_at, 'duration_minutes', NEW.actual_duration_minutes),
        NEW.quantity_picked,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Crear trigger para registrar historial
CREATE TRIGGER trigger_log_picking_history
  AFTER INSERT OR UPDATE ON public.picking_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_picking_history();
