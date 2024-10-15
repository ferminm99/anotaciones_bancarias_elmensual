const express = require("express");
const router = express.Router();
const connection = require("../db");

// Ruta para obtener todas las transacciones
router.get("/", (req, res) => {
  const query = `
    SELECT 
      transacciones.transaccion_id AS transaccion_id, 
      transacciones.fecha, 
      transacciones.tipo, 
      transacciones.monto, 
      bancos.nombre AS nombre_banco, 
      CONCAT(clientes.nombre, ' ', IFNULL(clientes.apellido, '')) AS nombre_cliente
    FROM transacciones
    JOIN bancos ON transacciones.banco_id = bancos.banco_id
    LEFT JOIN clientes ON transacciones.cliente_id = clientes.cliente_id
  `;

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results); // Enviar los datos al frontend
  });
});
// Ruta para agregar una nueva transacción
router.post("/", (req, res) => {
  const { fecha, nombre_cliente, cliente_id, tipo, monto, banco_id } = req.body;
  const formattedFecha = new Date(fecha);

  // Si cliente_id es null o undefined, simplemente insertamos la transacción sin cliente
  if (cliente_id) {
    // Si tenemos un cliente_id, no necesitamos buscar al cliente, solo insertamos la transacción
    insertarTransaccion(cliente_id, nombre_cliente);
  } else if (!nombre_cliente || nombre_cliente.trim() === "") {
    // Si no tenemos cliente_id ni nombre_cliente, insertar transacción sin cliente
    insertarTransaccion(null, null);
  } else {
    // Si no tenemos cliente_id, pero sí nombre_cliente, verificamos si el cliente existe por nombre y apellido
    const clienteDividido = nombre_cliente.split(" ");
    let nombre = clienteDividido.slice(0, -1).join(" "); // Todas las palabras excepto la última
    let apellido = clienteDividido.slice(-1).join(" "); // Solo la última palabra

    if (clienteDividido.length === 1) {
      nombre = clienteDividido[0]; // Si solo hay una palabra, se toma como nombre
      apellido = null; // Apellido es nulo
    }

    const queryCliente =
      "SELECT cliente_id FROM clientes WHERE nombre = ? AND (apellido = ? OR apellido IS NULL)";

    connection.query(queryCliente, [nombre, apellido], (err, result) => {
      if (err) {
        console.error("Error en la consulta de cliente:", err);
        res.status(500).send("Error en la consulta de cliente");
        return;
      }

      let cliente_id; // Declaramos cliente_id con let para poder reasignarlo

      if (result.length > 0) {
        cliente_id = result[0].cliente_id;
        insertarTransaccion(cliente_id, nombre + " " + apellido); // Pasar nombre completo
      } else {
        const insertCliente =
          "INSERT INTO clientes (nombre, apellido) VALUES (?, ?)";
        connection.query(insertCliente, [nombre, apellido], (err, result) => {
          if (err) {
            console.error("Error al insertar cliente:", err);
            res.status(500).send("Error al insertar cliente");
            return;
          }
          cliente_id = result.insertId; // Ahora cliente_id puede ser reasignado
          insertarTransaccion(cliente_id, nombre + " " + apellido); // Pasar nombre completo
        });
      }
    });
  }

  // Modificar la función insertarTransaccion para aceptar nombre_cliente como argumento
  function insertarTransaccion(cliente_id, nombre_cliente) {
    const query =
      "INSERT INTO transacciones (fecha, cliente_id, tipo, monto, banco_id) VALUES (?, ?, ?, ?, ?)";

    // En la consulta, si cliente_id es null, lo pasamos como NULL
    connection.query(
      query,
      [formattedFecha, cliente_id || null, tipo, monto, banco_id],
      (err, result) => {
        if (err) {
          console.error("Error al insertar transacción:", err);
          res.status(500).send("Error al insertar transacción");
          return;
        }

        // Ejemplo de respuesta desde el backend en la inserción de transacciones
        res.json({
          message: "Transacción agregada con éxito",
          transaccion_id: result.insertId,
          cliente_id: cliente_id,
          nombre_cliente: nombre_cliente, // Ahora está bien definido
          banco_id: banco_id,
          fecha: formattedFecha,
          tipo: tipo,
          monto: monto,
        });
      }
    );
  }
});

