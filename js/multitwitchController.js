var multiTwitchApp = angular.module('multiTwitchApp', []);

multiTwitchApp.controller('multiTwitchController', function ($scope, streamDataFactory) {
    streamDataFactory.getStreamData().then(
        function (data) {
            $scope.streamData = data;
    });
    
    $scope.activeStream = {};
    $scope.activeStream.show = false;
    
    $scope.addStream = function (stream) {
        $scope.activeStream = stream;
        $scope.activeStream.show = true;
        window.alert($scope.activeStream.channel.url);
        window.alert($scope.activeStream.channel._id);
        $scope.activeStream.channel.url += "/embed";
    };
});


multiTwitchApp.factory('streamDataFactory', function ($http, $q) {
    return {
        getStreamData: function () {
            var deferred = $q.defer();
   $http.jsonp('https://api.twitch.tv/kraken/streams?            game=Dota%202&callback=JSON_CALLBACK').
   success(function(data) {
      deferred.resolve(data);
   }).
   error(function(){
      deferred.reject();
   });
   return deferred.promise;
     }
   }
});

angular.module('multiTwitchApp')
    .filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);