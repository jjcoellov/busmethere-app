// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'starter.directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.filter('numberFixedLen', function () {
    return function(a,b){
        return( 1e4 + a + "").slice(-b)
    }
})

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl'
        })

        .state('app.search', {
            url: "/search",
            views: {
                'menuContent' :{
                    templateUrl: "templates/search.html",
                    controller: 'SearchCtrl'
                }
            }
        })

        .state('app.route', {
            url: "/route/:routeCode",
            views: {
                'menuContent' :{
                    templateUrl: "templates/route.html",
                    controller: 'RouteCtrl'
                }
            }
        })

        .state('app.busStop', {
            url: "/busStop/:busCode",
            views: {
                'menuContent' :{
                    templateUrl: "templates/busStop.html",
                    controller: 'BusStopCtrl'
                }
            }
        })


        .state('app.map', {
            url: "/map/:busStopCode",
            views: {
                'menuContent': {
                    templateUrl: "templates/map.html",
                    controller: 'MapCtrl'
                }
            }
        })

        .state('app.mapAll', {
            url: "/map",
            views: {
                'menuContent': {
                    templateUrl: "templates/map.html",
                    controller: 'MapCtrl'
                }
            }
        })

        .state('app.home', {
            url: "/home",
            views: {
                'menuContent': {
                    templateUrl: "templates/home.html",
                    controller: 'HomeCtrl'
                }
            }
        })

        .state('app.messages', {
            url: "/messages/:busStopCode",
            views: {
                'menuContent': {
                    templateUrl: "templates/messages.html",
                    controller: 'MessagesCtrl'
                }
            }
        })

        .state('app.comments', {
            url: "/comments/:messageId",
            views: {
                'menuContent': {
                    templateUrl: "templates/comments.html",
                    controller: 'MessagesCtrl'
                }
            }
        })
        .state('app.about', {
            url: "/about",
            views: {
                'menuContent': {
                    templateUrl: "templates/about.html"
                }
            }
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

    });

