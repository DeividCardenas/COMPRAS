-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_usuario` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol_id` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_nombre_usuario_key`(`nombre_usuario`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rol_nombre_key`(`nombre`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permiso` (
    `id_permiso` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Permiso_nombre_key`(`nombre`),
    PRIMARY KEY (`id_permiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermisoOnRol` (
    `rol_id` INTEGER NOT NULL,
    `permiso_id` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`rol_id`, `permiso_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermisoOnTarifario` (
    `permiso_id` INTEGER NOT NULL,
    `tarifario_id` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`permiso_id`, `tarifario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empresa` (
    `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Empresa_nombre_key`(`nombre`),
    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmpresaOnLaboratorio` (
    `empresa_id` INTEGER NOT NULL,
    `laboratorio_id` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`empresa_id`, `laboratorio_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Laboratorio` (
    `id_laboratorio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_laboratorio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EPS` (
    `id_eps` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EPS_nombre_key`(`nombre`),
    PRIMARY KEY (`id_eps`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tarifario` (
    `id_tarifario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `eps_id` INTEGER NULL,
    `empresa_id` INTEGER NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tarifario_nombre_key`(`nombre`),
    PRIMARY KEY (`id_tarifario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TarifarioOnProducto` (
    `tarifario_id` INTEGER NOT NULL,
    `producto_id` INTEGER NOT NULL,
    `precio` INTEGER NOT NULL,
    `precio_unidad` INTEGER NOT NULL,
    `precio_empaque` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`tarifario_id`, `producto_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_magister` VARCHAR(191) NOT NULL,
    `cum_pactado` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `principio_activo` VARCHAR(191) NOT NULL,
    `concentracion` VARCHAR(191) NOT NULL,
    `registro_sanitario` VARCHAR(191) NOT NULL,
    `laboratorio_id` INTEGER NOT NULL,
    `costo_compra` INTEGER NOT NULL,
    `regulacion_tableta` INTEGER NULL,
    `regulacion_empaque` INTEGER NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Producto_codigo_magister_key`(`codigo_magister`),
    UNIQUE INDEX `Producto_cum_pactado_key`(`cum_pactado`),
    UNIQUE INDEX `Producto_registro_sanitario_key`(`registro_sanitario`),
    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `Rol`(`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermisoOnRol` ADD CONSTRAINT `PermisoOnRol_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `Rol`(`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermisoOnRol` ADD CONSTRAINT `PermisoOnRol_permiso_id_fkey` FOREIGN KEY (`permiso_id`) REFERENCES `Permiso`(`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermisoOnTarifario` ADD CONSTRAINT `PermisoOnTarifario_permiso_id_fkey` FOREIGN KEY (`permiso_id`) REFERENCES `Permiso`(`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermisoOnTarifario` ADD CONSTRAINT `PermisoOnTarifario_tarifario_id_fkey` FOREIGN KEY (`tarifario_id`) REFERENCES `Tarifario`(`id_tarifario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpresaOnLaboratorio` ADD CONSTRAINT `EmpresaOnLaboratorio_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `Empresa`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpresaOnLaboratorio` ADD CONSTRAINT `EmpresaOnLaboratorio_laboratorio_id_fkey` FOREIGN KEY (`laboratorio_id`) REFERENCES `Laboratorio`(`id_laboratorio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tarifario` ADD CONSTRAINT `Tarifario_eps_id_fkey` FOREIGN KEY (`eps_id`) REFERENCES `EPS`(`id_eps`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tarifario` ADD CONSTRAINT `Tarifario_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `Empresa`(`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TarifarioOnProducto` ADD CONSTRAINT `TarifarioOnProducto_tarifario_id_fkey` FOREIGN KEY (`tarifario_id`) REFERENCES `Tarifario`(`id_tarifario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TarifarioOnProducto` ADD CONSTRAINT `TarifarioOnProducto_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `Producto`(`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_laboratorio_id_fkey` FOREIGN KEY (`laboratorio_id`) REFERENCES `Laboratorio`(`id_laboratorio`) ON DELETE RESTRICT ON UPDATE CASCADE;
