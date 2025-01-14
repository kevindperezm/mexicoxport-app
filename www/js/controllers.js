var controllers = angular.module('mexicoxport.controllers', []);

controllers.controller('AppCtrl', function($scope, $location, AlmacenCategorias, DescargarCategoriasService) {
  $scope.version = '1.0.1';
  $scope.categorias = AlmacenCategorias.todas();
  $scope.$location = $location;

  if ($scope.categorias.length <= 0) {
    DescargarCategoriasService.categorias(function(categorias) {
      for (var i = 0; i < categorias.length; AlmacenCategorias.agregar(categorias[i++]));
    });
  }
});

controllers.controller('TvCtrl', function($scope, TvService, AlertaSinConexion) {
  $scope.infiniteScroll = true;
  $scope.videos = [];

  $scope.siguientePagina = function() {
    TvService.siguientePagina(
      function(videos) {
        $scope.videos = $scope.videos.concat(videos);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      },
      function() {
        AlertaSinConexion.mostrar($scope);
      }
    );
  };

  $scope.recargar = function() {
    $scope.videos = [];
    TvService.reiniciar();
    $scope.siguientePagina();
  };

  $scope.puedeCargarMas = function() {
    return $scope.infiniteScroll && ($scope.videos.length <= 0 ||
      $scope.videos.length < TvService.getTotal());
  };
});

controllers.controller('NoticiasCtrl', function($scope, $stateParams, DescargarNoticiasService, $ionicLoading, AlertaSinConexion) {
  $scope.noticias = [];
  $scope.total = 0;
  $scope.infiniteScroll = true;
  $scope.busqueda = {
    mostrar: false
  };

  $scope.refrescar = function() {
    $scope.noticias = [];
    $scope.errorCarga = false;
    $scope.cargar();
  };

  $scope.cargar = function(callback) {
    var categoriaId = $stateParams.categoriaId || null;
    DescargarNoticiasService.recientes($scope.noticias.length, categoriaId, $scope.busqueda.keywords,
      function(respuesta) {
        $scope.postCargar(respuesta);
        if (callback) callback();
      },
      function() {
        AlertaSinConexion.mostrar($scope);
      }
    );
  };

  $scope.postCargar = function(respuesta) {
    $scope.noticias = $scope.noticias.concat(respuesta.noticias);

    if (respuesta.total !== null) $scope.total = respuesta.total;
    $scope.infiniteScroll = $scope.noticias.length < $scope.total;

    $scope.$broadcast('scroll.refreshComplete');
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.buscar = function(event) {
    if ($scope.busqueda.keywords && event && event.keyCode != 13) return;

    $ionicLoading.show();
    $scope.noticias = [];
    $scope.cargar(function() {
      $ionicLoading.hide();
    });
  };

  $scope.obtenerUltimaNoticia = function() {
    var ultimaNoticia;

    if ($scope.noticias.length > 0) {
      ultimaNoticia = $scope.noticias[$scope.noticias.length - 1];
    } else {
      ultimaNoticia = null;
    }

    return ultimaNoticia;
  };

});

controllers.controller('TopCtrl', function($controller, $scope, DescargarNoticiasService, AlertaSinConexion) {
  $controller('NoticiasCtrl', { $scope: $scope });

  $scope.cargar = function() {
    DescargarNoticiasService.top(
      function(noticias) {
        $scope.infiniteScroll = false;
        $scope.postCargar({noticias: noticias});
      },
      function() {
        AlertaSinConexion.mostrar($scope);
      }
    );
  };
});

controllers.controller('NoticiaCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, DescargarNoticiasService, $cordovaSocialSharing, ShareStats, AlertaSinConexion, Comments, StandardAlert) {
  $scope.newComment = {};
  $ionicLoading.show({ hideOnStateChange: true });

  var despuesDeCargar = function() {
    $ionicLoading.hide();
  };

  DescargarNoticiasService.noticia($stateParams.id, function(noticia) {
      $scope.noticia = noticia;
      DescargarNoticiasService.relacionadas(noticia, despuesDeCargar, despuesDeCargar);
      Comments.get(noticia, function(comentarios) {
        $scope.noticia.comentarios = comentarios;
      }, despuesDeCargar);
    }, function() {
      despuesDeCargar();
      AlertaSinConexion.mostrar($scope);
    }
  );

  $scope.compartirNoticia = function(noticia) {
    $cordovaSocialSharing.share(noticia.titulo,
                                noticia.resumen,
                                null,
                                "http://mexicoxport.com" + noticia.url)
      .then(function() {
        ShareStats.registerShareEvent();
        console.log('Exito al compartir');
      }, function(err) {
        console.log('Error al compartir');
        console.log(err);
      });
  };

  $scope.showNewCommentPopup = function() {
    $ionicPopup.show({
      scope: $scope,
      title: 'Nuevo comentario',
      templateUrl: 'views/app/dialogs/new-comment.html',
      buttons: [
        {
          text: 'Cancelar',
          type: 'button-dark'
        },
        {
          text: 'Publicar',
          type: 'button-calm',
          onTap: function(e) {
            $scope.storeComment();
          }
        }
      ]
    });
  };

  $scope.storeComment = function() {
    $scope.newComment.noticia_id = $scope.noticia.id;
    Comments.new($scope.newComment, function(comment) {
        StandardAlert.show(null, 'Tu comentario ha sido publicado', function() {
          $scope.noticia.comentarios.unshift(comment);
        });
      }, function() {
        AlertaSinConexion.mostrar($scope);
      }
    );
  };

  // restricción de longitud de comentario
  $scope.$watch('newComment.comentario', function(oldVal, newVal) {
    if (newVal && newVal.length >= 255) $scope.newComment.comentario = oldVal;
  });

});
