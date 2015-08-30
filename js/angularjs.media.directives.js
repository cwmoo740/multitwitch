angular.module('angularjs.media.directives', [])
    .config(function () {
        if (!-[1,]) {
            document.createElement('twitch');
        }
    })
    .value('MediaJustinLiveStreamPlayer', function (configure) {
        'use strict';
        configure = configure || {
                type: 'justin'
            };

        return {
            restrict: 'E',
            scope: {
                channel: '@'
            },
            template: '<object bgcolor="#000000"' +
            'data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf"' +
            'height="{HEIGHT}"' +
            'type="application/x-shockwave-flash"' +
            'width="{WIDTH}">' +
            '<param name="allowFullScreen" value="true" />' +
            '<param name="allowScriptAccess" value="always" />' +
            '<param name="allowNetworking" value="all" />' +
            '<param name="movie" value="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf">' +
            '<param name="wmode" value="transparent">' +
            '<param name="flashvars" value="auto_play=true&amp;channel={{channel}}&amp;start_volume=50" />' +
            '</object>',
            replace: true,
            compile: function (elem, attrs, transcludeFn) {
                return function link(scope, element, attrs) {
                    // Prevent error when the Justin player connect source before scope.channel unready. (e.g. When ng-view)
                    scope.$watch('channel', function (channel) {
                        element.append('<param name="movie" value="http://www.' + configure.type + '.tv/widgets/live_embed_player.swf" />');
                    });
                };
            }
        };
    })
    .value('MediaJustinLiveStreamChatroom', function (configure) {
        'use strict';
        configure = configure || {
                type: 'justin'
            };

        return {
            restrict: 'A',
            compile: function (elem, attrs, transcludeFn) {
                return function link(scope, element, attrs) {
                    var channel = attrs.channel ? attrs.channel : attrs.twitchChatChannel;
                    element.attr('frameborder', '0');
                    element.attr('scrolling', 'no');
                    element.attr('src', 'http://' + configure.type + '.tv/chat/embed?channel=' + channel + '&amp;popout_chat=true');
                };
            }
        };
    })
    .directive('twitch', function factory(MediaJustinLiveStreamPlayer) {
        return MediaJustinLiveStreamPlayer({
            type: 'twitch'
        });
    })
    .directive('twitchChat', function factory(MediaJustinLiveStreamChatroom) {
        return MediaJustinLiveStreamChatroom({
            type: 'twitch'
        });
    })
    .directive('twitchChatChannel', function factory(MediaJustinLiveStreamChatroom) {
        return MediaJustinLiveStreamChatroom({
            type: 'twitch'
        });
    })
;