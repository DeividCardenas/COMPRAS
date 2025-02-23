CREATE DATABASE  IF NOT EXISTS `pec` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pec`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: pec
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `codigo_magister` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cum_pactado` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `principio_activo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `concentracion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registro_sanitario` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `laboratorio_id` int NOT NULL,
  `costo_compra` int NOT NULL,
  `regulacion_tableta` int DEFAULT NULL,
  `regulacion_empaque` int DEFAULT NULL,
  `fecha_creacion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_actualizacion` datetime(3) NOT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `Producto_codigo_magister_key` (`codigo_magister`),
  UNIQUE KEY `Producto_cum_pactado_key` (`cum_pactado`),
  UNIQUE KEY `Producto_registro_sanitario_key` (`registro_sanitario`),
  KEY `Producto_laboratorio_id_fkey` (`laboratorio_id`),
  CONSTRAINT `Producto_laboratorio_id_fkey` FOREIGN KEY (`laboratorio_id`) REFERENCES `laboratorio` (`id_laboratorio`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'MAG88990','CUM11234','Acetaminofén 650mg Tabletas','Acetaminofén','650mg','RS889900',4,5100,5500,55000,'2025-02-20 16:50:55.836','2025-02-20 16:50:55.836');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-23 16:41:12
