-- 3.2 Trigger de pago de orden pendiente
CREATE TRIGGER Alerta_Pago_Pendiente
AFTER INSERT ON Ordenes2
REFERENCING NEW ROW AS newrow
FOR EACH ROW
BEGIN
    DECLARE v_Creator_Loc INTEGER;
    DECLARE v_Count_Pagos INTEGER;

    -- 1) Obtener el Location_ID del usuario que creó la orden
    SELECT Location_ID 
      INTO v_Creator_Loc
      FROM Usuario2
     WHERE Usuario_ID = :newrow.Creado_por_ID;

    -- 2) Contar cuántos pagos existen ya para esta Orden_ID
    SELECT COUNT(*) 
      INTO v_Count_Pagos
      FROM PagoOrden2
     WHERE Orden_ID = :newrow.Orden_ID;

    -- 3) Si NO hay ningún pago (v_Count_Pagos = 0), generamos la alerta
    IF v_Count_Pagos = 0 THEN

        INSERT INTO Alertas2 (
            Descripcion,
            FechaCreacion,
            Location_ID,
            Prioridad
        )
        SELECT
            'Pago pendiente de orden ID ' || :newrow.Orden_ID,
            :newrow.FechaCreacion,
            u.Location_ID,
            1
        FROM Usuario2 u
        WHERE u.Location_ID = v_Creator_Loc;

    END IF;
END;
