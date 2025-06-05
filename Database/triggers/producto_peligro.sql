-- 3.4 Trigger de producto en peligro
CREATE TRIGGER Alerta_Stock_Bajo
AFTER UPDATE ON Inventario2
REFERENCING OLD ROW oldrow, NEW ROW newrow
FOR EACH ROW
BEGIN
    DECLARE v_LocID INTEGER;
    DECLARE v_ProdNombre NVARCHAR(100);

    -- 1) Verificar que el stock actual haya bajado por debajo del stock mínimo
    IF :newrow.StockActual < :newrow.StockMinimo
       AND (:oldrow.StockActual >= :oldrow.StockMinimo 
            OR :oldrow.StockActual IS NULL) THEN

        -- 2) Obtener el Location_ID (ya está en newrow)
        v_LocID := :newrow.Location_ID;

        -- 3) Obtener el nombre del producto desde Articulo2
        SELECT Nombre 
          INTO v_ProdNombre
          FROM Articulo2
         WHERE Articulo_ID = :newrow.Articulo_ID;

        -- 4) Insertar una alerta para cada usuario del mismo Location_ID
        INSERT INTO Alertas2 (
            Descripcion,
            FechaCreacion,
            Location_ID,
            Prioridad
        )
        SELECT
            'Producto ''' || v_ProdNombre 
             || ''' con stock ' || :newrow.StockActual 
             || ' (mínimo ' || :newrow.StockMinimo 
             || '): pedir más.',
            CURRENT_DATE,
            u.Location_ID,
            1
        FROM Usuario2 u
        WHERE u.Location_ID = v_LocID;

    END IF;
END;