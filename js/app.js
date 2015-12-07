var multiTwitchApp = angular.module('multiTwitchApp', ['ngRoute']);

function StreamException(error) {
    this.error = error;
    this.name = 'StreamException';
}

function filterLocation(location) {
    return location.split("/").filter(function (streamer) {
        return streamer && streamer.length;
    }).splice(0, 4);
}

multiTwitchApp.controller('MenuController',
    ['$scope', 'StreamService', 'TwitchApi', '$location',
        function($scope, StreamService, TwitchApi, $location) {
            $scope.getGameData = function() {
                TwitchApi.getGames().then(
                    function(data) {
                        $scope.gameData = data;
                    });
            };
            $scope.getStreamData = function(game) {
                TwitchApi.getStreams(game).then(
                    function(data) {
                        $scope.streamData = data;
                        $scope.detailView = 'streams';
                    });
            };
            $scope.toggleMenu = function() {
                $scope.menuVisible = !$scope.menuVisible;
            };
            $scope.selectDetailView = function(view_name) {
                $scope.detailView = view_name;
            };
            $scope.addStream = function(stream) {
                console.log("adding stream, ", stream);
                StreamService.addStream(stream);
            };

            $scope.detailView = 'games';
            $scope.menuVisible = true;

            // load streams on first page load
            var streamers = filterLocation($location.path());
            streamers.forEach(function(streamer) {
                TwitchApi.getPlayerStream(streamer).then(
                    function(stream) {
                        if (!stream.stream) return;
                        StreamService.addStream(stream.stream);
                    }
                );
            });
            $scope.getGameData();
        }]);

multiTwitchApp.controller('StreamController', ['$scope', 'StreamService', 'UIService',
    function($scope, StreamService, UIService) {
        $scope.showToggles = function() {
            console.log("FUCK YOUJ");
            UIService.showToggles();
        };
        $scope.deleteStream = function(stream) {
            StreamService.deleteStream(stream);
        };
        $scope.setActiveStream = function(stream) {
            if ($scope.activeStream._id === stream._id) {
                StreamService.demoteStream();
            }
            else {
                StreamService.setActiveStream(stream);
            }
        };
        $scope.streams = StreamService.getStreams();
        $scope.activeStream = StreamService.getActiveStream();
        $scope.timer = null;
    }]);

multiTwitchApp.controller('ChatController', ['$scope', 'StreamService',
    function($scope, StreamService) {
        $scope.toggleChat = function() {
            $scope.chatVisible = !$scope.chatVisible;
        };
        $scope.setActiveChat = function(stream) {
            StreamService.setActiveChat(stream);
        };
        $scope.streams = StreamService.getStreams();
        $scope.activeChat = StreamService.getActiveChat();
        $scope.chatVisible = true;
    }]);

multiTwitchApp.service('StreamService', ['$location', function($location) {
    var streams = [];
    var activeChat = {_id: -1};
    var activeStream = {active: false};

    var setPath = function() {
        $location.path(streams.reduce(function(acc, stream) {
            return acc + "/" + stream.channel.name;
        }, ""));
    };
    this.getStreams = function() {
        return streams;
    };
    this.getActiveChat = function() {
        return activeChat;
    };
    this.setActiveChat = function(stream) {
        activeChat._id = stream._id;
    };
    this.addStream = function(stream) {
        if (streams.indexOf(stream) > -1) {
            return;
        }
        streams.push(stream);
        if (streams.length > 4) {
            this.deleteStream(streams[0]);
        }
        else if (streams.length === 1) {
            activeChat._id = stream._id;
        }
        setPath();
    };
    this.deleteStream = function(stream) {
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
        if (activeStream._id === stream._id) {
            this.demoteStream();
        }
        setPath();
    };
    this.getActiveStream = function() {
        return activeStream;
    };
    this.setActiveStream = function(stream) {
        var index = streams.indexOf(stream);
        if (index === -1) {
            throw new StreamException('Promoting a non-existent stream');
        }
        activeStream._id = stream._id;
        activeStream.active = true;
    };
    this.demoteStream = function() {
        delete activeStream._id;
        activeStream.active = false;
    };
}]);

multiTwitchApp.service('TwitchApi', ['$http', '$q', function($http, $q) {

    this.getGames = function() {
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

    this.getStreams = function(game) {
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

    this.getPlayerStream = function(player) {
        var deferred = $q.defer();
        $http.jsonp('https://api.twitch.tv/kraken/streams/' + player + '?callback=JSON_CALLBACK').
        success(function(data) {
            deferred.resolve(data);
        }).
        error(function() {
            deferred.reject();
        });
        return deferred.promise;
    };
}]);

multiTwitchApp.factory('UIService', ['$window', '$timeout', function($window, $timeout) {
    var timer = null;
    this.showToggles = function() {
        var toggles = angular.element($window.document.getElementsByClassName("toggle-column"));
        toggles.addClass('active');

        if (timer !== null) {
            $timeout.cancel(timer);
        }

        timer = $timeout(function() {
            toggles.removeClass('active');
        }, 1000);
    };
    return this;
}]);

multiTwitchApp.directive('iframeHack', ['$parse', function($parse) {
    return {
        restrict: 'A',
        compile: function(element, attrs) {
            var fn = $parse(attrs.iframeHack);
            var selector = attrs.selector;
            return function(scope, element) {
                console.log(element);
                console.log("FUCKING DIRECTIVES");
                element[0].addEventListener('mousemove', function(event) {
                    scope.$apply(function() {
                        console.log("FUCK");
                        fn(scope, {
                            $event: event
                        });
                    });
                }, true);
            };
        }
    }
}]);

angular.module('multiTwitchApp')
    .filter('trusted', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);


