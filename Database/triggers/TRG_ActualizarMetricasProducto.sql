CREATE TRIGGER trg_actualizar_metricas_producto
AFTER INSERT OR UPDATE ON OrdenesProductos
FOR EACH ROW
EXECUTE FUNCTION actualizar_metricas_producto();