var multiTwitchApp = angular.module('multiTwitchApp', []);

multiTwitchApp.controller('multiTwitchController', function($scope, dataFactory) {

    $scope.functions = {};
    $scope.functions.getGameData = function() {
        dataFactory.getGames().then(
            function(data) {
                $scope.gameData = data;
            });
    };
    $scope.functions.chooseGame = function(game) {
        $scope.activeGame = game;
        $scope.functions.getStreamData(game);
        $scope.activeGame.show = true;
    };
    $scope.functions.clearGame = function() {
        $scope.activeGame = {}
        $scope.activeGame.show = false;
    };
    $scope.functions.getStreamData = function(game) {
        dataFactory.getStreams(game).then(
            function(data) {
                $scope.streamData = data;
            });
    };
    $scope.functions.chooseStream = function(stream) {
        $scope.activeStream = stream;
        $scope.activeStream.show = true;
        $scope.functions.getStreamData($scope.activeGame);
    };
    $scope.functions.toggleLeftCol = function() {
        if ($scope.leftColWidth === 0){
            $scope.leftColWidth = 150;
        }
        else {
            $scope.leftColWidth = 0;
        }
    };
    $scope.functions.toggleRightCol = function() {
        if ($scope.rightColWidth == 0){
            $scope.rightColWidth = 340;
        }
        else {
            $scope.rightColWidth = 0;
        }
    };

    $scope.gameData = {};
    $scope.streamData = {};
    $scope.activeGame = {};
    $scope.activeStream = {};
    $scope.rightColWidth = 340;
    $scope.leftColWidth = 150;
    
    $scope.functions.getGameData();
    
    $scope.activeGame.show = false;
    $scope.activeStream.show = false;
});

multiTwitchApp.factory('dataFactory', ['$http', '$q', function($http, $q) {
    
        var factory = {};
    
        factory.getGames = function() {
            var deferred = $q.defer();
            $http.jsonp('https://api.twitch.tv/kraken/games/top?callback=JSON_CALLBACK').
            success(function(data) {
                deferred.resolve(data);
            }).
            error(function() {
                deferred.reject();
            });
            return deferred.promise;
        };
        
        factory.getStreams = function(game) {
            var deferred = $q.defer();
            $http.jsonp('https://api.twitch.tv/kraken/streams?game=' + game.name + '&callback=JSON_CALLBACK').
            success(function(data) {
                deferred.resolve(data);
            }).
            error(function() {
                deferred.reject();
            });
            return deferred.promise;
        };
    
    return factory;
}]);

angular.module('multiTwitchApp')
    .filter('trusted', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);