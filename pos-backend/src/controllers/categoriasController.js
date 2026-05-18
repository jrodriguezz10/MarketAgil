const pool = require('../db/pool');

const selectCategoriaById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, descripcion FROM categorias WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const listCategorias = async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, descripcion FROM categorias ORDER BY nombre'
  );
  res.json(rows);
};

const createCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  const nombreValue = String(nombre || '').trim();
  const descripcionValue = descripcion ? String(descripcion).trim() : null;

  if (!nombreValue) {
    return res.status(400).json({ message: 'El nombre es obligatorio.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombreValue, descripcionValue || null]
    );
    const categoria = await selectCategoriaById(result.insertId);
    return res.status(201).json(categoria);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }
    throw error;
  }
};

const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const nombreValue = nombre === undefined ? null : String(nombre || '').trim();
  const descripcionValue = descripcion === undefined ? null : String(descripcion || '').trim();

  if (nombre !== undefined && !nombreValue) {
    return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE categorias SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion) WHERE id = ?',
      [nombreValue, descripcionValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    const categoria = await selectCategoriaById(id);
    return res.json(categoria);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }
    throw error;
  }
};

const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM categorias WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Categoría no encontrada.' });
  }

  res.status(204).send();
};

module.exports = {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
