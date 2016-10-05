var getCallsInprogress = [];

angular.module('myApp.services', [])


.service('APIFactory', function ($http, $resource, $q, LocalStorageService, DB_CONSTANTS, AccessTokenService, $rootScope) {
    LocalStorageService.clear();
    return {
        getAuth: function (path, headerData) {
            var deferred = $q.defer();

            var exists = getCallsInprogress.filter(function (x) { return x == path; });

            //TODO refactor, confusing use of !
            if (!exists.length > 0) {
                getCallsInprogress.push(path);

                $http.defaults.headers.common.AccessToken = AccessTokenService.get();

                //path = LocalStorageService.get(DB_CONSTANTS.dbRoutePath) + path;

                //path = 'http://41.185.30.193' + path;
                path = 'http://localhost:61832' + path;
                var apiCall = $resource(path, {}, { 'get': { timeout: 60000 } });

                apiCall.get(headerData,
                            function (response) {
                                if (response.IsSuccessful) {
                                    deferred.resolve(response.Details);
                                } else {
                                    if (!angular.isUndefined(response.Notifications)) {
                                        var notificiation = response.Notifications[0];

                                        deferred.reject(notificiation.Text);
                                    }

                                    deferred.reject();
                                }

                                getCallsInprogress.splice(0, 1);
                            },
                            function (error) {
                                if (error.status == 403) {
                                    LocalStorageService.clear();
                                    $rootScope.$broadcast('user.access.token.expired', {});
                                } else if (error.status === 0) {
                                    console.log('timeout:' + path);
                                    $rootScope.$broadcast('no.network.connectivity', {});
                                }
                                deferred.reject(error.statusText);
                                getCallsInprogress.splice(0, 1);
                            }
                           );
            }
            return deferred.promise;
        },
        postAuth: function (path, postData) {
            var deferred = $q.defer();

            var exists = postCallsInprogress.filter(function (x) { return x == path; });

            //TODO refactor, confusing use of !
            if (!exists.length > 0) {
                postCallsInprogress.push(path);

                $http.defaults.headers.common.AccessToken = AccessTokenService.get();

                //path = LocalStorageService.get(DB_CONSTANTS.dbRoutePath) + path;

                //path = 'http://41.185.30.193' + path;
                path = 'http://localhost:61832' + path;
                var postApiCall = $resource(path, {}, { 'save': { method: 'POST', timeout: 120000 } });

                postApiCall.save(postData,
                                 function (response) {
                                     if (response.IsSuccessful) {
                                         deferred.resolve(response.Details);
                                     } else {
                                         var notificiation = response.Notifications[0];

                                         deferred.reject(notificiation.Text);
                                     }
                                     postCallsInprogress.splice(0, 1);
                                 },
                                 function (error) {
                                     if (error.status == 403) {
                                         LocalStorageService.clear();
                                         $rootScope.$broadcast('user.access.token.expired', {});
                                     } else if (error.status === 0) {
                                         console.log('timeout:' + path);
                                         $rootScope.$broadcast('no.network.connectivity', {});
                                     }
                                     deferred.reject(error.statusText);
                                     postCallsInprogress.splice(0, 1);
                                 }
                                );
            }
            return deferred.promise;
        },
        get: function (path, headerData) {
            var deferred = $q.defer();

            //path = LocalStorageService.get(DB_CONSTANTS.dbRoutePath) + path;

            // path = 'http://41.185.30.193' + path;

            path = 'http://localhost:61832' + path;
            var postApiCall = $resource(path, {}, { 'get': { timeout: 20000 } });

            postApiCall.get(headerData,
                            function (response) {
                                if (response.IsSuccessful) {
                                    deferred.resolve(response.Details);
                                } else {
                                    if (!angular.isUndefined(response.Notifications)) {
                                        var notificiation = response.Notifications[0];

                                        deferred.reject(notificiation.Text);
                                    }
                                    deferred.reject();
                                }
                            },
                            function (error) {
                                deferred.reject(error.Message);
                            }
                           );

            return deferred.promise;
        },
        post: function (path, postData) {
            var deferred = $q.defer();

            path = LocalStorageService.get(DB_CONSTANTS.dbRoutePath) + path;
            var postApiCall = $resource(path, {}, { 'save': { method: 'POST', timeout: 30000 } });

            postApiCall.save(postData,
                             function (response) {
                                 if (response.IsSuccessful) {
                                     deferred.resolve(response.Details);
                                 } else {
                                     if (!angular.isUndefined(response.Notifications)) {
                                         var notificiation = response.Notifications[0];

                                         deferred.reject(notificiation.Text);
                                     }
                                     deferred.reject();
                                 }
                             },
                             function (error) {
                                 deferred.reject(error.Message);
                             }
                            );

            return deferred.promise;
        }
    };
})

.factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork) {

    return {
        isOnline: function () {

            if (ionic.Platform.isWebView()) {
                return $cordovaNetwork.isOnline();
            } else {
                return navigator.onLine;
            }

        },
        ifOffline: function () {

            if (ionic.Platform.isWebView()) {
                return !$cordovaNetwork.isOnline();
            } else {
                return !navigator.onLine;
            }

        }
    }
})
.factory('GoogleMaps', function ($cordovaGeolocation, $ionicLoading, $rootScope, $cordovaNetwork, Markers, ConnectivityMonitor) {

    var markerCache = [];
    var apiKey = false;
    var map = null;

    function initMap() {

        var options = { timeout: 10000, enableHighAccuracy: true };

        $cordovaGeolocation.getCurrentPosition(options)
    .then(function (position) {

        var latLng = new google.maps.LatLng(position.coords.latitude,
  position.coords.longitude);

        var mapOptions = {
            center: latLng,
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map"),
  mapOptions);

        //Wait until the map is loaded
        google.maps.event.addListenerOnce(map, 'idle', function () {
            loadMarkers();

            //Reload markers every time the map moves
            google.maps.event.addListener(map, 'dragend', function () {
                console.log("moved!");
                loadMarkers();
            });

            //Reload markers every time the zoom changes
            google.maps.event.addListener(map, 'zoom_changed', function () {
                console.log("zoomed!");
                loadMarkers();
            });

            enableMap();

        });

    }, function (error) {
        console.log("Could not get location");
    });

    }

    function enableMap() {
        $ionicLoading.hide();
    }

    function disableMap() {
        $ionicLoading.show({
            template: 'You must be connected to the Internet to view this map.'
        });
    }

    function loadGoogleMaps() {

        $ionicLoading.show({
            template: 'Loading Google Maps'
        });

        //This function will be called once the SDK has been loaded
        window.mapInit = function () {
            initMap();
        };

        //Create a script element to insert into the page
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = "googleMaps";

        //Note the callback function in the URL is the one we created above
        if (apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey
      + '&sensor=true&callback=mapInit';
        }
        else {
            script.src = 'http://maps.google.com/maps/api/js?sensor=true&callback=mapInit';
        }

        document.body.appendChild(script);

    }

    function checkLoaded() {
        if (typeof google == "undefined" || typeof google.maps == "undefined") {
            loadGoogleMaps();
        } else {
            enableMap();
        }
    }

    function loadMarkers() {

        var center = map.getCenter();
        var bounds = map.getBounds();
        var zoom = map.getZoom();

        var markers = Markers.all();
        console.log("Markers: ", markers);
        var records = markers;

        for (var i = 0; i < records.length; i++) {

            var record = records[i];

            // Check if the marker has already been added
            if (!markerExists(record.lat, record.lng)) {

                var markerPos = new google.maps.LatLng(record.lat, record.lng);
                // add the marker
                var marker = new google.maps.Marker({
                    map: map,
                    animation: google.maps.Animation.DROP,
                    position: markerPos
                });

                // Add the marker to the markerCache so we know not to add it again later
                var markerData = {
                    lat: record.lat,
                    lng: record.lng,
                    marker: marker
                };

                markerCache.push(markerData);

                var infoWindowContent = "<h4>" + record.name + "</h4>";

                addInfoWindow(marker, infoWindowContent, record);
            }

        }

        //});
    }

    function markerExists(lat, lng) {
        var exists = false;
        var cache = markerCache;
        for (var i = 0; i < cache.length; i++) {
            if (cache[i].lat === lat && cache[i].lng === lng) {
                exists = true;
            }
        }

        return exists;
    }

    function getBoundingRadius(center, bounds) {
        return getDistanceBetweenPoints(center, bounds.northeast, 'miles');
    }

    function getDistanceBetweenPoints(pos1, pos2, units) {

        var earthRadius = {
            miles: 3958.8,
            km: 6371
        };

        var R = earthRadius[units || 'miles'];
        var lat1 = pos1.lat;
        var lon1 = pos1.lng;
        var lat2 = pos2.lat;
        var lon2 = pos2.lng;

        var dLat = toRad((lat2 - lat1));
        var dLon = toRad((lon2 - lon1));
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        return d;

    }

    function toRad(x) {
        return x * Math.PI / 180;
    }

    function addInfoWindow(marker, message, record) {

        var infoWindow = new google.maps.InfoWindow({
            content: message
        });

        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(map, marker);
        });

    }

    function addConnectivityListeners() {

        if (ionic.Platform.isWebView()) {

            // Check if the map is already loaded when the user comes online, 
            //if not, load it
            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                checkLoaded();
            });

            // Disable the map when the user goes offline
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                disableMap();
            });

        }
        else {

            //Same as above but for when we are not running on a device
            window.addEventListener("online", function (e) {
                checkLoaded();
            }, false);

            window.addEventListener("offline", function (e) {
                disableMap();
            }, false);
        }

    }

    return {
        init: function (key) {

            if (typeof key != "undefined") {
                apiKey = key;
            }

            if (typeof google == "undefined" || typeof google.maps == "undefined") {

                console.warn("Google Maps SDK needs to be loaded");

                disableMap();

                if (ConnectivityMonitor.isOnline()) {
                    loadGoogleMaps();
                }
            }
            else {
                if (ConnectivityMonitor.isOnline()) {
                    initMap();
                    enableMap();
                } else {
                    disableMap();
                }
            }

            addConnectivityListeners();

        }
    }

})
.factory('Markers', function ($http) {

    var markers = [{
        id: 0,
        name: 'Barcode 7',
        lat: -33.8331752,
        lng: 18.6470702

    },
    {
        id: 1,
        name: 'Ostro',
        lat: -33.834078,
        lng: 18.647988
    }];

    return {

        all: function () {
            return markers;
        }
    }
})
.factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'img/ben.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'img/max.png'
    }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'img/adam.jpg'
    }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'img/perry.png'
    }, {
        id: 4,
        name: 'Mike Harrington',
        lastText: 'This is wicked good ice cream.',
        face: 'img/mike.png'
    }];

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.splice(chats.indexOf(chat), 1);
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        }
    };
})

