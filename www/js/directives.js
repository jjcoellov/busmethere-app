angular.module('starter.directives', [])

.directive("map", function ($window) {
    return {
        restrict: "E",
        replace: true,
        template: "<div></div>",
        scope: {
            center: "=",        // Center point on the map (e.g. <code>{ lat: 10, lng: 10 }</code>).
            busStops: "=",       // Array of map markers (e.g. <code>[{ lat: 10, lng: 10, name: "hello" }]</code>).
            buses: "=",       // Array of map markers (e.g. <code>[{ lat: 10, lng: 10, name: "hello" }]</code>).
            currentLocation: "=",       // Array of map markers (e.g. <code>[{ lat: 10, lng: 10, name: "hello" }]</code>).
            width: "@",         // Map width in pixels.
            height: "@",        // Map height in pixels.
            zoom: "=",          // Zoom level (one is totally zoomed out, 25 is very much zoomed in).
            mapTypeId: "@",     // Type of tile to show on the map (roadmap, satellite, hybrid, terrain).
            panControl: "@",    // Whether to show a pan control on the map.
            zoomControl: "@",   // Whether to show a zoom control on the map.
            scaleControl: "@"   // Whether to show scale control on the map.
        },
        link: function (scope, element, attrs) {
            var toResize, toCenter;
            var map;
            var infowindow;
            var busStopsMarkers = [];
            var busesMarkers = [];
            var markerCluster
            var callbackName = 'InitMapCb';
            // callback when google maps is loaded
            $window[callbackName] = function() {
                console.log("map: init callback");
                createMap();
                updateMarkers(scope.busStops);
                updateMarkers(scope.buses);
                updateMarkers(scope.currentLocation);
            };

            if (!$window.google || !$window.google.maps ) {
                console.log("map: not available - load now gmap js");
                loadGMaps();
            }
            else
            {
                console.log("map: IS available - create only map now");
                createMap();
            }
            function loadGMaps() {
                console.log("map: start loading js gmaps");
                var script = $window.document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'lib/gmap/gmap.js';
                $window.document.body.appendChild(script);
                var scriptCluster = $window.document.createElement('script');
                scriptCluster.type = 'text/javascript';
                scriptCluster.src = 'lib/gmap/markerClusterer.js';
                $window.document.body.appendChild(scriptCluster);
            }

            function createMap() {
                console.log("map: create map start");
                var latitude = 49.219536;
                var longitude = -2.12662;
                if (scope.center) {
                    latitude = scope.center.latitude || 49.219536;
                    longitude =  scope.center.longitude || -2.12662;
                }
                var zoom = scope.zoom || 11;

                if (angular.isString(zoom)) zoom = scope.$eval(zoom);
                var mapOptions = {
                    zoom: zoom,
                    center: new google.maps.LatLng(latitude, longitude),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    panControl: true,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: false,
                    streetViewControl: false,
                    navigationControl: true,
                    disableDefaultUI: true,
                    overviewMapControl: true
                };
                if (!(map instanceof google.maps.Map)) {
                    console.log("map: create map now as not already available ");
                    map = new google.maps.Map(element[0], mapOptions);
                    // EDIT Added this and it works on android now
                    // Stop the side bar from dragging when mousedown/tapdown on the map
                    google.maps.event.addDomListener(element[0], 'mousedown', function(e) {
                        e.preventDefault();
                        return false;
                    });
                    infowindow = new google.maps.InfoWindow();
                }
            }

            scope.$watch('busStops', function(newBusStops) {
                updateMarkers(newBusStops);
            });

            scope.$watch('buses', function(busesTracks) {
                angular.forEach(busesMarkers, function(marker) {
                    marker.setMap(null);
                });
                angular.forEach(busStopsMarkers, function(marker) {
                    marker.setMap(null);
                });
                if (busesTracks) {
                    markerCluster.clearMarkers()
                } else {
                    if (markerCluster) {
                        markerCluster = new MarkerClusterer(map, busStopsMarkers);
                    }
                }
                angular.forEach(busesTracks, function(busTracks) {
                    updateMarkers(busTracks.busTracks, busTracks.routeCode);
                });
            });

            scope.$watch('currentLocation', function(newCurrentLocation) {
                updateMarkers(newCurrentLocation);
            });

            scope.$watch('center', function(value) {
                var latitude = 49.219536;
                var longitude = -2.12662;
                if (scope.center) {
                    latitude = scope.center.latitude || 49.219536;
                    longitude =  scope.center.longitude || -2.12662;
                }
                if (map) {
                    map.setCenter(new google.maps.LatLng(latitude, longitude))
                }
            });

            scope.$watch('zoom', function(value) {
                if (map && value) {
                    map.setZoom(value);
                }
            });

            // Info window trigger function
            function onItemClick(pin, label, member) {
                var contentString = getContent(label, member);
                // Replace our Info Window's content and position
                infowindow.setContent(contentString);
                infowindow.setPosition(pin.position);
                infowindow.open(map);
                google.maps.event.addListener(infowindow, 'closeclick', function() {
                    //console.log("map: info windows close listener triggered ");
                    infowindow.close();
                });
            }

            function getContent(label, member) {
                if (member.direction) {
                    return '<div class="no-link"><a href="#/app/route/' + member.routeCode+'"><h5>'+label+'</h5><div><p>'+member.direction+' </p></br></div></a></div>';
                }

                var routesContent = '';
                angular.forEach(member.routes, function (busStop) {
                    routesContent += '<span class="h-box h-box--xs color-route-' + busStop.code + '"> \
                    <span>' + busStop.code + '</span>\
                    </span>';
                });


                if (member.type == "user") {
                    return '<div class="no-link"><a href="#/app/busStop/' + member.code + '"><h5>' + label + '</h5><div>';
                } else {
                    return '<div class="no-link"><a href="#/app/busStop/' + member.code + '"><h5>' + label + '</h5><div>\
                <p>Routes: </br>\
                '+routesContent+' \
            </p></br></div></a></div>';
                }
            }

            function markerCb(marker, member, location) {
                return function() {
                    //console.log("map: marker listener for " + member.name);
                    var label = getLabel(member)
                    onItemClick(marker, label, member);
                };
            }

            function getLabel(member) {
                if (member.type == "user") {
                    return "You are (around) here";
                }
                if (member.direction) {
                    return 'Route: '+ member.routeCode
                }
                return member.name + ' (' +member.code + ')';
            }

            // update map markers to match scope marker collection
            function updateMarkers(markers, routeCode) {
                if (map && markers) {
                    // create new markers
                    //console.log("map: make markers ");
                    if (angular.isString(markers)) markers = scope.$eval(markers);

                    for (var i = 0; i < markers.length; i++) {
                        var m = markers[i];
                        if (routeCode) {
                            m.routeCode = routeCode
                        }
                        var icon = getMarkerImage(m)
                        var loc = new google.maps.LatLng(m.latitude, m.longitude);
                        var mm = new google.maps.Marker({ icon: icon, position: loc, map: map, title: m.name });
                        //console.log("map: make marker for " + m.name);
                        google.maps.event.addListener(mm, 'click', markerCb(mm, m, loc));
                        if (m.type == 'user') {
                        } else if (m.direction) {
                            busesMarkers.push(mm);
                        } else {
                            busStopsMarkers.push(mm);
                        }
                    }
                    if (!markerCluster) {
                        setTimeout(function () {
                            markerCluster = new MarkerClusterer(map, busStopsMarkers);
                        }, 100);
                    }
                }
            }

            // get icon for the marker
            function getMarkerImage(marker) {
                var image
                if (marker.type == "user") {
                    image = new google.maps.MarkerImage('img/marker-me.png',
                        new google.maps.Size(40, 40),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(8, 0),
                        new google.maps.Size(40, 40));
                } else if (marker.direction) {
                    image = new google.maps.MarkerImage('img/img-'+marker.routeCode+'.png',
                        // This marker is 20 pixels wide by 32 pixels tall.
                        new google.maps.Size(30, 30),
                        // The origin for this image is 0,0.
                        new google.maps.Point(0, 0),
                        // The anchor for this image is the base of the flagpole at 0,32.
                        new google.maps.Point(8, 0),
                        new google.maps.Size(30, 30));
                } else {
                    image = new google.maps.MarkerImage('img/bus.png',
                        // This marker is 20 pixels wide by 32 pixels tall.
                        new google.maps.Size(128, 128),
                        // The origin for this image is 0,0.
                        new google.maps.Point(0, 0),
                        // The anchor for this image is the base of the flagpole at 0,32.
                        new google.maps.Point(18, 0),
                        new google.maps.Size(35, 35));
                }
                return image
            }

            // convert current location to Google maps location
            function getLocation(loc) {
                if (loc == null) return new google.maps.LatLng(40, -73);
                if (angular.isString(loc)) loc = scope.$eval(loc);
                return new google.maps.LatLng(loc.latitude, loc.longitude);
            }

        } // end of link:
    }; // end of return
});