const { Router } = require('express');
const router = Router();
const { listarTarifarioPorProducto } = require('../../controllers/debug/Debug.Controller');

router.get('/tarifario-producto/:id_producto', listarTarifarioPorProducto);

module.exports = router;
