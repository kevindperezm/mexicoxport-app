<?php

require_once '../mxport.php';

/**
 * Prepara un dato recibido desde la temible Internet para ser introducido en la base de datos.
 *
 * @param  $dato $string
 *
 * @return string
 */
function sanitizar($dato) {
  return mysqli_escape_string(getMyConection(), $dato);
}


/**
 * Codifica a UTF-8 todas las cadenas dentro de un array.
 *
 * @see utf8_decode_all El proceso opuesto
 *
 * @param $data
 *
 * @return array|string
 */
function utf8_encode_all($data) {
  if (is_string($data)) return utf8_encode($data);
  if ( ! is_array($data)) return $data;

  $result = array();
  foreach($data as $i=>$d) $result[$i] = utf8_encode_all($d);

  return $result;
}

/**
 * Decodifica de UTF-8 todas las cadenas dentro de un array.
 *
 * @see utf8_encode_all El proceso opuesto
 *
 * @param $data
 *
 * @return array|string
 */
function utf8_decode_all($data) {
  if (is_string($data)) return utf8_decode($data);
  if ( ! is_array($data)) return $data;

  $result = array();
  foreach($data as $i=>$d) $result[$i] = utf8_decode_all($d);

  return $result;
}
