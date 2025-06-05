-- ========================================
-- 1. ROLES (Rol2)
-- ========================================
INSERT INTO Rol2 (Rol_ID, Nombre) VALUES (1, 'admin');
INSERT INTO Rol2 (Rol_ID, Nombre) VALUES (2, 'dueno');
INSERT INTO Rol2 (Rol_ID, Nombre) VALUES (3, 'empleado');
INSERT INTO Rol2 (Rol_ID, Nombre) VALUES (4, 'proveedor');

-- ========================================
-- 2. UBICACIONES (Location2)
-- ========================================
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (1,  'Oficina central',  'Oficina',    0,   0,  CAST('2025-01-01' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (2,  'Fábrica Norte',    'Proveedor', 20,   5,  CAST('2025-01-02' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (3,  'Fábrica Sur',      'Proveedor',-20,  -2,  CAST('2025-01-03' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (4,  'Almacén Oeste',    'Almacén',     3, -10,  CAST('2025-01-04' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (5,  'Almacén Este',     'Almacén',     2,  10,  CAST('2025-01-05' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (6,  'Sucursal Este',    'Sucursal',   -3,  15,  CAST('2025-01-06' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (7,  'Sucursal Oeste',   'Sucursal',    2,   5,  CAST('2025-01-07' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (8,  'ProveeTex',        'Proveedor', 10,   0,  CAST('2025-04-01' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (9,  'ModaRopa',         'Proveedor', 15,   0,  CAST('2025-04-03' AS DATE));
INSERT INTO Location2 (Location_ID, Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (10, 'TexMex',           'Proveedor', 20,   0,  CAST('2025-04-02' AS DATE));

-- ========================================
-- 3. MÉTODOS DE PAGO (MetodoPago2)
-- ========================================
INSERT INTO MetodoPago2 (MetodoPago_ID, Nombre) VALUES (1, 'Transferencia');
INSERT INTO MetodoPago2 (MetodoPago_ID, Nombre) VALUES (2, 'Tarjeta Crédito');
INSERT INTO MetodoPago2 (MetodoPago_ID, Nombre) VALUES (3, 'Efectivo');

-- ========================================
-- 4. USUARIOS (Usuario2)
-- ========================================
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (1,  'juan.perez@example.com',     'juan.perez',     'Juan Perez',       '1234',  1, 1, CAST('2025-04-01' AS DATE), 'RFCJPNR1234');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (2,  'ana.lopez@example.com',      'ana.lopez',      'Ana Lopez',        'abcd',  2, 1, CAST('2025-04-01' AS DATE), 'RFCALE4567');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (3,  'carlos.martinez@example.com','carlos.martinez','Carlos Martinez',  'xyz1',  2, 1, CAST('2025-04-01' AS DATE), 'RFCCMT7890');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (4,  'laura.gomez@example.com',    'laura.gomez',    'Laura Gomez',      'pass',  3, 1, CAST('2025-04-01' AS DATE), 'RFCLGM2345');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (5,  'maria.ruiz@example.com',     'maria.ruiz',     'Maria Ruiz',       'word',  3, 1, CAST('2025-04-01' AS DATE), 'RFCMRZ6789');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (6,  'david.torres@example.com',   'david.torres',   'David Torres',     'clave', 3, 1, CAST('2025-04-01' AS DATE), 'RFCDTR0123');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (7,  'luis.fernandez@example.com', 'luis.fernandez', 'Luis Fernandez',   'test',  3, 1, CAST('2025-04-01' AS DATE), 'RFCLFD4567');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (8,  'elena.morales@example.com',  'elena.morales',  'Elena Morales',    'safe',  3, 1, CAST('2025-04-01' AS DATE), 'RFCEML8910');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (9,  'jorge.rojas@example.com',    'jorge.rojas',    'Jorge Rojas',      'code',  3, 1, CAST('2025-04-01' AS DATE), 'RFCJRJ2345');
INSERT INTO Usuario2 (Usuario_ID, Correo, Username, Nombre, Clave, Rol_ID, Location_ID, FechaEmpiezo, RFC)
VALUES (10, 'sofia.castillo@example.com', 'sofia.castillo', 'Sofia Castillo',   'login', 3, 1, CAST('2025-04-01' AS DATE), 'RFCSFC6789');

-- ========================================
-- 5. ARTÍCULOS (Articulo2)
-- ========================================
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (1,  'Playera Básica S',    'Playera', 50.00, 100.00, 'Verano');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (2,  'Playera Básica M',    'Playera', 50.00, 100.00, 'Verano');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (3,  'Playera Básica G',    'Playera', 50.00, 100.00, 'Verano');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (4,  'Playera Estampada S', 'Playera', 60.00, 120.00, 'Verano');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (5,  'Playera Estampada M', 'Playera', 60.00, 120.00, 'Verano');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (6,  'Playera Estampada G', 'Playera', 60.00, 120.00, 'Verano');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (7,  'Playera Polo S',      'Playera', 70.00, 140.00, 'Primavera');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (8,  'Playera Polo M',      'Playera', 70.00, 140.00, 'Primavera');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (9,  'Playera Polo G',      'Playera', 70.00, 140.00, 'Primavera');
INSERT INTO Articulo2 (Articulo_ID, Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
VALUES (10, 'Playera Slim Fit M',  'Playera', 80.00, 160.00, 'Primavera');

-- ========================================
-- 6. INVENTARIO (Inventario2)
-- ========================================
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (1,  1, 8,  120, 30, 0, 0, 50, CAST('2025-04-01' AS DATE), CAST('2025-04-20' AS DATE), 50, 5, 20, 40);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (2,  2, 8,  100, 25, 0, 0, 50, CAST('2025-04-01' AS DATE), CAST('2025-04-19' AS DATE), 50, 5, 20, 35);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (3,  3, 8,   80, 20, 0, 0, 50, CAST('2025-04-01' AS DATE), CAST('2025-04-18' AS DATE), 50, 5, 15, 30);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (4,  4, 9,   60, 15, 0, 0, 50, CAST('2025-04-03' AS DATE), CAST('2025-04-21' AS DATE), 50, 6, 10, 25);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (5,  5, 9,   70, 20, 0, 0, 50, CAST('2025-04-03' AS DATE), CAST('2025-04-21' AS DATE), 50, 6, 12, 28);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (6,  6, 9,   50, 10, 0, 0, 50, CAST('2025-04-03' AS DATE), CAST('2025-04-21' AS DATE), 50, 6, 10, 22);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (7,  7,10,   90, 20, 0, 0, 50, CAST('2025-04-02' AS DATE), CAST('2025-04-19' AS DATE), 50, 7, 10, 20);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (8,  8,10,  100, 25, 0, 0, 50, CAST('2025-04-02' AS DATE), CAST('2025-04-19' AS DATE), 50, 7, 12, 23);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (9,  9,10,   85, 20, 0, 0, 50, CAST('2025-04-02' AS DATE), CAST('2025-04-19' AS DATE), 50, 7, 11, 21);
INSERT INTO Inventario2 (Inventario_ID, Articulo_ID, Location_ID, StockActual, StockMinimo, Importacion, Exportacion, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion, MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio)
VALUES (10,10,10,   75, 18, 0, 0, 50, CAST('2025-04-05' AS DATE), CAST('2025-04-22' AS DATE), 50, 8, 12, 24);

-- ========================================
-- 7. FABRICACIÓN (Fabricacion2)
-- ========================================
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (1,  2,  1);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (2,  2,  2);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (3,  3,  3);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (4,  9,  4);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (5,  9,  5);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (6,  9,  6);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (7, 10,  7);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (8, 10,  8);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (9, 10,  9);
INSERT INTO Fabricacion2 (Fabricacion_ID, Location_ID, Articulo_ID) VALUES (10,10, 10);

-- ========================================
-- 8. ÓRDENES (Ordenes2) – corrección de aritmética de fechas
-- ========================================
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  1, 1, 1, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 3),
  ADD_DAYS(CURRENT_DATE, 10),
  ADD_DAYS(CURRENT_DATE, 15),
  ADD_DAYS(CURRENT_DATE, 16),
  TRUE, 'Completado', 1500.00,
  1, 100.00, 2, 1
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  2, 2, 2, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 2),
  ADD_DAYS(CURRENT_DATE, 7),
  ADD_DAYS(CURRENT_DATE, 10),
  ADD_DAYS(CURRENT_DATE, 11),
  TRUE, 'Pendiente', 750.00,
  2,  50.00, 3, 1
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  3, 3, 3, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 6),
  ADD_DAYS(CURRENT_DATE, 12),
  ADD_DAYS(CURRENT_DATE, 17),
  ADD_DAYS(CURRENT_DATE, 18),
  FALSE, 'En Reparto', 500.00,
  3,   0.00, 5, 2
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  4, 1, 1, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 4),
  ADD_DAYS(CURRENT_DATE, 8),
  ADD_DAYS(CURRENT_DATE, 12),
  ADD_DAYS(CURRENT_DATE, 13),
  TRUE, 'Completado', 2000.00,
  1, 200.00, 1, 1
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  5, 2, 2, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 5),
  ADD_DAYS(CURRENT_DATE, 9),
  ADD_DAYS(CURRENT_DATE, 14),
  ADD_DAYS(CURRENT_DATE, 15),
  FALSE, 'Pendiente', 1200.00,
  2, 100.00, 4, 2
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  6, 3, 3, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 5),
  ADD_DAYS(CURRENT_DATE, 11),
  ADD_DAYS(CURRENT_DATE, 16),
  ADD_DAYS(CURRENT_DATE, 17),
  TRUE, 'En Reparto', 1800.00,
  1, 150.00, 2, 1
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  7, 1, 1, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 3),
  ADD_DAYS(CURRENT_DATE, 6),
  ADD_DAYS(CURRENT_DATE, 9),
  ADD_DAYS(CURRENT_DATE, 10),
  TRUE, 'Completado', 900.00,
  3,  25.00, 2, 1
);

INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  8, 2, 2, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 4),
  ADD_DAYS(CURRENT_DATE, 9),
  ADD_DAYS(CURRENT_DATE, 13),
  ADD_DAYS(CURRENT_DATE, 14),
  TRUE, 'Pendiente', 2100.00,
  1,   0.00, 3, 1
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  9, 3, 3, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 4),
  ADD_DAYS(CURRENT_DATE, 7),
  ADD_DAYS(CURRENT_DATE, 11),
  ADD_DAYS(CURRENT_DATE, 12),
  FALSE, 'En Reparto', 650.00,
  2,  30.00, 5, 2
);
INSERT INTO Ordenes2 (
  Orden_ID, Creado_por_ID, Modificado_por_ID, TipoOrden, Organizacion,
  FechaCreacion, FechaAceptacion, FechaLimitePago,
  FechaEstimadaEntrega, FechaEntrega, EntregaATiempo, Estado, Total,
  MetodoPago_ID, DescuentoAplicado, TiempoReposicion, TiempoEntrega
) VALUES (
  10, 1, 1, 'Venta', 'RopaExpress',
  CURRENT_DATE,
  ADD_DAYS(CURRENT_DATE, 6),
  ADD_DAYS(CURRENT_DATE, 13),
  ADD_DAYS(CURRENT_DATE, 17),
  ADD_DAYS(CURRENT_DATE, 18),
  TRUE, 'Completado', 3000.00,
  1, 300.00, 2, 1
);

-- ========================================
-- 9. PRODUCTOS EN ÓRDENES (OrdenesProductos2)
-- ========================================
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (1,  1, 1, 2, 100.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (2,  1, 2, 1, 100.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (3,  2, 4, 2, 120.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (4,  2, 5, 1, 120.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (5,  3, 7, 2, 140.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (6,  4, 8, 2, 140.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (7,  5, 6, 2, 120.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (8,  6, 3, 1, 100.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (9,  6, 9, 1, 140.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (10, 7,10, 2, 160.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (11, 8, 2, 2, 100.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (12, 9, 1, 1, 100.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (13, 9, 5, 1, 120.00);
INSERT INTO OrdenesProductos2 (OrdenesProductos_ID, Orden_ID, Inventario_ID, Cantidad, PrecioUnitario) VALUES (14,10, 6, 2, 120.00);

-- ========================================
-- 10. COMENTARIOS DE ÓRDENES (ComentariosOrdenes2)
-- ========================================
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (1,  1, 1, 'Orden procesada correctamente.',        CAST('2025-04-02 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (2,  2, 2, 'Cliente satisfecho.',                   CAST('2025-04-03 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (3,  3, 3, 'Pago recibido sin problemas.',          CAST('2025-04-04 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (4,  4, 1, 'Producto entregado a tiempo.',          CAST('2025-04-05 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (5,  5, 2, 'Sin inconvenientes en esta orden.',     CAST('2025-04-06 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (6,  6, 3, 'Confirmación de entrega realizada.',   CAST('2025-04-07 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (7,  7, 1, 'Buena calidad en los productos.',       CAST('2025-04-08 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (8,  8, 2, 'Descuento aplicado correctamente.',     CAST('2025-04-09 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (9,  9, 3, 'Cliente expresó dudas con el empaque.', CAST('2025-04-10 00:00:00' AS TIMESTAMP));
INSERT INTO ComentariosOrdenes2 (Comentario_ID, Orden_ID, Creado_por_ID, Comentario, FechaCreado) VALUES (10,10, 4, 'Orden con retraso leve.',               CAST('2025-04-11 00:00:00' AS TIMESTAMP));

-- ========================================
-- 11. PAGOS POR ÓRDEN (PagoOrden2)
-- ========================================
INSERT INTO PagoOrden2 (Pago_ID, Orden_ID, MetodoPago_ID, EstadoPago, ComentarioPago, FechaPago, DescuentoAplicado)
VALUES (1,  1, 1, 'Completado', 'Pago vía transferencia', CAST('2025-04-12' AS DATE), 100.00);
INSERT INTO PagoOrden2 (Pago_ID, Orden_ID, MetodoPago_ID, EstadoPago, ComentarioPago, FechaPago, DescuentoAplicado)
VALUES (2,  2, 2, 'Completado', 'Pago con tarjeta',       CAST('2025-04-08' AS DATE),  50.00);
INSERT INTO PagoOrden2 (Pago_ID, Orden_ID, MetodoPago_ID, EstadoPago, ComentarioPago, FechaPago, DescuentoAplicado)
VALUES (3,  4, 1, 'Completado', 'Pago vía transferencia', CAST('2025-04-09' AS DATE), 200.00);
INSERT INTO PagoOrden2 (Pago_ID, Orden_ID, MetodoPago_ID, EstadoPago, ComentarioPago, FechaPago, DescuentoAplicado)
VALUES (4,  6, 1, 'Completado', 'Pago vía transferencia', CAST('2025-04-13' AS DATE), 150.00);
INSERT INTO PagoOrden2 (Pago_ID, Orden_ID, MetodoPago_ID, EstadoPago, ComentarioPago, FechaPago, DescuentoAplicado)
VALUES (5,  7, 3, 'Completado', 'Pago en efectivo',       CAST('2025-04-07' AS DATE),  25.00);
INSERT INTO PagoOrden2 (Pago_ID, Orden_ID, MetodoPago_ID, EstadoPago, ComentarioPago, FechaPago, DescuentoAplicado)
VALUES (6,  9, 2, 'Completado', 'Pago con tarjeta',       CAST('2025-04-08' AS DATE),  30.00);

-- ========================================
-- 12. HISTORIAL DE PRODUCTOS (HistorialProductos2)
-- ========================================
INSERT INTO HistorialProductos2 (Historial_ID, Inventario_ID, Location_ID, Anio, Mes, Importacion, Exportacion, StockStart, StockEnd)
VALUES (1, 1, 8, 2025, 4, 120, 80, 150, 120);
INSERT INTO HistorialProductos2 (Historial_ID, Inventario_ID, Location_ID, Anio, Mes, Importacion, Exportacion, StockStart, StockEnd)
VALUES (2, 2, 8, 2025, 4, 100, 65, 130, 100);

-- ========================================
-- 14. BITÁCORA MAESTRA (Bitacora_Maestra2)
-- ========================================
INSERT INTO Bitacora_Maestra2 (Bitacora_ID, Nombre) VALUES (1, 'Órdenes');
INSERT INTO Bitacora_Maestra2 (Bitacora_ID, Nombre) VALUES (2, 'Productos');
INSERT INTO Bitacora_Maestra2 (Bitacora_ID, Nombre) VALUES (3, 'Usuarios');
INSERT INTO Bitacora_Maestra2 (Bitacora_ID, Nombre) VALUES (4, 'Precios');

-- ========================================
-- 15. BITÁCORA GENERAL (Bitacora_General2)
-- ========================================
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (1, 1, 1, 'FechaCreacion',       'Fecha en la que se creó la orden');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (2, 1, 2, 'Total',               'Total pagado en la orden');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (3, 2, 1, 'PrecioVenta',         'Precio actual del producto');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (4, 2, 2, 'StockActual',         'Cantidad en stock disponible');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (5, 3, 1, 'Rol',                 'Rol asignado al usuario');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (6, 3, 2, 'Organizacion',        'Organización del usuario');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (7, 4, 1, 'PrecioCompraProm',    'Promedio del precio de compra del producto');
INSERT INTO Bitacora_General2 (General_ID, MaestraID, CampoID, Nombre, Descripcion) VALUES (8, 4, 2, 'PrecioVentaProm',     'Promedio del precio de venta del producto');


