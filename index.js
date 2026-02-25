import express, { json } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { pool } from "./db.js"

const app = express()
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.json({message: "servidor corriendo perfectamente"})
})

app.get("/movies", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM movies")
        res.json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: "Error al obtener películas" })
    }
})

app.post('/movies', async (req, res) => {
  const { title, year, genre } = req.body;

  if (!title || !year || !genre) {
    return res.status(400).json({ msg: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO movies (title, year, genre) VALUES (?, ?, ?)',
      [title, year, genre]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      year,
      genre
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la película' });
  }
});

app.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { title, year, genre } = req.body;

  if (!title || !year || !genre) {
    return res.status(400).json({ msg: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE movies SET title = ?, year = ?, genre = ? WHERE id = ?',
      [title, year, genre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Película no encontrada' });
    }

    res.json({
      msg: 'Película actualizada correctamente',
      id,
      title,
      year,
      genre
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar la película' });
  }
});

app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM movies WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Película no encontrada' });
    }

    res.json({ msg: 'Película eliminada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar la película' });
  }
});

pool.getConnection()
  .then(connection => {
    console.log("✅ Conectado a MySQL correctamente")
    connection.release()
  })
  .catch(err => {
    console.error("❌ Error conectando a MySQL:", err)
})

app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000")
})