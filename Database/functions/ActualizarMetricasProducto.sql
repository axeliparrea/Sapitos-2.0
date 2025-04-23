-- Función: actualizar métricas en Productos
CREATE OR REPLACE FUNCTION actualizar_metricas_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Productos
    SET 
        MargenGanancia = PrecioVenta - PrecioCompra,
        TiempReposiProm = (
            SELECT AVG(O.TiempoReposicion)
            FROM Ordenes O
            JOIN OrdenesProductos OP ON OP.OrdenID = O.ID
            WHERE OP.ProductoID = NEW.ProductoID
        ),
        DemandaProm = (
            SELECT AVG(Cantidad)
            FROM OrdenesProductos
            WHERE ProductoID = NEW.ProductoID
        ),
        StockSeguridad = (
            SELECT AVG(Cantidad) * 1.5
            FROM OrdenesProductos
            WHERE ProductoID = NEW.ProductoID
        )
    WHERE ID = NEW.ProductoID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;