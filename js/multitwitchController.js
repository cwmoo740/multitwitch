var multiTwitchApp = angular.module('multiTwitchApp', []);

multiTwitchApp.controller('multiTwitchController', function ($scope, streamDataFactory) {
    
    
    $scope.streamData = {};
    $scope.refreshStreams = function () {
        streamDataFactory.getStreamData().then(
            function (data) {
                $scope.streamData = data;
        });
    };
    
    $scope.refreshStreams();
    
    $scope.activeStream = {};
    $scope.activeStream.show = false;
    
    $scope.addStream = function (stream) {
        $scope.refreshStreams();
        
        if (!$scope.activeStream.channel){
            //do nothing
        }
        else if (stream.channel._id === $scope.activeStream.channel._id){
            return;
        }
        
        $scope.activeStream = stream;
        $scope.activeStream.show = true;
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