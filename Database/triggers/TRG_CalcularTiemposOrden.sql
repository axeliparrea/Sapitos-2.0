CREATE TRIGGER trg_calcular_tiempos_orden
BEFORE INSERT OR UPDATE ON Ordenes
FOR EACH ROW
EXECUTE FUNCTION calcular_tiempos_orden();