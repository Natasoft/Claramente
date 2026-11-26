-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-11-2026 a las 20:56:02
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
  `ID_FORO` int(11) NOT NULL,
  `AUTOR` varchar(150) DEFAULT NULL,
  `TIPO` enum('LIBRO','GUIA','ARTICULO','VIDEO','PODCAST','OTRO') NOT NULL DEFAULT 'OTRO',
  `MODALIDAD_ACCESO` enum('LECTURA_ONLINE','DESCARGA_GRATUITA','COMPRA') NOT NULL DEFAULT 'LECTURA_ONLINE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bibliografia`
--

INSERT INTO `bibliografia` (`ID_BIBLIOGRAFIA`, `TITULO`, `DESCRIPCION`, `URL`, `ID_FORO`, `AUTOR`, `TIPO`, `MODALIDAD_ACCESO`) VALUES
(4, 'Cómo hacer que te pasen cosas buenas', 'Gestión emocional, estrés, pensamientos y bienestar.', 'https://www.panamericana.com.co/como-hacer-que-te-pasen-cosas-buenas-661275/p?srsltid=AYCX9vJgFlk-Z_hSbnSfCOCLLsQh1Z1m_39WlZiDV-D_YfV8Br1R93ex', 1, 'Marian Rojas Estapé', 'LIBRO', 'COMPRA'),
(5, 'El arte de no amargarse la vida', 'Pensamientos negativos, preocupaciones y herramientas cognitivas.', 'https://www.librerianacional.com/365509/p?srsltid=AYCX9vK6CsizeVA5sVBkfLxBDE2lqK0rCSzvQmE1ZoHv5Wv6dv3R4SwV', 1, 'Rafael Santandreu', 'LIBRO', 'COMPRA'),
(6, 'En tiempos de estrés haz lo que importa', 'Guía ilustrada con ejercicios de autoayuda y audios para practicar técnicas de relajación y conexión con el presente', 'https://iris.who.int/items/2707b614-e1db-46c6-bf13-17abc0dc7bb2', 1, 'OMS', 'GUIA', 'DESCARGA_GRATUITA'),
(7, '¿Cómo sanamos la ansiedad?', 'Identificar mecanismos internos, emociones, estrategias y herramientas', 'https://www.youtube.com/watch?v=hAt6lgwC8cw', 1, 'Podcast Psicologia al desnudo', 'PODCAST', 'LECTURA_ONLINE'),
(8, 'Disciplina sin lágrimas', 'Crianza respetuosa, emociones y desarrollo infantil', 'https://www.librerianacional.com/disciplina-sin-lagrimas-/p?srsltid=AYCX9vK2c03aIusCt1YiL8-PNBjiSzhQ9uCzxSrkISJ8PuzNocYBrNyl', 2, 'Daniel J. Siegel y Tina Payne Bryson.', 'LIBRO', 'COMPRA'),
(9, 'Abraza la niña que fuiste', 'Sanacion heridas emocionales de la infancia', 'https://www.librerianacional.com/abraza-a-la-nia-que-fuiste/p?gad_source=1&gad_campaignid=19356633551&gbraid=0AAAAAC84aVOCH3dgGAorMm5qbxNx_N6E4&gclid=Cj0KCQiAwdDXBhDuARIsAFdLukltkZvNIOOSzQogG0_oXAy64RHGriQDBZ_HWd-z9-JbC5HHhB5QIi0aAoHREALw_wcB', 2, 'Marta Segrelles', 'LIBRO', 'COMPRA'),
(10, 'Consejos para la crianza positiva', 'Consejos cotidianos para madres, padres y cuidadores, con videos y actividades para realizar en familia.', 'https://www.unicef.org/lac/crianza#etapas', 2, 'Unicef', 'ARTICULO', 'LECTURA_ONLINE'),
(11, 'Ningun otro momento cambia tu cerebro como ser madre', 'Una conversación para mirar la maternidad sin mitos ni culpa, desde la evidencia científica y la experiencia humana', 'https://www.youtube.com/watch?v=9TVj09GXpYA', 2, 'Podcast AprendemosJuntos', 'PODCAST', 'LECTURA_ONLINE'),
(12, 'Siete reglas de oro para vivir en pareja', 'Comunicación, convivencia y relaciones saludables', 'https://www.buscalibre.com.co/libro-siete-reglas-de-oro-para-vivir-en-pareja-the-seven-principles-for-making-marri-age-work/9788499084480/p/3429691?bmkt_source=google&bmkt_campaign=21466499190&gad_source=1&gad_campaignid=21473109254&gbraid=0AAAAAD7H2K6A0ZX-q1OXZSXikxfguv4LO&gclid=Cj0KCQiAwdDXBhDuARIsAFdLukkvgpP87r8itlH9MOYy6P8hE_dEyKdth5WBiHo1AKHP5VQSfnLZHQoaArO2EALw_wcB', 6, 'John M. Gottman.', 'LIBRO', 'COMPRA'),
(13, 'Ya te dije adiós, ahora cómo te olvido', 'Rupturas amorosas, desapego y recuperación emocional.', 'https://www.librerianacional.com/ya-te-dije-adios-ahora-como-te-olvido-379731/p?srsltid=AYCX9vKeoldFXMBNukhK_YLJA6KHgFFlZORYGwNKfD7HOo3_h4MWwhCz', 6, 'Walter Riso', 'LIBRO', 'COMPRA'),
(14, 'Manual para crear relaciones sanas', 'Herramientas practicas para construir vinculos sanos', 'https://www.youtube.com/watch?v=wF1B0jVWhtw', 6, 'Podcast AprendemosJuntos', 'PODCAST', 'LECTURA_ONLINE'),
(15, 'Asi actua alguien que dejo de tener miedo a perder personas', 'Limites emocionales, aprender a identificar los limites', 'https://www.youtube.com/watch?v=RvwW3p1ccxU', 6, 'Andres Vernazza - emprendedor moderno', 'VIDEO', 'LECTURA_ONLINE'),
(16, 'El camino de las lágrimas', 'Pérdidas, despedidas y procesos de duelo', 'https://www.buscalibre.com.co/libro-el-camino-de-las-lagrimas/9788483461112/p/2901743?bmkt_source=google&bmkt_campaign=21466499190&gad_source=1&gad_campaignid=21473109254&gbraid=0AAAAAD7H2K6A0ZX-q1OXZSXikxfguv4LO&gclid=Cj0KCQiAwdDXBhDuARIsAFdLukn9b6WeCeIPCT8VCYKNxLuP1b5bS2FwWoyb58sX6C1zcLoNJRnW0AcaAnTZEALw_wcB', 4, 'Jorge Bucay', 'LIBRO', 'COMPRA'),
(17, 'Sobre el duelo y el dolor', 'Comprensión del duelo y acompañamiento emocional', 'https://www.buscalibre.com.co/libro-sobre-el-duelo-y-el-dolor/9788419164865/p/55616166?bmkt_source=google&bmkt_campaign=21466499190&gad_source=1&gad_campaignid=21473109254&gbraid=0AAAAAD7H2K6A0ZX-q1OXZSXikxfguv4LO&gclid=Cj0KCQiAwdDXBhDuARIsAFdLuklCSEI98mFloTXge5P6blR1_sj2kTtING-8Tnb40jqwPIJSzNAU7NAaAux3EALw_wcB', 4, 'Elisabeth Kübler-Ross y David Kessler.', 'LIBRO', 'COMPRA'),
(18, 'Vivir con la perdida sin dejar de vivir', 'Gestionar sentimientos y emociones', 'https://www.youtube.com/watch?v=4wWWqXgVTnY', 4, 'Podcast AprendemosJuntos', 'PODCAST', 'LECTURA_ONLINE'),
(19, 'Mas fuerte que la adversidad', 'Claves psicológicas para afrontar épocas de crisis, adversidad e incertidumbre y salir fortalecidos.', 'https://www.youtube.com/watch?v=VKMjSmbJUcc', 4, 'Podcast AprendemosJuntos', 'PODCAST', 'LECTURA_ONLINE'),
(20, 'Las mujeres que aman demasiado', 'Autonomia emocional, limites, construccion de relaciones sanas', 'https://www.librerianacional.com/las-mujeres-que-aman-demasiado-360212-editorial-bdebolsillo/p?srsltid=AYCX9vJRoBAxsZ55ePQHMdFNB2cuBh8NRe-ZhBGYugZovx4LtQ7IR9gz', 7, 'Robin Norwood', 'LIBRO', 'COMPRA'),
(21, 'Los dones de la imperfección', 'Aceptación personal, vulnerabilidad y autoconfianza', 'https://www.panamericana.com.co/los-dones-de-la-imperfeccion-714963/p?srsltid=AYCX9vI-DOTiB4CtgPnxu6i83syXYxCoVrroQHY0rVd5woB0J_NpLLb1', 7, 'Brené Brown', 'LIBRO', 'COMPRA'),
(22, 'Construyendo autoestima, claves para una confianza saludable', 'Gestion emocional y autoestima', 'https://www.youtube.com/watch?v=NUZ5Smb0hOw', 7, 'Podcast Psicologia al desnudo', 'PODCAST', 'LECTURA_ONLINE'),
(23, 'Superando las objeciones de la autocompasion', 'Como disminuir la autocritica y desarrollar una relacion mas sana contigo mismo', 'https://www.youtube.com/watch?v=vTBraRwGo-E', 7, 'Kristin Neff', 'VIDEO', 'LECTURA_ONLINE'),
(24, 'El hombre en busca de sentido', 'Sentido de vida, resiliencia y experiencias difíciles', 'https://www.librerianacional.com/el-hombre-en-busca-de-sentido-337163-editorial-herder/p?srsltid=AYCX9vKzeK05WxYBVVP8StO1bdxdgwgRcTn0EouTGaIWAg3U7-LhGHhV', 8, 'Viktor Frankl.', 'LIBRO', 'COMPRA'),
(25, 'Encuentra tu persona vitamina', 'Gestion de relaciones, mejora del bienestar', 'https://www.panamericana.com.co/encuentra-tu-persona-vitamina-627016/p?srsltid=AYCX9vICieMbbE12Xxh1qg_0QDHMVRXZmpow85RJNJ3UyUKpKVTHxUAC', 8, 'Marian Rojas Estapé', 'LIBRO', 'COMPRA'),
(26, 'Desregulacion Emocional', 'Comprension de la desregulacion emocional y como controlar las emociones sin remprimirlas', 'https://www.youtube.com/watch?v=NE0RwjmmQhQ', 8, 'Podcast Psicologia al desnudo', 'PODCAST', 'LECTURA_ONLINE'),
(27, 'Agilidad emocional, un entrenamiento para vivir mejor', 'Aprender a convivir con nuestras emociones, pensamientos y recuerdos de forma saludable', 'https://www.youtube.com/watch?v=tEntuVUc7PM', 8, 'Podcast AprendemosJuntos', 'PODCAST', 'LECTURA_ONLINE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_emocional`
--

CREATE TABLE `estado_emocional` (
  `ID_ESTADO_EMOCIONAL` int(11) NOT NULL,
  `FECHA_REG` datetime NOT NULL,
  `ID_EMOCION` int(11) NOT NULL,
  `INTENSIDAD` int(11) NOT NULL,
  `COMENTARIO` varchar(250) NOT NULL DEFAULT '',
  `ID_USUARIO` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_emocional`
--

INSERT INTO `estado_emocional` (`ID_ESTADO_EMOCIONAL`, `FECHA_REG`, `ID_EMOCION`, `INTENSIDAD`, `COMENTARIO`, `ID_USUARIO`) VALUES
(1, '2026-04-16 05:02:52', 1, 0, 'Me siento feliz porque saldre de viaje', 3),
(2, '2026-04-16 05:03:56', 2, 0, 'me siento mal porque no pase el examen', 1),
(3, '2026-04-16 05:03:56', 2, 0, 'me siento triste porque discuti con mi pareja', 2),
(4, '2026-09-17 04:18:18', 10, 5, 'Me siento agradecida por todas las bendiciones de Dios', 1),
(5, '2026-09-17 04:18:46', 10, 5, 'Me siento agradecida por todas las bendiciones de Dios', 1),
(6, '2026-09-17 04:19:06', 10, 5, 'Agradecida con Dios', 1),
(7, '2026-09-17 04:25:58', 3, 7, 'Equilibrio total', 1),
(8, '2026-09-17 21:11:31', 1, 5, 'feliz de la vida', 1),
(9, '2026-09-24 18:39:09', 6, 7, '', 1),
(10, '2026-10-03 10:50:48', 3, 5, 'Un dia tranqui', 1),
(11, '2026-10-03 15:52:43', 10, 5, 'Gracias Dios', 1),
(12, '2026-10-03 16:18:52', 4, 7, 'No me alcanzo el tiempo para hacer todo lo que tenia pensado', 1),
(13, '2026-10-12 16:51:36', 8, 5, 'No se que hacer respecto a mi relacion', 1),
(14, '2026-10-13 01:15:14', 3, 7, 'todo good', 1),
(15, '2026-11-02 15:16:56', 8, 8, 'Debo tomar una decision pero me cuesta', 1),
(16, '2026-11-15 03:09:46', 3, 5, 'tranquilamente', 1),
(17, '2026-11-16 03:08:21', 1, 5, 'LA VIDA ES BELLA', 1),
(18, '2026-11-21 16:11:48', 9, 5, 'La rutina y la sobrecarga hoy no me ayudan mucho', 1),
(19, '2026-11-22 03:09:05', 8, 6, 'No me decido al tomar una decisión sobre mi relación, no comprendo que estoy esperando', 1),
(20, '2026-11-22 16:16:44', 1, 5, 'Por todo lo bueno que tengo', 1),
(21, '2026-11-26 02:45:17', 6, 5, 'Tengo mil cosas por hacer y se me acaba el tiempo', 1),
(22, '2026-11-25 20:47:48', 10, 5, 'Agradezco lo bueno y lo malo', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `foro`
--

CREATE TABLE `foro` (
  `ID_FORO` int(11) NOT NULL,
  `TITULO` varchar(30) NOT NULL,
  `DESCRIPCION` text NOT NULL,
  `ICONO` varchar(50) NOT NULL DEFAULT 'forum',
  `FECHA_CREACION` datetime NOT NULL,
  `ID_MODERADOR` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `foro`
--

INSERT INTO `foro` (`ID_FORO`, `TITULO`, `DESCRIPCION`, `ICONO`, `FECHA_CREACION`, `ID_MODERADOR`) VALUES
(1, 'Ansiedad y estrés', 'Nervios, pánico y presión del día a día', 'wind_power', '2026-04-16 05:11:00', 1),
(2, 'Crianza y maternidad', 'Embarazo, posparto, hijos y familia', 'child_care', '2026-04-16 05:11:00', 3),
(4, 'Duelo y pérdidas', 'Despedidas, ausencias y proceso de sanar', 'local_florist', '2026-04-16 05:12:17', 1),
(6, 'Pareja y separación', 'Convivencia, rupturas y nuevos comienzos', 'diversity_1', '2026-04-16 05:13:10', 3),
(7, 'Amor propio y bienestar', 'Gratitud, hábitos y crecimiento personal', 'self_improvement', '2026-04-16 05:14:20', 1),
(8, 'Estado de ánimo', 'Tristeza, cansancio y días difíciles', 'mood', '2026-10-27 21:33:43', 1);

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
  `TITULO` varchar(120) DEFAULT NULL,
  `CONTENIDO` text NOT NULL,
  `FECHA_PUBLICACION` datetime NOT NULL,
  `MOSTRAR` tinyint(1) NOT NULL DEFAULT 1,
  `OBS_MODERADOR` text DEFAULT NULL,
  `FECHA_REG_OBS` datetime DEFAULT NULL,
  `ID_FORO` int(11) NOT NULL,
  `ID_CLIENTE` int(11) NOT NULL,
  `ID_MODERADOR` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `participacion`
--

INSERT INTO `participacion` (`ID_PARTICIPACION`, `TITULO`, `CONTENIDO`, `FECHA_PUBLICACION`, `MOSTRAR`, `OBS_MODERADOR`, `FECHA_REG_OBS`, `ID_FORO`, `ID_CLIENTE`, `ID_MODERADOR`) VALUES
(1, NULL, 'siento que todo avanza rápido, necesito estar al día con todo', '2026-04-16 05:22:47', 1, 'nanananananana', '2026-04-16 05:22:47', 1, 1, 3),
(2, NULL, 'Amo a mi hijo, pero necesito espacio para mi autocuidado', '2026-04-16 05:22:48', 1, '', '2026-04-16 05:22:48', 2, 3, 1),
(3, NULL, 'Me estoy destruyendo si continuo en mi relación de pareja, no me valora', '2026-04-16 05:25:45', 1, 'nananananananana', '2026-04-16 05:25:45', 7, 2, 1),
(4, 'Separacion de pareja', 'La relación se torna conflictiva ya no puedo seguir mas', '2026-10-30 03:51:47', 1, '', '2026-11-02 16:13:02', 6, 1, 1),
(5, 'decision dificil', 'No es fácil tomar la decision de terminar la relación, pero es algo necesario para el bienestar de nosotros', '2026-11-02 16:12:20', 1, '', '2026-11-02 16:13:09', 6, 1, 1),
(6, 'Dedicarme tiempo para mi bienestar', 'Quiero organizarme para sacar espacio de ocio para mi', '2026-11-21 16:09:45', 1, '', '2026-11-21 16:10:15', 7, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recomendaciones`
--

CREATE TABLE `recomendaciones` (
  `ID_RECOMENDACION` int(11) NOT NULL,
  `TITULO` varchar(100) NOT NULL,
  `TIPO` enum('ARTICULO','PDF','VIDEO','FRASE') NOT NULL DEFAULT 'ARTICULO',
  `DESCRIPCION` text NOT NULL,
  `URL` text NOT NULL,
  `ID_TIPO_EMOCION` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recomendaciones`
--

INSERT INTO `recomendaciones` (`ID_RECOMENDACION`, `TITULO`, `TIPO`, `DESCRIPCION`, `URL`, `ID_TIPO_EMOCION`) VALUES
(1, 'ARTICULOS', 'ARTICULO', 'Como mantener el bienestar mental', 'https://www.pagina.com.co', 1),
(2, 'FRASES MOTIVACIONALES', 'FRASE', 'Cada día es una nueva oportunidad para cambiar tu vida.', 'https://www.pagina.com.co', 2),
(3, 'FRASES MOTIVADORAS', 'FRASE', 'Deja atrás el pasado y concéntrate en las lecciones aprendidas.', 'https://www.pagina.com.co', 2),
(4, 'FRASE MOTIVACIONAL', 'FRASE', 'Celebra este momento, te lo mereces por completo.', '', 1),
(5, 'FRASE MOTIVACIONAL', 'FRASE', 'Está bien no estar bien. Permítete sentir y, cuando puedas, habla con alguien de confianza.', '', 3),
(6, 'FRASE MOTIVACIONAL', 'FRASE', 'Respira profundo antes de reaccionar: tu calma vale más que tener la razón.', '', 4),
(7, 'FRASE MOTIVACIONAL', 'FRASE', 'El miedo es una señal, no una sentencia. Un paso pequeño también es avanzar.', '', 5),
(8, 'FRASE MOTIVACIONAL', 'FRASE', 'Tómate 2 minutos para respirar profundo: inhala 4 segundos, sostén 4, exhala 6.', '', 6),
(9, 'FRASE MOTIVACIONAL', 'FRASE', 'Equivocarse es humano. Trátate con la misma amabilidad que le darías a un amigo.', '', 7),
(10, 'FRASE MOTIVACIONAL', 'FRASE', 'No necesitas tener todas las respuestas hoy. Dale espacio a tus ideas.', '', 8),
(11, 'FRASE MOTIVACIONAL', 'FRASE', 'Descansar también es productivo. Escucha lo que tu cuerpo te pide.', '', 9),
(12, 'FRASE MOTIVACIONAL', 'FRASE', 'Reconocer lo bueno, por pequeño que sea, fortalece tu bienestar.', '', 10),
(13, 'Aprender a vivir y no solo a sobrevivir', 'VIDEO', 'Reflexion sobre reconciliarse con el tiempo, a recuperar la risa, el asombro y la compasión por los demás', 'https://www.youtube.com/watch?v=n8HY2rJ9lYY', 1),
(14, 'La tristeza, una emocion con la que necesitas conectar', 'VIDEO', 'Funcionalidad de la tristeza en nuestra vida', 'https://www.youtube.com/watch?v=JfNB-S_jqyo', 2),
(15, 'Reflexion sobre la tristeza', 'VIDEO', 'La emocion que nadie quiere sentir pero que necesitas para sanar', 'https://www.youtube.com/shorts/-YWHBD_Pnzg', 2),
(16, 'Mi caja de herramientas de salud mental', 'VIDEO', 'Caja de herramientas emocionales', 'https://www.youtube.com/watch?v=yVOtRa4Q7_0', 3),
(17, 'Como mantener la calma en cualquier situacion', 'VIDEO', 'Aprender a controlar emociones y evitar reaccionar impulsivamente', 'https://www.youtube.com/watch?v=YOq_tkUyJ5w', 3),
(18, 'El enojo, como amigarnos con esta emocion', 'VIDEO', 'Aprender a reaccionar frente a esta emocion', 'https://www.youtube.com/watch?v=i5Sfw9S7YtA', 4),
(19, 'Como expresar el enojo de manera sana', 'VIDEO', 'Mecanismos internos de gestionar emociones', 'https://www.youtube.com/watch?v=SfIHeplGXgs', 4),
(20, 'Fobias, como vencer el miedo que paraliza', 'VIDEO', 'Como se pueden tratar y superar', 'https://www.youtube.com/watch?v=YA9xn9GUzvg', 5),
(21, 'Enfrentar tus miedos, el camino a la liberacion', 'VIDEO', 'Herramientas para lidiar con el miedo de manera saludable', 'https://www.youtube.com/watch?v=J9hVq1lEkU0', 5),
(22, 'Autocuidado y regulacion emocional', 'ARTICULO', 'Tarjetas con frases de apoyo, ejercicios breves y acciones para afrontar momentos de tensión.', 'https://pnudcolombia.exposure.co/kit-de-autocuidado-y-protocolo-psicoterapeutico', 6),
(23, 'Como calmo mi ansiedad', 'VIDEO', 'Tips para recuperar la calma', 'https://www.youtube.com/watch?v=3lAv0AZ0Vvo', 6),
(24, 'Practicas para la madurez emocional', 'VIDEO', 'Como poner en practica la madurez emocional', 'https://www.youtube.com/watch?v=5PiMtZSa-w4', 7),
(25, 'Como disminuir la hiperexigencia', 'VIDEO', 'Ejercicio para ayudar a bajar la hiperexigencia', 'https://www.youtube.com/watch?v=kTwHRHpe5v4', 7),
(26, 'Lidiando con la incertidumbre, estrategias para la tranquilidad', 'VIDEO', 'Modos saludables de navegar por la incertidumbre', 'https://www.youtube.com/watch?v=N_sZs0b0yLs', 8),
(27, 'Rumiacion mental, como dejar de darle vueltas a todo', 'ARTICULO', 'Tecnicas para frenar el pensamiento repetitivo', 'https://mettapsicologos.com/rumiacion-mental-como-dejar-de-darle-vueltas-a-todo/', 8),
(28, 'Agenda llena, vida vacia', 'VIDEO', '¿Cómo manejar el agotamiento mental?', 'https://www.youtube.com/watch?v=qsTHO1hBThw', 9),
(29, 'Por que insistes estar en una mala relacion', 'VIDEO', 'Reflexion sobre una mala relacion', 'https://www.youtube.com/watch?v=WMpnQqMurKo', 9),
(30, 'Ejercicio para volver a ti', 'VIDEO', 'Espacio para practicar la gratitud, reconocer lo que sí pudiste hacer y volver al equilibrio.', 'https://www.youtube.com/watch?v=mlv1gsZ2Z3k', 10),
(31, 'La vida es maravillosa', 'VIDEO', 'Reflexion sobre lo bueno y las dificultades de la vida', 'https://www.youtube.com/watch?v=RC7EG8m2RKk', 10),
(33, 'FRASE MOTIVACIONAL', 'FRASE', 'Disfruta este momento y permítete reconocer las cosas buenas que están sucediendo en tu vida', '', 1),
(34, 'FRASE MOTIVACIONAL', 'FRASE', 'Comparte tu alegría con alguien especial, expresar lo que sentimos también fortalece nuestros vínculos.', '', 1),
(35, 'FRASE MOTIVACIONAL', 'FRASE', 'Permítete sentir tristeza sin juzgarte. Hablar con alguien de confianza puede ayudarte a sentirte acompañado', '', 2),
(36, 'FRASE MOTIVACIONAL', 'FRASE', 'Si necesitas llorar, hazlo. Expresar tus emociones también es una forma de cuidarte', '', 2),
(37, 'FRASE MOTIVACIONAL', 'FRASE', 'Aprovecha este estado para realizar actividades que te generen satisfacción', '', 3),
(38, 'FRASE MOTIVACIONAL', 'FRASE', 'Dedica unos minutos a respirar conscientemente y conectar con el presente', '', 3),
(39, 'FRASE MOTIVACIONAL', 'FRASE', 'Antes de reaccionar, haz una pausa, respira y date tiempo para organizar tus pensamientos', '', 4),
(40, 'FRASE MOTIVACIONAL', 'FRASE', 'Si estás muy molesto, aléjate un momento de la situación y retómala cuando te sientas preparado', '', 4),
(41, 'FRASE MOTIVACIONAL', 'FRASE', 'No tienes que enfrentar todo de una vez. Puedes avanzar con pequeños pasos', '', 5),
(42, 'FRASE MOTIVACIONAL', 'FRASE', 'Busca el apoyo de alguien en quien confíes y comparte aquello que te preocupa', '', 5),
(43, 'FRASE MOTIVACIONAL', 'FRASE', 'Haz una pausa y concentra tu atención en tu respiración. No necesitas resolver todo en este instante', '', 6),
(44, 'FRASE MOTIVACIONAL', 'FRASE', 'Intenta identificar qué pensamientos están generando preocupación y distingue lo que puedes controlar', '', 6),
(45, 'FRASE MOTIVACIONAL', 'FRASE', 'Recuerda que cometer errores forma parte del aprendizaje y no determina tu valor como persona', '', 7),
(46, 'FRASE MOTIVACIONAL', 'FRASE', 'Evita juzgarte con dureza. Háblate con la misma comprensión que ofrecerías a alguien que quieres', '', 7),
(47, 'FRASE MOTIVACIONAL', 'FRASE', 'Tómate un momento para organizar tus ideas y reconocer qué es lo que realmente te preocupa', '', 8),
(48, 'FRASE MOTIVACIONAL', 'FRASE', 'Escribe tus pensamientos, esto puede ayudarte a comprender mejor lo que estás sintiendo', '', 8),
(49, 'FRASE MOTIVACIONAL', 'FRASE', 'Recuerda que descansar no es perder el tiempo, es una parte importante del bienestar', '', 9),
(50, 'FRASE MOTIVACIONAL', 'FRASE', 'Escucha las necesidades de tu cuerpo y permítete descansar. Cuidarte también significa hacer pausas', '', 9),
(51, 'FRASE MOTIVACIONAL', 'FRASE', 'Mira el cielo y anque no entiendas nada sientete afortunado de vivir y de lo que tienes ahora', '', 10),
(52, 'FRASE MOTIVACIONAL', 'FRASE', 'Conserva este sentimiento y recuerda que también puedes encontrar motivos de gratitud en los días difíciles.', '', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuesta`
--

CREATE TABLE `respuesta` (
  `ID_RESPUESTA` int(11) NOT NULL,
  `CONTENIDO` text NOT NULL,
  `FECHA_PUBLICACION` datetime NOT NULL,
  `MOSTRAR` tinyint(1) NOT NULL DEFAULT 1,
  `OBS_MODERADOR` text DEFAULT NULL,
  `FECHA_REG_OBS` datetime DEFAULT NULL,
  `ID_PARTICIPACION` int(11) NOT NULL,
  `ID_CLIENTE` int(11) NOT NULL,
  `ID_MODERADOR` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `NOMBRE` varchar(15) NOT NULL,
  `ICONO` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_emocion`
--

INSERT INTO `tipo_emocion` (`ID_EMOCION`, `NOMBRE`, `ICONO`) VALUES
(1, 'Alegria', '🌟'),
(2, 'Tristeza', '😔'),
(3, 'Calma', '😊'),
(4, 'Ira', '😤'),
(5, 'Miedo', '😱'),
(6, 'Ansiedad', '😰'),
(7, 'Vergüenza', '🥹'),
(8, 'Pensativo', '🤔'),
(9, 'Cansancio', '😴'),
(10, 'Gratitud', '✨');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ID_USUARIO` int(11) NOT NULL,
  `NOMBRES` varchar(30) NOT NULL,
  `APELLIDOS` varchar(30) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `ID_ROL` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`ID_USUARIO`, `NOMBRES`, `APELLIDOS`, `EMAIL`, `PASSWORD`, `ID_ROL`) VALUES
(1, 'Ingrid Natali', 'Cardoso Caro', 'ncardoso720@gmail.com', '$2y$10$7iN8F5R58CEnTG6a4svt7.5csf9DA0mukG02uj9vAzOjh4Vb6pGBu', 1),
(2, 'Angie Lizeth ', 'Rodriguez Cartagena', 'lizetcita22@hotmail.com', 'bfa479e7c3444081000cbd647e6d8298', 3),
(3, 'Vannesa', 'Sabogal Guzman', 'vane_sabogal@gmail.com', 'f881fafebd730d959caf7bfc66884556', 2),
(4, 'Olga Lucia', 'Caro Moreno', 'olucaro70@gmail.com', '$2y$10$7RyFtf7FBiBGD59baAQCi.lexdzFlLxlU/yMKdcGvWyDDXzczSoHG', 3),
(5, 'Xiomara Lorena', 'Yate Parga', 'xiomy.yate@gmail.com', '$2y$10$PIj1k9eFP3JysXG992U.tuONj0m6Zq9M/K6mDcDa48fjuF/quouOK', 2);

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
-- Indices de la tabla `respuesta`
--
ALTER TABLE `respuesta`
  ADD PRIMARY KEY (`ID_RESPUESTA`),
  ADD KEY `respuesta_idx_part` (`ID_PARTICIPACION`,`FECHA_PUBLICACION`),
  ADD KEY `respuesta_idx_cliente` (`ID_CLIENTE`),
  ADD KEY `respuesta_idx_moderador` (`ID_MODERADOR`);

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
  MODIFY `ID_BIBLIOGRAFIA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `estado_emocional`
--
ALTER TABLE `estado_emocional`
  MODIFY `ID_ESTADO_EMOCIONAL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `foro`
--
ALTER TABLE `foro`
  MODIFY `ID_FORO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `gente`
--
ALTER TABLE `gente`
  MODIFY `Id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `participacion`
--
ALTER TABLE `participacion`
  MODIFY `ID_PARTICIPACION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `recomendaciones`
--
ALTER TABLE `recomendaciones`
  MODIFY `ID_RECOMENDACION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `respuesta`
--
ALTER TABLE `respuesta`
  MODIFY `ID_RESPUESTA` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `ID_EMOCION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID_USUARIO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- Filtros para la tabla `respuesta`
--
ALTER TABLE `respuesta`
  ADD CONSTRAINT `respuesta_fk_cliente` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `usuario` (`ID_USUARIO`),
  ADD CONSTRAINT `respuesta_fk_moderador` FOREIGN KEY (`ID_MODERADOR`) REFERENCES `usuario` (`ID_USUARIO`),
  ADD CONSTRAINT `respuesta_fk_part` FOREIGN KEY (`ID_PARTICIPACION`) REFERENCES `participacion` (`ID_PARTICIPACION`) ON DELETE CASCADE;

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
