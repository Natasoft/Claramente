-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-08-2026 a las 02:28:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_claramente`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bibliografia`
--

CREATE TABLE `bibliografia` (
  `ID_BIBLIOGRAFIA` int(11) NOT NULL,
  `TITULO` varchar(100) NOT NULL,
  `DESCRIPCION` text NOT NULL,
  `URL` text NOT NULL,
  `ID_FORO` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bibliografia`
--

INSERT INTO `bibliografia` (`ID_BIBLIOGRAFIA`, `TITULO`, `DESCRIPCION`, `URL`, `ID_FORO`) VALUES
(1, 'Preparación primeros auxilios psicológicos', 'Instrucciones', 'https://www.pagina.com.co', 1),
(2, 'Protocolo de intervención primeros auxilios psicológicos', 'Instrucciones', 'https://www.pagina.com.co', 3),
(3, 'PAP aplicados a conducta de riesgo suicida', 'Instrucciones', 'https://www.pagina.com.co', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_emocional`
--

CREATE TABLE `estado_emocional` (
  `ID_ESTADO_EMOCIONAL` int(11) NOT NULL,
  `FECHA_REG` datetime NOT NULL,
  `ID_EMOCION` int(11) NOT NULL,
  `COMENTARIO` text NOT NULL,
  `ID_USUARIO` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_emocional`
--

INSERT INTO `estado_emocional` (`ID_ESTADO_EMOCIONAL`, `FECHA_REG`, `ID_EMOCION`, `COMENTARIO`, `ID_USUARIO`) VALUES
(1, '2026-04-16 05:02:52', 1, 'Me siento feliz porque saldre de viaje', 3),
(2, '2026-04-16 05:03:56', 2, 'me siento mal porque no pase el examen', 1),
(3, '2026-04-16 05:03:56', 2, 'me siento triste porque discuti con mi pareja', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `foro`
--

CREATE TABLE `foro` (
  `ID_FORO` int(11) NOT NULL,
  `TITULO` varchar(30) NOT NULL,
  `DESCRIPCION` text NOT NULL,
  `FECHA_CREACION` datetime NOT NULL,
  `ID_MODERADOR` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `foro`
--

INSERT INTO `foro` (`ID_FORO`, `TITULO`, `DESCRIPCION`, `FECHA_CREACION`, `ID_MODERADOR`) VALUES
(1, 'Ansiedad', 'Contenido', '2026-04-16 05:11:00', 1),
(2, 'Crianza', 'Contenido', '2026-04-16 05:11:00', 3),
(3, 'Maternidad', 'Contenido', '2026-04-16 05:12:17', 1),
(4, 'Duelo', 'Contenido', '2026-04-16 05:12:17', 1),
(5, 'Separación', 'Contenido', '2026-04-16 05:13:10', 3),
(6, 'Relaciones parejas', 'Contenido', '2026-04-16 05:13:10', 3),
(7, 'Amor propio', 'Contenido', '2026-04-16 05:14:20', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gente`
--

CREATE TABLE `gente` (
  `Id` int(10) NOT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `Fecha` date DEFAULT NULL,
  `edad` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gente`
--

INSERT INTO `gente` (`Id`, `nombre`, `Fecha`, `edad`) VALUES
(1, 'Mengano', '1978-06-15', 20),
(2, 'Tulano', '2000-12-02', 22),
(3, 'sutano', '1993-02-10', 33);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participacion`
--

CREATE TABLE `participacion` (
  `ID_PARTICIPACION` int(11) NOT NULL,
  `CONTENIDO` text NOT NULL,
  `FECHA_PUBLICACION` datetime NOT NULL,
  `MOSTRAR` tinyint(1) NOT NULL DEFAULT 1,
  `OBS_MODERADOR` text NOT NULL,
  `FECHA_REG_OBS` datetime NOT NULL,
  `ID_FORO` int(11) NOT NULL,
  `ID_CLIENTE` int(11) NOT NULL,
  `ID_MODERADOR` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `participacion`
--

INSERT INTO `participacion` (`ID_PARTICIPACION`, `CONTENIDO`, `FECHA_PUBLICACION`, `MOSTRAR`, `OBS_MODERADOR`, `FECHA_REG_OBS`, `ID_FORO`, `ID_CLIENTE`, `ID_MODERADOR`) VALUES
(1, 'siento que todo avanza rápido, necesito estar al día con todo', '2026-04-16 05:22:47', 1, 'nanananananana', '2026-04-16 05:22:47', 1, 1, 3),
(2, 'Amo a mi hijo, pero necesito espacio para mi autocuidado', '2026-04-16 05:22:48', 1, '', '2026-04-16 05:22:48', 3, 3, 1),
(3, 'Me estoy destruyendo si continuo en mi relación de pareja, no me valora', '2026-04-16 05:25:45', 1, 'nananananananana', '2026-04-16 05:25:45', 7, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recomendaciones`
--

CREATE TABLE `recomendaciones` (
  `ID_RECOMENDACION` int(11) NOT NULL,
  `TITULO` varchar(100) NOT NULL,
  `DESCRIPCION` text NOT NULL,
  `URL` text NOT NULL,
  `ID_TIPO_EMOCION` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recomendaciones`
--

INSERT INTO `recomendaciones` (`ID_RECOMENDACION`, `TITULO`, `DESCRIPCION`, `URL`, `ID_TIPO_EMOCION`) VALUES
(1, 'ARTICULOS', 'Como mantener el bienestar mental', 'https://www.pagina.com.co', 1),
(2, 'FRASES MOTIVACIONALES', 'Cada día es una nueva oportunidad para cambiar tu vida.', 'https://www.pagina.com.co', 2),
(3, 'FRASES MOTIVADORAS', 'Deja atrás el pasado y concéntrate en las lecciones aprendidas.', 'https://www.pagina.com.co', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `retroalimentacion`
--

CREATE TABLE `retroalimentacion` (
  `ID_RETROALIMENTACION` int(11) NOT NULL,
  `MENSAJE` varchar(100) NOT NULL,
  `FECHA_RETRO` datetime NOT NULL,
  `ID_ESTADO_EMOCIONAL` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `retroalimentacion`
--

INSERT INTO `retroalimentacion` (`ID_RETROALIMENTACION`, `MENSAJE`, `FECHA_RETRO`, `ID_ESTADO_EMOCIONAL`) VALUES
(1, 'Has estado bajando de ánimo en los últimos días', '2026-04-16 05:05:32', 2),
(2, 'Has mantenido un estado de animo positivo', '2026-04-16 05:06:19', 1),
(3, 'has fluctuado entre animo bajo y positivo', '2026-04-16 05:06:19', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `ID_ROL` int(11) NOT NULL,
  `DESCRIPCION` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`ID_ROL`, `DESCRIPCION`) VALUES
(1, 'ADMINISTRADOR'),
(3, 'CLIENTE'),
(2, 'MODERADOR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_emocion`
--

CREATE TABLE `tipo_emocion` (
  `ID_EMOCION` int(11) NOT NULL,
  `NOMBRE` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_emocion`
--

INSERT INTO `tipo_emocion` (`ID_EMOCION`, `NOMBRE`) VALUES
(1, 'Alegria'),
(2, 'Tristeza'),
(3, 'Desesperanzado'),
(4, 'Ira'),
(5, 'Miedo'),
(6, 'Ansiedad'),
(7, 'Vergüenza'),
(8, 'Culpa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ID_USUARIO` int(11) NOT NULL,
  `NOMBRES` varchar(30) NOT NULL,
  `APELLIDOS` varchar(30) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(50) NOT NULL,
  `ID_ROL` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`ID_USUARIO`, `NOMBRES`, `APELLIDOS`, `EMAIL`, `PASSWORD`, `ID_ROL`) VALUES
(1, 'Xiomara Lorena', 'Yate Parga', 'ncardoso720@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', 1),
(2, 'Angie Lizeth ', 'Rodriguez Cartagena', 'lizetcita22@hotmail.com', 'bfa479e7c3444081000cbd647e6d8298', 3),
(3, 'Vannesa', 'Sabogal Guzman', 'vane_sabogal@gmail.com', 'f881fafebd730d959caf7bfc66884556', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bibliografia`
--
ALTER TABLE `bibliografia`
  ADD PRIMARY KEY (`ID_BIBLIOGRAFIA`),
  ADD UNIQUE KEY `ID_BIBLIOGRAFIA` (`ID_BIBLIOGRAFIA`),
  ADD UNIQUE KEY `TITULO` (`TITULO`),
  ADD KEY `BIBLIOGRAFIA_fk4` (`ID_FORO`);

--
-- Indices de la tabla `estado_emocional`
--
ALTER TABLE `estado_emocional`
  ADD PRIMARY KEY (`ID_ESTADO_EMOCIONAL`),
  ADD UNIQUE KEY `ID_ESTADO_EMOCIONAL` (`ID_ESTADO_EMOCIONAL`),
  ADD KEY `ESTADO_EMOCIONAL_fk2` (`ID_EMOCION`),
  ADD KEY `ESTADO_EMOCIONAL_fk4` (`ID_USUARIO`);

--
-- Indices de la tabla `foro`
--
ALTER TABLE `foro`
  ADD PRIMARY KEY (`ID_FORO`),
  ADD UNIQUE KEY `ID_FORO` (`ID_FORO`),
  ADD UNIQUE KEY `TITULO` (`TITULO`),
  ADD KEY `FORO_fk4` (`ID_MODERADOR`);

--
-- Indices de la tabla `gente`
--
ALTER TABLE `gente`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `participacion`
--
ALTER TABLE `participacion`
  ADD PRIMARY KEY (`ID_PARTICIPACION`),
  ADD UNIQUE KEY `ID_PARTICIPACION` (`ID_PARTICIPACION`),
  ADD KEY `PARTICIPACION_fk6` (`ID_FORO`),
  ADD KEY `PARTICIPACION_fk7` (`ID_CLIENTE`),
  ADD KEY `PARTICIPACION_fk8` (`ID_MODERADOR`);

--
-- Indices de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD PRIMARY KEY (`ID_RECOMENDACION`),
  ADD UNIQUE KEY `ID_RECOMENDACION` (`ID_RECOMENDACION`),
  ADD KEY `RECOMENDACIONES_fk4` (`ID_TIPO_EMOCION`);

--
-- Indices de la tabla `retroalimentacion`
--
ALTER TABLE `retroalimentacion`
  ADD PRIMARY KEY (`ID_RETROALIMENTACION`),
  ADD UNIQUE KEY `ID_RETROALIMENTACION` (`ID_RETROALIMENTACION`),
  ADD KEY `RETROALIMENTACION_fk3` (`ID_ESTADO_EMOCIONAL`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`ID_ROL`),
  ADD UNIQUE KEY `ID_ROL` (`ID_ROL`),
  ADD UNIQUE KEY `DESCRIPCION` (`DESCRIPCION`);

--
-- Indices de la tabla `tipo_emocion`
--
ALTER TABLE `tipo_emocion`
  ADD PRIMARY KEY (`ID_EMOCION`),
  ADD UNIQUE KEY `ID_EMOCION` (`ID_EMOCION`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID_USUARIO`),
  ADD UNIQUE KEY `ID_USUARIO` (`ID_USUARIO`),
  ADD UNIQUE KEY `EMAIL` (`EMAIL`),
  ADD KEY `USUARIO_fk5` (`ID_ROL`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bibliografia`
--
ALTER TABLE `bibliografia`
  MODIFY `ID_BIBLIOGRAFIA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado_emocional`
--
ALTER TABLE `estado_emocional`
  MODIFY `ID_ESTADO_EMOCIONAL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `foro`
--
ALTER TABLE `foro`
  MODIFY `ID_FORO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `gente`
--
ALTER TABLE `gente`
  MODIFY `Id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `participacion`
--
ALTER TABLE `participacion`
  MODIFY `ID_PARTICIPACION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  MODIFY `ID_RECOMENDACION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `retroalimentacion`
--
ALTER TABLE `retroalimentacion`
  MODIFY `ID_RETROALIMENTACION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `ID_ROL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_emocion`
--
ALTER TABLE `tipo_emocion`
  MODIFY `ID_EMOCION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID_USUARIO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bibliografia`
--
ALTER TABLE `bibliografia`
  ADD CONSTRAINT `BIBLIOGRAFIA_fk4` FOREIGN KEY (`ID_FORO`) REFERENCES `foro` (`ID_FORO`);

--
-- Filtros para la tabla `estado_emocional`
--
ALTER TABLE `estado_emocional`
  ADD CONSTRAINT `ESTADO_EMOCIONAL_fk2` FOREIGN KEY (`ID_EMOCION`) REFERENCES `tipo_emocion` (`ID_EMOCION`),
  ADD CONSTRAINT `ESTADO_EMOCIONAL_fk4` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuario` (`ID_USUARIO`);

--
-- Filtros para la tabla `foro`
--
ALTER TABLE `foro`
  ADD CONSTRAINT `FORO_fk4` FOREIGN KEY (`ID_MODERADOR`) REFERENCES `usuario` (`ID_USUARIO`);

--
-- Filtros para la tabla `participacion`
--
ALTER TABLE `participacion`
  ADD CONSTRAINT `PARTICIPACION_fk6` FOREIGN KEY (`ID_FORO`) REFERENCES `foro` (`ID_FORO`),
  ADD CONSTRAINT `PARTICIPACION_fk7` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `usuario` (`ID_USUARIO`),
  ADD CONSTRAINT `PARTICIPACION_fk8` FOREIGN KEY (`ID_MODERADOR`) REFERENCES `usuario` (`ID_USUARIO`);

--
-- Filtros para la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  ADD CONSTRAINT `RECOMENDACIONES_fk4` FOREIGN KEY (`ID_TIPO_EMOCION`) REFERENCES `tipo_emocion` (`ID_EMOCION`);

--
-- Filtros para la tabla `retroalimentacion`
--
ALTER TABLE `retroalimentacion`
  ADD CONSTRAINT `RETROALIMENTACION_fk3` FOREIGN KEY (`ID_ESTADO_EMOCIONAL`) REFERENCES `estado_emocional` (`ID_ESTADO_EMOCIONAL`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `USUARIO_fk5` FOREIGN KEY (`ID_ROL`) REFERENCES `roles` (`ID_ROL`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
