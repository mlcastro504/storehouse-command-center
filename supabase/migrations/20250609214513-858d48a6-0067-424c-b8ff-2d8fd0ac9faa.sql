
-- Crear tabla para las tareas de movimiento de stock
CREATE TABLE public.stock_move_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity_needed integer NOT NULL,
  source_location_id uuid NOT NULL REFERENCES public.locations(id),
  destination_location_id uuid NOT NULL REFERENCES public.locations(id),
  task_type character varying NOT NULL DEFAULT 'replenishment',
  priority character varying NOT NULL DEFAULT 'medium',
  status character varying NOT NULL DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  validation_code_required boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Crear tabla para las ejecuciones de movimientos de stock
CREATE TABLE public.stock_move_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.stock_move_tasks(id),
  executed_by uuid NOT NULL REFERENCES auth.users(id),
  quantity_moved integer NOT NULL,
  validation_code_used character varying NOT NULL,
  scan_records jsonb DEFAULT '[]'::jsonb,
  execution_status character varying NOT NULL DEFAULT 'completed',
  execution_notes text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Agregar campo de código de confirmación a locations
ALTER TABLE public.locations 
ADD COLUMN confirmation_code character varying;

-- Agregar campos para clasificar ubicaciones
ALTER TABLE public.locations 
ADD COLUMN occupancy_status character varying DEFAULT 'available',
ADD COLUMN restrictions jsonb DEFAULT '{}'::jsonb,
ADD COLUMN last_verified_at timestamp with time zone;

-- Actualizar ubicaciones existentes con códigos de confirmación únicos
UPDATE public.locations 
SET confirmation_code = CONCAT('LOC-', UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)))
WHERE confirmation_code IS NULL;

-- Hacer el campo obligatorio después de actualizar
ALTER TABLE public.locations 
ALTER COLUMN confirmation_code SET NOT NULL;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_stock_move_tasks_status ON public.stock_move_tasks(status);
CREATE INDEX idx_stock_move_tasks_product ON public.stock_move_tasks(product_id);
CREATE INDEX idx_stock_move_tasks_assigned ON public.stock_move_tasks(assigned_to);
CREATE INDEX idx_locations_occupancy ON public.locations(occupancy_status);
CREATE INDEX idx_locations_type ON public.locations(type);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.stock_move_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_move_executions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para stock_move_tasks
CREATE POLICY "Users can view their own stock move tasks" 
  ON public.stock_move_tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stock move tasks" 
  ON public.stock_move_tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock move tasks" 
  ON public.stock_move_tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Crear políticas RLS para stock_move_executions
CREATE POLICY "Users can view stock move executions" 
  ON public.stock_move_executions 
  FOR SELECT 
  USING (auth.uid() = executed_by);

CREATE POLICY "Users can create stock move executions" 
  ON public.stock_move_executions 
  FOR INSERT 
  WITH CHECK (auth.uid() = executed_by);

-- Función para generar tareas automáticas cuando el stock está bajo
CREATE OR REPLACE FUNCTION public.check_and_create_replenishment_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  picking_location_id uuid;
  storage_location_id uuid;
  quantity_to_replenish integer;
BEGIN
  -- Solo procesar si es una zona de picking y el stock está bajo
  IF (SELECT type FROM public.locations WHERE id = NEW.location_id) = 'bin' AND 
     (SELECT type FROM public.locations l2 WHERE l2.id = (SELECT parent_id FROM public.locations WHERE id = NEW.location_id)) = 'shelf' THEN
    
    -- Verificar si el stock está por debajo del punto de reorden
    IF NEW.quantity_available <= (SELECT reorder_point FROM public.products WHERE id = NEW.product_id) THEN
      
      -- Buscar ubicación de almacenaje con stock disponible
      SELECT sl.location_id INTO storage_location_id
      FROM public.stock_levels sl
      JOIN public.locations l ON sl.location_id = l.id
      WHERE sl.product_id = NEW.product_id 
        AND l.type = 'rack'
        AND sl.quantity_available > 0
      ORDER BY sl.quantity_available DESC
      LIMIT 1;
      
      -- Calcular cantidad a reponer (hasta el nivel máximo)
      SELECT max_stock_level - NEW.quantity_available INTO quantity_to_replenish
      FROM public.products 
      WHERE id = NEW.product_id;
      
      -- Crear tarea de reposición si hay stock en almacenaje
      IF storage_location_id IS NOT NULL AND quantity_to_replenish > 0 THEN
        INSERT INTO public.stock_move_tasks (
          product_id,
          quantity_needed,
          source_location_id,
          destination_location_id,
          task_type,
          priority,
          created_by,
          user_id
        ) VALUES (
          NEW.product_id,
          quantity_to_replenish,
          storage_location_id,
          NEW.location_id,
          'replenishment',
          CASE 
            WHEN NEW.quantity_available = 0 THEN 'urgent'
            WHEN NEW.quantity_available <= (SELECT reorder_point FROM public.products WHERE id = NEW.product_id) / 2 THEN 'high'
            ELSE 'medium'
          END,
          NEW.user_id,
          NEW.user_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para generar tareas automáticamente
CREATE TRIGGER trigger_auto_replenishment
  AFTER UPDATE OF quantity_available ON public.stock_levels
  FOR EACH ROW
  WHEN (NEW.quantity_available < OLD.quantity_available)
  EXECUTE FUNCTION public.check_and_create_replenishment_tasks();
