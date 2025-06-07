-- ========================================
-- 2. STORE PROCEDURES
-- ========================================

-- 2.1 ObtenerPedidosPorOrganizacion
CREATE OR REPLACE PROCEDURE ObtenerPedidosPorOrganizacion (
    IN organizacion NVARCHAR(100)
)
LANGUAGE SQLSCRIPT SQL SECURITY INVOKER
AS
BEGIN
    SELECT 
        u.Correo AS Usuario,
        o.Organizacion,
        a.Nombre AS Producto,
        o.FechaCreacion AS FechaPedido,
        o.FechaEntrega,
        op.Cantidad,
        op.PrecioUnitario,
        (op.Cantidad * op.PrecioUnitario) AS TotalLinea
    FROM Usuario2 u
    JOIN Ordenes2 o ON u.Usuario_ID = o.Creado_por_ID
    JOIN OrdenesProductos2 op ON o.Orden_ID = op.Orden_ID
    JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
    JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
    WHERE o.Organizacion = :organizacion
    ORDER BY o.FechaCreacion DESC;
END;

-- 2.2 ActualizarMetricasOrganizacion
CREATE OR REPLACE PROCEDURE ActualizarMetricasOrganizacion()
LANGUAGE SQLSCRIPT
AS
BEGIN
    MERGE INTO HistorialProductos2 target
    USING (
        SELECT 
            u.Location_ID,
            op.Inventario_ID,
            COUNT(op.OrdenesProductos_ID) AS Importacion,
            0 AS Exportacion,
            0 AS StockStart,
            i.StockActual AS StockEnd
        FROM Ordenes2 o
        JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID
        JOIN OrdenesProductos2 op ON o.Orden_ID = op.Orden_ID
        JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
        WHERE o.FechaCreacion >= ADD_MONTHS(CURRENT_DATE, -1)
        GROUP BY u.Location_ID, op.Inventario_ID, i.StockActual
    ) source
    ON (target.Location_ID = source.Location_ID AND target.Inventario_ID = source.Inventario_ID AND target.Mes = MONTH(CURRENT_DATE) AND target.Anio = YEAR(CURRENT_DATE))
    WHEN MATCHED THEN
        UPDATE SET 
            target.Importacion = source.Importacion,
            target.Exportacion = source.Exportacion,
            target.StockStart = target.StockStart,
            target.StockEnd = source.StockEnd;
END;
