const { Router } = require("express");
const router = Router();
const { compareProducto } = require("../../controllers/compare/Compare.Controller");

// GET /pec/compare/producto/:productoId
router.get("/producto/:productoId", compareProducto);

module.exports = router;
