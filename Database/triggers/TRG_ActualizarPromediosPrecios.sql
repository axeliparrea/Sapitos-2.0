CREATE TRIGGER trg_actualizar_promedios_precios
AFTER INSERT OR UPDATE ON HistorialPreciosProductos
FOR EACH ROW
EXECUTE FUNCTION actualizar_promedios_precios();