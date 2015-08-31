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

multiTwitchApp.controller('StreamController', ['$scope', 'StreamService', 'UIService',
    function ($scope, StreamService, UIService) {
        $scope.showToggles = function () {
            UIService.showToggles();
        };
        $scope.deleteStream = function(stream) {
            StreamService.deleteStream(stream);
        };
        $scope.streams = StreamService.getStreams();
        $scope.timer = null;
    }]);

multiTwitchApp.controller('ChatController', ['$scope', 'StreamService',
    function ($scope, StreamService) {
        $scope.toggleChat = function () {
            $scope.chatVisible = !$scope.chatVisible;
        };
        $scope.setActiveChat = function (stream) {
            StreamService.setActiveChat(stream);
        };
        $scope.streams = StreamService.getStreams();
        $scope.activeChat = StreamService.getActiveChat();
        $scope.chatVisible = false;
    }]);

multiTwitchApp.factory('StreamService', [function () {
    var streams = [];
    var activeChat = {_id: -1};
    this.getStreams = function () {
        return streams;
    };
    this.getActiveChat = function () {
        return activeChat;
    };
    this.setActiveChat = function(stream) {
        activeChat._id = stream._id;
    };
    this.addStream = function (stream) {
        if (streams.indexOf(stream) > -1) {
            return;
        }
        streams.push(stream);
        if (streams.length > 4) {
            streams.splice(0, 1);
        }
        if (streams.length === 1) {
            activeChat._id = stream._id;
        }

        return streams;
    };
    this.deleteStream = function (stream) {
        var index = streams.indexOf(stream);
        if (index === -1) {
            throw new StreamException('Deleting a non-existent stream');
        }
        streams.splice(index, 1);
        if (streams.length === 0) {
            activeChat._id = -1;
        }
        else if (activeChat._id === stream._id) {
            activeChat._id = streams[0]._id;
        }
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

multiTwitchApp.factory('UIService', ['$window', '$timeout', function ($window, $timeout) {
    var timer = null;
    this.showToggles = function() {
        var toggles = angular.element($window.document.getElementsByClassName("toggle-column"));
        toggles.addClass('active');

        if (timer !== null) {
            $timeout.cancel(timer);
            timer = null;
        }

        timer = $timeout(function () {
            toggles.removeClass('active');
        }, 1000);
    };
    return this;
}]);

angular.module('multiTwitchApp')
    .filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);


