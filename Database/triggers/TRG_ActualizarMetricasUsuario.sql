CREATE TRIGGER trg_actualizar_metricas_usuario
AFTER INSERT OR UPDATE ON Ordenes
FOR EACH ROW
EXECUTE FUNCTION actualizar_metricas_usuario();