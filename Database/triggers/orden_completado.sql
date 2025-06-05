-- 3.4 Trigger de orden "Completado"
CREATE TRIGGER Alerta_Completado
AFTER UPDATE ON Ordenes2
REFERENCING OLD ROW oldrow, NEW ROW newrow
FOR EACH ROW
BEGIN
    DECLARE v_LocID INTEGER;

    -- Solo disparar si el Estado cambia a "Completado"
    IF :newrow.Estado = 'Completado'
       AND :oldrow.Estado <> 'Completado' THEN

        -- 1) Obtener el Location_ID del creador de la orden
        SELECT Location_ID
          INTO v_LocID
          FROM Usuario2
         WHERE Usuario_ID = :newrow.Creado_por_ID;

        -- 2) Insertar una alerta para cada usuario que comparta ese Location_ID
        INSERT INTO Alertas2 (
            Descripcion,
            FechaCreacion,
            Location_ID,
            Prioridad
        )
        SELECT
            'Orden ID ' || :newrow.Orden_ID || ' Completado',
            :newrow.FechaCreacion,
            u.Location_ID,
            1
        FROM Usuario2 u
        WHERE u.Location_ID = v_LocID;

    END IF;
END;
