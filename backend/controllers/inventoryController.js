const { connection } = require("../config/db");


const getInventory = async (req, res) => {
  // const {id, proveedor, nombre, categoria, stockActual, stockMinimo, fechaUltimaCompra, fechaUltimaVenta, precioCompra, precioVenta} = req.body;

  try {
    const query = `
      SELECT
        ID, 
        PROVEEDOR,
        NOMBRE,
        CATEGORIA,
        STOCKACTUAL,
        STOCKMINIMO,
        FECHAULTIMACOMPRA,
        FECHAULTIMAVENTA,
        PRECIOCOMPRA,
        PRECIOVENTA
      FROM DBADMIN.Productos
    `;
    // const params = [id, proveedor, nombre, categoria, stockActual, stockMinimo, fechaUltimaCompra, fechaUltimaVenta, precioCompra, precioVenta];

    connection.exec(query, [], async (err, result) => {
      if (err) {
        console.error("Error al obtener inventario:", err);
        return res.status(500).json({ error: "Error al obtener inventario" });
      }

      const formatted = result.map(producto => ({
        id: producto.ID,
        proveedor: producto.PROVEEDOR,
        nombre: producto.NOMBRE,
        categoria: producto.CATEGORIA,
        stockActual: producto.STOCKACTUAL,
        stockMinimo: producto.STOCKMINIMO,
        fechaUltimaCompra: producto.FECHAULTIMACOMPRA,
        fechaUltimaVenta: producto.FECHAULTIMAVENTA,
        precioCompra: producto.PRECIOCOMPRA,
        precioVenta: producto.PRECIOVENTA,
        temporada: producto.TEMPORADA,
        margenGanancia: producto.MARGENGANANCIA,
        tiempoReposicionProm: producto.TIEMPOREPOSIPROM,
        demandaProm: producto.DEMANDAPROM,
        stockSeguridad: producto.STOCKSEGURIDAD
      }));
      console.log(formatted)
      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const insertInventory = async (req, res) => {
  const { id, nombre, descripcion, estatus, stock, cantidadFaltante, diasParaRestock } = req.body;

  try {
    const checkTableQuery = `
      SELECT * 
      FROM SYS.TABLES 
      WHERE SCHEMA_NAME = 'DBADMIN' AND TABLE_NAME = 'PRODUCTOS';
    `;

    connection.exec(checkTableQuery, [], (err, result) => {
      if (err) {
        console.error("Error al verificar la existencia de la tabla:", err);
        return res.status(500).json({ error: "Error al verificar la tabla" });
      }

      if (result.length === 0) {
        return res.status(400).json({ error: "La tabla 'Productos' no existe" });
      }

      const insertQuery = `
        INSERT INTO DBADMIN.Productos 
        (ID, Nombre, Descripcion, Estatus, StockActual, CantidadFaltante, DiasParaRestock)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [id, nombre, descripcion, estatus, stock, cantidadFaltante, diasParaRestock];

      connection.prepare(insertQuery, (err, statement) => {
        if (err) {
          console.error("Error al preparar la consulta de inserción:", err);
          return res.status(500).json({ error: "Error al preparar la consulta" });
        }

        statement.execute(params, (err, result) => {
          if (err) {
            console.error("Error al ejecutar la consulta de inserción:", err);
            return res.status(500).json({ error: "Error al insertar datos" });
          }

          res.status(200).json({ message: "Producto agregado exitosamente" });
        });
      });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};


const getInventoryById = async (req, res) => {
  const id = req.params.id;
  
  try {
    const query = `
      SELECT 
        ID, 
        Nombre, 
        Categoria, 
        StockActual, 
        StockMinimo, 
        FechaUltimaCompra, 
        PrecioCompra, 
        PrecioVenta,
        Temporada,
        MargenGanancia,
        TiempReposiProm,
        DemandaProm,
        StockSeguridad
      FROM DBADMIN.Productos
      WHERE ID = ?
    `;

    connection.exec(query, [id], (err, result) => {
      if (err) {
        console.error("Error al obtener producto:", err);
        return res.status(500).json({ error: "Error al obtener producto" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      const producto = result[0];
      const formatted = {
        id: producto.ID,
        nombre: producto.NOMBRE,
        categoria: producto.CATEGORIA,
        stockActual: producto.STOCKACTUAL,
        stockMinimo: producto.STOCKMINIMO,
        fechaUltimaCompra: producto.FECHAULTIMACOMPRA,
        precioCompra: producto.PRECIOCOMPRA,
        precioVenta: producto.PRECIOVENTA,
        temporada: producto.TEMPORADA,
        margenGanancia: producto.MARGENGANANCIA,
        tiempoReposicionProm: producto.TIEMPOREPOSIPROM,
        demandaProm: producto.DEMANDAPROM,
        stockSeguridad: producto.STOCKSEGURIDAD
      };

      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar un producto
const updateInventory = async (req, res) => {
  const id = req.params.id;
  const { 
    nombre, 
    categoria, 
    stockActual, 
    stockMinimo, 
    fechaUltimaCompra, 
    precioCompra, 
    precioVenta,
    temporada
  } = req.body;

  try {
    // Verificar si el producto existe
    const checkQuery = `SELECT ID FROM DBADMIN.Productos WHERE ID = ?`;
    
    connection.exec(checkQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al verificar el producto:", err);
        return res.status(500).json({ error: "Error al verificar el producto" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Construir la consulta de actualización
      const updateQuery = `
        UPDATE DBADMIN.Productos
        SET 
          Nombre = ?,
          Categoria = ?,
          StockActual = ?,
          StockMinimo = ?,
          FechaUltimaCompra = ?,
          PrecioCompra = ?,
          PrecioVenta = ?,
          Temporada = ?
        WHERE ID = ?
      `;

      const params = [
        nombre,
        categoria,
        stockActual,
        stockMinimo,
        fechaUltimaCompra,
        precioCompra,
        precioVenta,
        temporada,
        id
      ];

      connection.prepare(updateQuery, (err, statement) => {
        if (err) {
          console.error("Error al preparar la consulta de actualización:", err);
          return res.status(500).json({ error: "Error al preparar la consulta" });
        }

        statement.execute(params, (err, result) => {
          if (err) {
            console.error("Error al ejecutar la consulta de actualización:", err);
            return res.status(500).json({ error: "Error al actualizar producto" });
          }

          res.status(200).json({ message: "Producto actualizado exitosamente" });
        });
      });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Eliminar un producto
const deleteInventory = async (req, res) => {
  const id = req.params.id;

  try {
    // Verificar si el producto existe
    const checkQuery = `SELECT ID FROM DBADMIN.Productos WHERE ID = ?`;
    
    connection.exec(checkQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al verificar el producto:", err);
        return res.status(500).json({ error: "Error al verificar el producto" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Proceder con la eliminación
      const deleteQuery = `DELETE FROM DBADMIN.Productos WHERE ID = ?`;

      connection.exec(deleteQuery, [id], (err, result) => {
        if (err) {
          console.error("Error al eliminar el producto:", err);
          return res.status(500).json({ error: "Error al eliminar el producto" });
        }

        res.status(200).json({ message: "Producto eliminado exitosamente" });
      });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getInventory,
  insertInventory,
  getInventoryById,
  updateInventory,
  deleteInventory
};