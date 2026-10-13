<?php
    include_once '../config/DbConfig.php';

    class emocionController{

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        public function obtenerEmociones($id) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();
                // Preparar la consulta si se proporciona un ID, de lo contrario, obtener todas las emociones
                if(!empty($id)) {
                    $stmt = $conectar->prepare("SELECT ID_EMOCION, NOMBRE, ICONO FROM tipo_emocion WHERE ID_EMOCION = :id");
                    $stmt->bindParam(':id', $id);
                } else {
                    $stmt = $conectar->prepare("SELECT ID_EMOCION, NOMBRE, ICONO FROM tipo_emocion ORDER BY NOMBRE ASC");
                }
                $stmt->execute();
                $result = $stmt->fetchAll();
                return $result;
            } catch (Exception $e) {
                throw new Exception("Error al realizar la consulta: " . $e->getMessage());
            }
        }

        public function obtenerEmocionesUsuario($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();
                //$stmt = $conectar->prepare("SELECT tp.ID_EMOCION, tp.NOMBRE, COUNT(em.ID_EMOCION) as CANTIDAD, em.FECHA_REG FROM tipo_emocion tp INNER JOIN estado_emocional em ON (em.ID_EMOCION=tp.ID_EMOCION) WHERE em.ID_USUARIO=:id_usuario GROUP BY em.ID_EMOCION ORDER BY CANTIDAD DESC");
                $stmt = $conectar->prepare("SELECT em.ID_ESTADO_EMOCIONAL, tp.ID_EMOCION, tp.NOMBRE, em.FECHA_REG, em.INTENSIDAD, em.COMENTARIO, tp.ICONO FROM tipo_emocion tp INNER JOIN estado_emocional em ON (em.ID_EMOCION=tp.ID_EMOCION) WHERE em.ID_USUARIO=:id_usuario ORDER BY em.FECHA_REG DESC");
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->execute();
                $result = $stmt->fetchAll();
                return $result;
            } catch (Exception $e) {
                throw new Exception("Error al realizar la consulta: " . $e->getMessage());
            }
        }

        public function obtenerNivelAlerta($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                // Emociones que cuentan como "difíciles": Tristeza, Ira, Miedo, Ansiedad, Vergüenza, Cansancio
                $emocionesRiesgo = [2, 4, 5, 6, 7, 9];
                // Ventana de tiempo y umbrales (registros difíciles dentro de la ventana)
                $dias = 15;
                $umbralModerado = 4;
                $umbralAlto = 8;
                // Intensidad: un registro difícil con intensidad >= $intensidadAlta es una "señal elevada"
                // y escala el nivel aunque haya pocas repeticiones
                $intensidadAlta = 7;
                $intensasParaModerado = 1; // con 1 registro intenso ya se llega a Moderado
                $intensasParaAlto = 3;     // con 3 registros intensos se llega a Alto

                $lista = implode(',', $emocionesRiesgo); // enteros fijos definidos arriba, no vienen del usuario

                $stmt = $conectar->prepare(
                    "SELECT tp.NOMBRE, COUNT(*) AS CANTIDAD,
                            SUM(em.INTENSIDAD >= $intensidadAlta) AS INTENSAS
                     FROM estado_emocional em
                     INNER JOIN tipo_emocion tp ON (em.ID_EMOCION=tp.ID_EMOCION)
                     WHERE em.ID_USUARIO=:id_usuario
                     AND em.ID_EMOCION IN ($lista)
                     AND em.FECHA_REG >= DATE_SUB(NOW(), INTERVAL $dias DAY)
                     GROUP BY tp.ID_EMOCION, tp.NOMBRE
                     ORDER BY CANTIDAD DESC"
                );
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->execute();
                $filas = $stmt->fetchAll();

                $total = (int) array_sum(array_column($filas, 'CANTIDAD'));
                $intensas = (int) array_sum(array_column($filas, 'INTENSAS'));

                // Se toma el nivel más alto entre el que dan las repeticiones y el que da la intensidad
                $nivel = 'BAJO';
                if ($total >= $umbralAlto || $intensas >= $intensasParaAlto) {
                    $nivel = 'ALTO';
                } elseif ($total >= $umbralModerado || $intensas >= $intensasParaModerado) {
                    $nivel = 'MODERADO';
                }

                // Se devuelve dentro de un arreglo para mantener el mismo formato que las demás consultas
                return [[
                    'NIVEL' => $nivel,
                    'TOTAL' => $total,
                    'INTENSAS' => $intensas,
                    'EMOCION_PREDOMINANTE' => $filas[0]['NOMBRE'] ?? null,
                    'CANTIDAD_PREDOMINANTE' => isset($filas[0]) ? (int) $filas[0]['CANTIDAD'] : 0,
                    'DIAS' => $dias
                ]];
            } catch (Exception $e) {
                throw new Exception("Error al calcular el nivel de alerta: " . $e->getMessage());
            }
        }

        public function registrarEmocion($id_emocion, $intensidad, $comentario, $id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $fecha = date('Y-m-d H:i:s');

                $stmt = $conectar->prepare(
                    "INSERT INTO estado_emocional
                    (FECHA_REG, ID_EMOCION, INTENSIDAD, COMENTARIO, ID_USUARIO)
                    VALUES
                    (:fecha, :id_emocion, :intensidad, :comentario, :id_usuario)"
                );

                $stmt->bindParam(':fecha', $fecha);
                $stmt->bindParam(':id_emocion', $id_emocion);
                $stmt->bindParam(':intensidad', $intensidad);
                $stmt->bindParam(':comentario', $comentario);
                $stmt->bindParam(':id_usuario', $id_usuario);

                $stmt->execute();

                return true;

            } catch (Exception $e) {
                throw new Exception(
                    "Error al guardar el registro emocional: " . $e->getMessage()
                );
            }
        }
    }
?>
