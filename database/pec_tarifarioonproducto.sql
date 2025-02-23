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
-- Table structure for table `tarifarioonproducto`
--

DROP TABLE IF EXISTS `tarifarioonproducto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifarioonproducto` (
  `tarifario_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `precio` int NOT NULL,
  `precio_unidad` int NOT NULL,
  `precio_empaque` int NOT NULL,
  `fecha_creacion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_actualizacion` datetime(3) NOT NULL,
  PRIMARY KEY (`tarifario_id`,`producto_id`),
  KEY `TarifarioOnProducto_producto_id_fkey` (`producto_id`),
  CONSTRAINT `TarifarioOnProducto_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TarifarioOnProducto_tarifario_id_fkey` FOREIGN KEY (`tarifario_id`) REFERENCES `tarifario` (`id_tarifario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifarioonproducto`
--

LOCK TABLES `tarifarioonproducto` WRITE;
/*!40000 ALTER TABLE `tarifarioonproducto` DISABLE KEYS */;
INSERT INTO `tarifarioonproducto` VALUES (1,1,5500,5500,55000,'2025-02-21 02:47:06.533','2025-02-21 02:47:06.533');
/*!40000 ALTER TABLE `tarifarioonproducto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-23 16:41:13
