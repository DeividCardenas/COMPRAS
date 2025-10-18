Data dump & import helper

This folder includes two helper scripts to extract DB data to JSON and re-import it idempotently.

Files:
- `scripts/dump_data.js`: reads tables and writes JSON files to `backend/data/`.
- `scripts/import_from_dump.js`: reads `backend/data/*.json` and performs upserts to recreate the data.

How to use
1. From the `backend` dir run:

```cmd
npm install
npm run dump:data
```

2. Inspect the files created in `backend/data/`.

3. To import those files into another database (or the same) run:

```cmd
npm run import:dump
```

Notes and caveats
- The import script attempts to be idempotent using logical unique keys (e.g. `Producto.cum`, `Empresa.nombre`, `Tarifario.nombre`).
- The import expects certain fields to exist in the JSON (e.g. `cum` for productos). Large differences in shape may require minor adjustments.
- If your schema has additional required fields, update the import script to provide defaults.
- For privacy, you can redact or obfuscate sensitive fields before sharing the JSON files.
