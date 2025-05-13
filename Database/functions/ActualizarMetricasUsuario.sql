-- Función: actualizar métricas en Usuarios
CREATE OR REPLACE FUNCTION actualizar_metricas_usuario()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Usuarios
    SET 
        DiasOrdenProm = (
            SELECT AVG(DATE_PART('day', FechaEntrega - FechaCreacion))
            FROM Ordenes
            WHERE Creada_por = NEW.Creada_por AND FechaEntrega IS NOT NULL
        ),
        ValorOrdenProm = (
            SELECT AVG(Total)
            FROM Ordenes
            WHERE Creada_por = NEW.Creada_por
        )
    WHERE Correo = NEW.Creada_por;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;