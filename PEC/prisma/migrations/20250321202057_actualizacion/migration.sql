/*
  Warnings:

  - You are about to drop the column `codigo_magister` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `costo_compra` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `cum_pactado` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `principio_activo` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `regulacion_empaque` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `regulacion_tableta` on the `producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cum]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo_barras]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo_barras` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cum` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iva` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_presentacion` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_unidad` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentacion` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Producto_codigo_magister_key` ON `producto`;

-- DropIndex
DROP INDEX `Producto_cum_pactado_key` ON `producto`;

-- AlterTable
ALTER TABLE `producto` DROP COLUMN `codigo_magister`,
    DROP COLUMN `costo_compra`,
    DROP COLUMN `cum_pactado`,
    DROP COLUMN `principio_activo`,
    DROP COLUMN `regulacion_empaque`,
    DROP COLUMN `regulacion_tableta`,
    ADD COLUMN `codigo_barras` VARCHAR(191) NOT NULL,
    ADD COLUMN `cum` VARCHAR(191) NOT NULL,
    ADD COLUMN `iva` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `precio_presentacion` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `precio_unidad` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `presentacion` VARCHAR(191) NOT NULL,
    ADD COLUMN `regulacion` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Producto_cum_key` ON `Producto`(`cum`);

-- CreateIndex
CREATE UNIQUE INDEX `Producto_codigo_barras_key` ON `Producto`(`codigo_barras`);
