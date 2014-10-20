angular.module('starter.services', [])

.factory('LocationDataService', function($q, $timeout, $filter, $localstorage) {

    var STORAGE_KEY_ROUTES = 'routes';
    var STORAGE_KEY_STOPS = 'stops';

    var dataCache = {
        stops: [],
        routes: []
    };

    var searchLocations = function(searchFilter) {

        var deferred = $q.defer(),
            stops = getBusStops(),
            routes = getRoutes();

        var stopsMatches = stops.filter( function (location) {
            if (location.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
            if (location.code.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
            return false;
        });

        var routesMatches = routes.filter( function (location) {
            if (location.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
            if (location.code.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
            return false;
        });

        $timeout( function(){
            deferred.resolve({locations: routesMatches.concat(stopsMatches)});
        }, 100);

        return deferred.promise;
    };

    var sortByName = function (a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
    };

    var sortByCode = function (a, b) {
        return (a.code < b.code) ? -1 : (a.code > b.code) ? 1 : 0;
    };

    var getRoutes = function () {
        if (dataCache.routes.length == 0) {
            dataCache.routes = $localstorage.getObject(STORAGE_KEY_ROUTES) || [];
            angular.forEach(dataCache.routes, function (obj) {
                obj.type = 'route'
            });
        }
        return dataCache.routes.sort(sortByCode);
    };

    var getBusStops = function () {
        if (dataCache.stops.length == 0) {
            dataCache.stops = $localstorage.getObject(STORAGE_KEY_STOPS) || [];
            angular.forEach(dataCache.stops, function (obj) {
                obj.type = 'busStop'
            });
        }
        return dataCache.stops.sort(sortByName);
    };

    var getRoute = function (routeCode) {

        var routes = getRoutes(),
            route;

        if (!!routeCode) {
            route = $filter('filter')(routes, { code: routeCode })[0]
        }

        if (!route) {
            route = {
                code: '',
                name: '',
                stops: []
            }
        }

        return route;
    };

    var getBusStop = function (busStopCode) {

        var busStop, busStops;

        if (!!busStopCode) {
            busStops = getBusStops();

            busStop = $filter('filter')(busStops, { code: busStopCode })[0]
        }

        if (!busStop) {
            busStop = {
                code: '',
                name: '',
                buses: []
            }
        }

        angular.forEach(busStop.buses, function (obj) {
            obj.time = {
                min: Math.round((Math.random() * 60) + 1),
                sec: Math.round((Math.random() * 60) + 1)
            }
        });

//        busStop.buses = busStop.buses.sort( function (a, b) {
//            var aTime = a.time.min * 60 + a.time.sec;
//            var bTime = b.time.min * 60 + a.time.sec;
//            return (aTime < bTime) ? -1 : (aTime > bTime) ? 1 : 0;
//        });

        return busStop;
    };

    var initBusStops = function (data) {
        data = data || [];
        $localstorage.setObject(STORAGE_KEY_STOPS, data);
    };

    var initRoutes = function (data) {
        data = data || [];

        // temporary hack while API does not respond with name
        angular.forEach(data, function(obj) {
           obj.name = obj.origin + " - " + obj.destination;
        });

        $localstorage.setObject(STORAGE_KEY_ROUTES, data);
    };

    return {
        getBusStops: getBusStops,
        getRoutes: getRoutes,
        getRoute: getRoute,
        getBusStop: getBusStop,
        searchLocations : searchLocations,
        initBusStops: initBusStops,
        initRoutes: initRoutes
    }
})

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            console.debug('Local store [set] => ' + key);
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            console.debug('Local store [get] => ' + key);
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}]);
