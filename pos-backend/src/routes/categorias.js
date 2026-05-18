const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
} = require('../controllers/categoriasController');

const router = express.Router();

router.get('/', asyncHandler(listCategorias));
router.post('/', asyncHandler(createCategoria));
router.put('/:id', asyncHandler(updateCategoria));
router.delete('/:id', asyncHandler(deleteCategoria));

module.exports = router;
