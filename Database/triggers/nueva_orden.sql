-- 3.1 Trigger de nueva orden creada en la organizacion
CREATE TRIGGER Alerta_Orden_Creada
AFTER INSERT ON Ordenes2
REFERENCING NEW ROW AS newrow
FOR EACH ROW
BEGIN
    DECLARE v_Creator_Loc INTEGER;

    -- 1) Obtener el Location_ID del usuario que creó la orden
    SELECT Location_ID 
      INTO v_Creator_Loc
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
        'Nueva orden creada por usuario ID ' || :newrow.Creado_por_ID,
        :newrow.FechaCreacion,
        u.Location_ID,
        1
    FROM Usuario2 u
    WHERE u.Location_ID = v_Creator_Loc;
END;
