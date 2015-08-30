var multiTwitchApp = angular.module('multiTwitchApp', []);

function StreamException(error) {
    this.error = error;
    this.name = 'StreamException';
}

multiTwitchApp.controller('MenuController', ['$scope', 'StreamService', 'TwitchApi',
    function ($scope, StreamService, TwitchApi) {
        $scope.getGameData = function () {
            TwitchApi.getGames().then(
                function (data) {
                    $scope.gameData = data;
                });
        };
        $scope.getStreamData = function (game) {
            TwitchApi.getStreams(game).then(
                function (data) {
                    $scope.streamData = data;
                    $scope.detailView = 'streams';
                });
        };
        $scope.toggleMenu = function () {
            $scope.menuVisible = !$scope.menuVisible;
        };
        $scope.selectDetailView = function (view_name) {
            $scope.detailView = view_name;
        };
        $scope.addStream = function (stream) {
            StreamService.addStream(stream);
        };

        $scope.detailView = 'games';
        $scope.menuVisible = true;
        $scope.getGameData();
    }]);

multiTwitchApp.controller('StreamController', ['$scope', 'StreamService',
    function ($scope, StreamService) {
        $scope.streamHeight = function(index) {
            if ($scope.streams.length > 1) {
                return {height: '50%'};
            }
            else if ($scope.streams.length === 3 && index === 3){
                return {height: '50%', width: '100%'};
            }
            return {height: '100%'};
        };
        $scope.streams = StreamService.getStreams();
    }]);

multiTwitchApp.controller('ChatController', ['$scope', function ($scope) {
    $scope.toggleChat = function () {
        $scope.chatVisible = !$scope.chatVisible;
    };
    $scope.chatVisible = false;
}]);
/*
 multiTwitchApp.controller('multiTwitchController', function ($scope, dataFactory) {

 $scope.functions = {};
 $scope.functions.getGameData = function () {
 dataFactory.getGames().then(
 function (data) {
 $scope.gameData = data;
 });
 };
 $scope.functions.chooseGame = function (game) {
 $scope.activeGame = game;
 $scope.functions.getStreamData(game);
 $scope.activeGame.show = true;
 };
 $scope.functions.clearGame = function () {
 $scope.activeGame = {};
 $scope.activeGame.show = false;
 };
 $scope.functions.getStreamData = function (game) {
 dataFactory.getStreams(game).then(
 function (data) {
 $scope.streamData = data;
 });
 };
 $scope.functions.addStream = function (stream) {

 while ($scope.activeStreams.length > 0) {
 $scope.activeStreams.pop();
 }

 $scope.activeStreams.push(stream);
 $scope.functions.getStreamData($scope.activeGame);
 };
 $scope.functions.toggleLeftCol = function () {
 $scope.functions.getStreamData($scope.activeGame);
 };
 $scope.functions.toggleRightCol = function () {

 };
 // initialization
 $scope.gameData = {};
 $scope.streamData = {};
 $scope.activeGame = {};
 $scope.activeStreams = [];

 $scope.functions.getGameData();
 $scope.activeGame.show = false;
 });
 */
multiTwitchApp.factory('StreamService', [function () {
    var streams = [];
    this.getStreams = function () {
        return streams;
    };
    this.addStream = function (stream) {
        if (streams.indexOf(stream) > -1) {
            return;
        }
        streams.unshift(stream);
        if (streams.length > 4) {
            streams.pop();
        }

        return streams;
    };
    this.deleteStream = function (stream) {
        var index = streams.indexOf(stream);
        if (index === -1) {
            throw new StreamException('Deleting a non-existent stream');
        }
        streams.splice(index, 1);
        return streams;
    };
    return this;
}]);

multiTwitchApp.factory('TwitchApi', ['$http', '$q', function ($http, $q) {

    var factory = {};

    factory.getGames = function () {
        var deferred = $q.defer();
        $http.jsonp('https://api.twitch.tv/kraken/games/top?callback=JSON_CALLBACK').
            success(function (data) {
                deferred.resolve(data);
            }).
            error(function () {
                deferred.reject();
            });
        return deferred.promise;
    };

    factory.getStreams = function (game) {
        var deferred = $q.defer();
        $http.jsonp('https://api.twitch.tv/kraken/streams?game=' + game.name + '&callback=JSON_CALLBACK').
            success(function (data) {
                deferred.resolve(data);
            }).
            error(function () {
                deferred.reject();
            });
        return deferred.promise;
    };

    return factory;
}]);

angular.module('multiTwitchApp')
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);
