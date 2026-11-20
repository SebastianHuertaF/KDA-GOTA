-- Reemplazo total de los datos de bebederos (nuevo mapeo oficial, un pabellón por zona).
-- Se borran bebederos y todo lo que cuelga de ellos; los usuarios (admin) se conservan.
-- Es necesario hacerlo antes de agregar "codigo", que es NOT NULL y único.
DELETE FROM "ControlCalidad";
DELETE FROM "Reporte";
DELETE FROM "CodigoQR";
DELETE FROM "Bebedero";
DELETE FROM "Pabellon";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bebedero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "latitud" REAL NOT NULL,
    "longitud" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "pabellon_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "deleted_by" INTEGER,
    CONSTRAINT "Bebedero_pabellon_id_fkey" FOREIGN KEY ("pabellon_id") REFERENCES "Pabellon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bebedero" ("activo", "createdAt", "deleted_at", "deleted_by", "estado", "id", "latitud", "longitud", "pabellon_id", "updatedAt") SELECT "activo", "createdAt", "deleted_at", "deleted_by", "estado", "id", "latitud", "longitud", "pabellon_id", "updatedAt" FROM "Bebedero";
DROP TABLE "Bebedero";
ALTER TABLE "new_Bebedero" RENAME TO "Bebedero";
CREATE UNIQUE INDEX "Bebedero_codigo_key" ON "Bebedero"("codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