.service('FeaturedDealFactory', function (APIFactory, API_PATHS, $q, LocalStorageService, DB_CONSTANTS) {
    return {
        getAll: function () {
            var promise = APIFactory.getAuth(API_PATHS.FEATURED_DEALS, {}).then(
                function (data) {
                    LocalStorageService.setObject(DB_CONSTANTS.dbFeaturedDeals, data);
                },
                function (error) {
                    return $q.reject(error);
                });

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            };

            return promise;
        },
        save: function (data) {
            var promise = APIFactory.postAuth(API_PATHS.FEATURED_DEALS, data).then(
                function (data) {
                    LocalStorageService.setObject(DB_CONSTANTS.dbProfileString, data);
                },
                function (error) {
                    return $q.reject(error);
                });

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            };

            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            };

            return promise;
        }
    };
})
.factory('LocalStorageService', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            var val = $window.localStorage.getItem(key);
            return val === null ? val : JSON.parse(val);
        },
        clear: function () {
            $window.localStorage.clear();
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        exists: function (key) {
            if ($window.localStorage.getItem(key) === null) {
                return false;
            }
            return true;
        }
    };
})

.factory('AccessTokenService', function (LocalStorageService, DB_CONSTANTS) {
    return {
        get: function () {
            return LocalStorageService.get(DB_CONSTANTS.dbAccessToken);
        },
        set: function (value) {
            LocalStorageService.set(DB_CONSTANTS.dbAccessToken, value);
        }
    };
})
;