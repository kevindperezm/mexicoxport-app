<?php

require_once __DIR__ . '/../../utilidades.php';

$user       = sanitizar($_POST['usuario']);
$email      = sanitizar($_POST['email']);
$comment    = sanitizar($_POST['comentario']);
$noticia_id = sanitizar($_POST['noticia_id']);
$created_at = date('Y-m-d H:i:s');

query('start transaction;');
query('INSERT INTO noticias_comentarios (usuario, email, comentario, noticia_id, created_at) ' .
      "VALUES ('$user', '$email', '$comment', $noticia_id, '$created_at')");

$comment_id = mysqli_insert_id(getMyConection());
$comment = mysqli_fetch_array(query("SELECT * FROM noticias_comentarios WHERE id = $comment_id"), MYSQLI_ASSOC);
query('commit;');

enviarRespuesta($comment);
