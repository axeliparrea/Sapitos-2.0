-- Función: calcular tiempos en Ordenes
CREATE OR REPLACE FUNCTION calcular_tiempos_orden()
RETURNS TRIGGER AS $$
BEGIN
    NEW.TiempoReposicion := DATE_PART('day', NEW.FechaEstimaEntrega - NEW.FechaCreacion);
    IF NEW.FechaEntrega IS NOT NULL THEN
        NEW.TiempoEntrega := DATE_PART('day', NEW.FechaEntrega - NEW.FechaCreacion);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;