// Ruta para actualizar una transacción existente
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { fecha, nombre_cliente, cliente_id, tipo, monto, banco_id } = req.body;
  const formattedFecha = new Date(fecha);
  console.log("Datos recibidos en PUT:", req.body);
  console.log(banco_id);

  if (cliente_id) {
    // Si tenemos un cliente_id, actualizamos directamente la transacción
    actualizarTransaccion(cliente_id, nombre_cliente);
  } else if (!nombre_cliente || nombre_cliente.trim() === "") {
    // Si no tenemos cliente_id ni nombre_cliente, actualizamos la transacción sin cliente
    actualizarTransaccion(null, null);
  } else {
    // Si no tenemos cliente_id, pero sí nombre_cliente, buscamos al cliente por su nombre y apellido
    const clienteDividido = nombre_cliente.split(" ");
    let nombre = clienteDividido.slice(0, -1).join(" ");
    let apellido = clienteDividido.slice(-1).join(" ");

    if (clienteDividido.length === 1) {
      nombre = clienteDividido[0];
      apellido = null;
    }

    const queryCliente =
      "SELECT cliente_id FROM clientes WHERE nombre = ? AND (apellido = ? OR apellido IS NULL)";

    connection.query(queryCliente, [nombre, apellido], (err, result) => {
      if (err) {
        console.error("Error en la consulta de cliente:", err);
        res.status(500).send("Error en la consulta de cliente");
        return;
      }

      let cliente_id;

      if (result.length > 0) {
        cliente_id = result[0].cliente_id;
        console.log("Cliente ID: ", cliente_id);
        actualizarTransaccion(cliente_id, nombre + " " + apellido);
      } else {
        const insertCliente =
          "INSERT INTO clientes (nombre, apellido) VALUES (?, ?)";
        connection.query(insertCliente, [nombre, apellido], (err, result) => {
          if (err) {
            console.error("Error al insertar cliente:", err);
            res.status(500).send("Error al insertar cliente");
            return;
          }
          cliente_id = result.insertId;
          console.log("Cliente ID: ", cliente_id);
          actualizarTransaccion(cliente_id, nombre + " " + apellido);
        });
      }
    });
  }

  function actualizarTransaccion(cliente_id, nombre_cliente) {
    console.log("LLEGA A ACTUALIZAR");
    const query =
      "UPDATE transacciones SET fecha = ?, cliente_id = ?, tipo = ?, monto = ?, banco_id = ? WHERE transaccion_id = ?";

    // Si cliente_id es nulo, lo pasamos como null en la consulta SQL
    connection.query(
      query,
      [formattedFecha, cliente_id || null, tipo, monto, banco_id, id],
      (err, result) => {
        if (err) {
          console.error("Error al actualizar la transacción:", err);
          res.status(500).send("Error al actualizar la transacción");
          return;
        }
        console.log(
          " BANCO MONTO Y TIPO ",
          banco_id + " " + monto + " " + tipo + " " + fecha
        );
        res.json({
          message: "Transacción actualizada con éxito",
          transaccion_id: id,
          cliente_id: cliente_id,
          nombre_cliente: nombre_cliente,
          banco_id: banco_id,
          fecha: formattedFecha,
          tipo: tipo,
          monto: monto,
        });
      }
    );
  }
});

// router.put("/:id", (req, res) => {
//   console.log("PUT request received for transaction ID:", req.params.id); // Verifica que esto se imprima
//   // Tu lógica de actualización aquí...
// });

// Ruta para eliminar una transacción
router.delete("/:id", (req, res) => {
  const { id } = req.params; // Extraer el ID correctamente

  // Consulta SQL para eliminar la transacción
  const query = "DELETE FROM transacciones WHERE transaccion_id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar la transacción:", err);
      return res
        .status(500)
        .json({ message: "Error al eliminar la transacción" });
    }

    if (result.affectedRows > 0) {
      console.log("Transacción eliminada con éxito:", id); // Log si se elimina correctamente
      res.json({ message: "Transacción eliminada con éxito" });
    } else {
      console.log("Transacción no encontrada:", id); // Log si no se encuentra
      res.status(404).json({ message: "Transacción no encontrada" });
    }
  });
});

module.exports = router;
