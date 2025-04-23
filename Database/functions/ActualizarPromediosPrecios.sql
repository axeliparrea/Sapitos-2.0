-- Función: actualizar promedios en HistorialPreciosProductos
CREATE OR REPLACE FUNCTION actualizar_promedios_precios()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE HistorialPreciosProductos
    SET 
        PrecioCompraProm = (
            SELECT AVG(PrecioCompra)
            FROM HistorialPreciosProductos
            WHERE ProductoID = NEW.ProductoID
        ),
        PrecioVentaProm = (
            SELECT AVG(PrecioVenta)
            FROM HistorialPreciosProductos
            WHERE ProductoID = NEW.ProductoID
        )
    WHERE ID = NEW.ID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;