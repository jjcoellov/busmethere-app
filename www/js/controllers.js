angular.module('starter.controllers', ['starter.services', 'ionic'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
})

.controller('BusStopCtrl', ['$scope', '$stateParams', 'LocationDataService', '$http', function($scope, $stateParams, LocationDataService, $http) {

    $scope.data = { busStop: LocationDataService.getBusStop($stateParams.busCode) };

    $scope.doRefresh = function () {
        $http.get('/')
            .success (function (newItems) {
                setTimeout(function () {
                    $scope.data = { busStop: LocationDataService.getBusStop($stateParams.busCode) };
                }, 200);
            })
            .finally(function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
    };

}])

.controller('MapCtrl', ['$scope', '$stateParams', 'LocationDataService', '$ionicLoading','$http', function($scope, $stateParams, LocationDataService, $ionicLoading, $http) {
        var busStopCode = $stateParams.busStopCode
        var busStop
        if (busStopCode) {
            busStop = LocationDataService.getBusStop($stateParams.busStopCode)
            $scope.centerCtrl = {latitude: busStop.latitude, longitude: busStop.longitude}
            $scope.zoomCtrl = 15
            $scope.specificBusStop = true
        } else {
            $scope.specificBusStop = false
            $scope.zoomCtrl = 11
        }

        if (!$scope.busStopsCtrl) {
            $scope.busStopsCtrl = LocationDataService.getBusStops();
        }

        $scope.showBuses = { checked: false };

        $scope.showBusesChange = function() {
            if ($scope.showBuses.checked) {
                if ($scope.specificBusStop) {

                        $http({ method: 'GET', url: 'http://hackathon-jersey.herokuapp.com/bustracks?stopCode='+busStop.code })

                            .success(function (response) {

                                $scope.busesCtrl = response

                            })

                            .error( function(response) {
                                console.log("ERROR LOADING ROUTES");
                            });

                } else {
                    $http({ method: 'GET', url: 'http://hackathon-jersey.herokuapp.com/bustracks' })

                        .success(function (response) {

                            $scope.busesCtrl = response

                        })

                        .error( function(response) {
                            console.log("ERROR LOADING ROUTES");
                        });
                }
            } else {
                $scope.busesCtrl = null;
            }
        };

        $scope.locateMe = function () {
            $ionicLoading.show({
                template: 'Loading your location...'
            });
            navigator.geolocation.getCurrentPosition(function (location) {
                var latitude = location.coords.latitude;
                var longitude = location.coords.longitude;
                $scope.$apply( function() {
                    $scope.centerCtrl = { latitude: latitude, longitude: longitude}
                    $scope.zoomCtrl = 17;
                    $scope.currentLocationCtrl = [{latitude: latitude, longitude: longitude, name:'Me', type: "user"}]
                });
                $ionicLoading.hide();
            }, function(locationError) {
                $ionicLoading.hide();
                console.error("Error retrieving Location Code");
            });
        }

    }])

.controller('HomeCtrl', ['$scope', '$http', 'LocationDataService', function($scope, $http, LocationDataService) {

        $scope.loadData = function () {

            $http({ method: 'GET', url: 'http://hackathon-jersey.herokuapp.com/stoplocations' })

                .success(function (response) {

                    LocationDataService.initBusStops(response)

                })

                .error( function(response) {
                    console.log("ERROR LOADING BUSES");
                });

            $http({ method: 'GET', url: 'http://hackathon-jersey.herokuapp.com/routes' })

                .success(function (response) {

                    LocationDataService.initRoutes(response)

                })

                .error( function(response) {
                    console.log("ERROR LOADING ROUTES");
                });
        };

    }])

.controller('SearchCtrl', ['$q', '$scope', '$timeout', '$ionicLoading', 'LocationDataService', function ($q, $scope, $timeout, $ionicLoading, LocationDataService) {

   var routes = LocationDataService.getRoutes();
   var busStops = LocationDataService.getBusStops();

    $scope.data = {
        "locations": routes.concat(busStops),
        "search" : ''
    };

    $scope.search = function () {

        LocationDataService.searchLocations($scope.data.search).then(
            function (matches) {
                $scope.data.locations = matches.locations
            }
        )
    };

    $scope.clear = function () {
        $scope.data.search = '';
        $scope.search();
    };

}])

.controller('RouteCtrl', ['$scope', '$stateParams', 'LocationDataService', function ($scope, $stateParams, LocationDataService) {

    var routeCode = $stateParams.routeCode,
        route;

    route = LocationDataService.getRoute(routeCode);

    $scope.data = { "route": route }

}])

.controller('MessagesCtrl', ['$scope', '$http', '$stateParams', '$filter', 'LocationDataService', function ($scope, $http, $stateParams, $filter, LocationDataService) {

        var stopLocationId = $stateParams.busStopCode
        $scope.data = { busStop: LocationDataService.getBusStop(stopLocationId) };


        $http.get('http://hackathon-jersey.herokuapp.com/messages?stopLocation=' + stopLocationId)
            .success (function (items) {
            $scope.data.messages = items;
        });

        $scope.like = function (messageId) {
            angular.forEach($scope.data.messages, function(obj) {
                if (obj.id == messageId) {
                    obj.likes++
                }

            });
        };

}]);
