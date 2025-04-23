CREATE TABLE Usuarios (
    Correo VARCHAR(255) PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Organizacion VARCHAR(255),
    Contrasena VARCHAR(255) NOT NULL,
    Rol VARCHAR(50) NOT NULL,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    --Andre
    DiasOrdenProm NUMERIC DEFAULT 0,
    ValorOrdenProm NUMERIC DEFAULT 0
);

CREATE TABLE Ordenes (
    ID INT PRIMARY KEY,
    Creada_por VARCHAR(255) NOT NULL,
    TipoOrden VARCHAR(50) NOT NULL,
    Organizacion VARCHAR(255),
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaEstimaAceptacion TIMESTAMP,
    FechaAceptacion TIMESTAMP,
    FechaEstimaPago TIMESTAMP,
    FechaPago TIMESTAMP,
    ComprobantePago VARCHAR(255),
    FechaEstimaEntrega TIMESTAMP,
    FechaEntrega TIMESTAMP,
    EntregaATiempo BOOLEAN,
    Calidad VARCHAR(50),
    Estatus VARCHAR(50) NOT NULL,
    Total DECIMAL(10,2),
    --Andre
    MetodoPago VARCHAR(50),
    DescuentoAplicado NUMERIC DEFAULT 0,
    TiempoReposicion NUMERIC,
    TiempoEntrega NUMERIC,

    FOREIGN KEY (Creada_por) REFERENCES Usuarios(Correo)
);

CREATE TABLE ComentariosOrdenes (
    ID INT PRIMARY KEY,
    OrdenID INT NOT NULL,
    Creado_por VARCHAR(255) NOT NULL,
    Comentario NVARCHAR(5000) NOT NULL,
    FechaCreado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrdenID) REFERENCES Ordenes(ID),
    FOREIGN KEY (Creado_por) REFERENCES Usuarios(Correo)
);

CREATE TABLE Productos (
    ID INT PRIMARY KEY,
    Proveedor VARCHAR(255) NOT NULL,
    Nombre VARCHAR(255) NOT NULL,
    Categoria VARCHAR(255),
    StockActual INT NOT NULL,
    StockMinimo INT DEFAULT 0,
    FechaUltimaCompra TIMESTAMP,
    FechaUltimaVenta TIMESTAMP,
    PrecioCompra NUMERIC NOT NULL,
    PrecioVenta NUMERIC NOT NULL,
    --Andre
    Temporada VARCHAR(50),
    MargenGanancia NUMERIC,
    TiempReposiProm NUMERIC,
    DemandaProm NUMERIC,
    StockSeguridad NUMERIC
);

CREATE TABLE OrdenesProductos (
    ID INT PRIMARY KEY,
    OrdenID INT NOT NULL,
    ProductID INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario NUMERIC NOT NULL,
    FOREIGN KEY (OrdenID) REFERENCES Ordenes(ID),
    FOREIGN KEY (ProductID) REFERENCES Productos(ID)
);

CREATE TABLE HistorialPreciosProductos (
    ID INT PRIMARY KEY,
    ProductID INT NOT NULL,
    PrecioCompra DECIMAL(10,2) NOT NULL,
    PrecioVenta DECIMAL(10,2) NOT NULL,
    FechaCambio TIMESTAMP NOT NULL,
    MotivoCambio NVARCHAR(500),
    --Andre
    PrecioCompraProm NUMERIC,
    PrecioVentaProm NUMERIC,

    FOREIGN KEY (ProductID) REFERENCES Productos(ID)
);

CREATE TABLE Bitacora_Maestra (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL
);

CREATE TABLE Bitacora_General (
    ID INT PRIMARY KEY,
    MaestroID INT NOT NULL,
    CampoID INT NOT NULL,
    Nombre VARCHAR(255) NOT NULL,
    Descripcion NVARCHAR(500),
    FOREIGN KEY (MaestroID) REFERENCES Bitacora_Maestra(ID)
);
