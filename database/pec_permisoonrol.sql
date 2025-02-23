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
-- Table structure for table `permisoonrol`
--

DROP TABLE IF EXISTS `permisoonrol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisoonrol` (
  `rol_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  `fecha_creacion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_actualizacion` datetime(3) NOT NULL,
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `PermisoOnRol_permiso_id_fkey` (`permiso_id`),
  CONSTRAINT `PermisoOnRol_permiso_id_fkey` FOREIGN KEY (`permiso_id`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PermisoOnRol_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisoonrol`
--

LOCK TABLES `permisoonrol` WRITE;
/*!40000 ALTER TABLE `permisoonrol` DISABLE KEYS */;
INSERT INTO `permisoonrol` VALUES (3,1,'2025-02-19 20:59:44.937','2025-02-19 20:59:44.937'),(3,2,'2025-02-19 20:59:44.937','2025-02-19 20:59:44.937'),(3,3,'2025-02-19 20:59:44.937','2025-02-19 20:59:44.937'),(3,4,'2025-02-19 20:59:44.937','2025-02-19 20:59:44.937'),(4,6,'2025-02-19 21:21:25.664','2025-02-19 21:21:25.664');
/*!40000 ALTER TABLE `permisoonrol` ENABLE KEYS */;
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
