-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "latest_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "deleted_by" INTEGER
);

-- CreateTable
CREATE TABLE "Pabellon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "abreviation" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "deleted_by" INTEGER
);

-- CreateTable
CREATE TABLE "Bebedero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

-- CreateTable
CREATE TABLE "CodigoQR" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "bebedero_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "deleted_by" INTEGER,
    CONSTRAINT "CodigoQR_bebedero_id_fkey" FOREIGN KEY ("bebedero_id") REFERENCES "Bebedero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "estado" TEXT NOT NULL,
    "fecha_revision" DATETIME NOT NULL,
    "observacion" TEXT,
    "correo_reporte" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "bebedero_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "deleted_by" INTEGER,
    CONSTRAINT "Reporte_bebedero_id_fkey" FOREIGN KEY ("bebedero_id") REFERENCES "Bebedero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ControlCalidad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre_responsable" TEXT NOT NULL,
    "apellido_paterno_responsable" TEXT NOT NULL,
    "apellido_materno_responsable" TEXT NOT NULL,
    "fecha_control" DATETIME NOT NULL,
    "fecha_resolucion" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'SOLICITADO',
    "observacion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "reporte_id" INTEGER,
    "bebedero_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    "deleted_by" INTEGER,
    CONSTRAINT "ControlCalidad_reporte_id_fkey" FOREIGN KEY ("reporte_id") REFERENCES "Reporte" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ControlCalidad_bebedero_id_fkey" FOREIGN KEY ("bebedero_id") REFERENCES "Bebedero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_correo_key" ON "User"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "ControlCalidad_reporte_id_key" ON "ControlCalidad"("reporte_id");
