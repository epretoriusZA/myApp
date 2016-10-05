angular.module('myApp.controllers', [])

//TODO: Extend to handle errors
.controller('BaseController', function ($scope, ViewName
    //, ionicToast
    //, $translate
    ) {
    if (window.cordova) {
        $scope.$on('$ionicView.enter', function () {
            //to be added with analytics
            // if (typeof analytics !== 'undefined') { analytics.trackView(ViewName); }
        });

        $scope.$on('no.network.connectivity', function (event, args) {
            //ionicToast.show($translate.instant('nonetworktitle'), 'bottom', false, 2500);
        });
    }
})
.controller('LoadingController', function ($ionicPlatform, $rootScope, $ionicLoading, $state, $ionicPopup, FeaturedDealFactory, LocalStorageService, DB_CONSTANTS) {
    $ionicPlatform.ready(function () {
        // TODO: Add translation or remove before deployment
        $ionicLoading.show({ template: 'Loading deals...' });
        //VersionFactory.get().success(function (data) {
        //    if (!data.ApiVersionSupport) {
        //        var alertPopup = $ionicPopup.alert({
        //            title: 'New version!',
        //            template: '<a ng-href="' + data.UpdateUrl + '">Upgrade</a>'
        //        });
        //        alertPopup.then(function (res) {
        //            navigator.app.exitApp();
        //        });
        //    }
        //});

        //CountryFactory.getForProfile();

        //if (LocalStorageService.exists(DB_CONSTANTS.dbProfileString)) {
        //    var profile = LocalStorageService.getObject(DB_CONSTANTS.dbProfileString);
        //    PushNotificationsService.registerForPush(profile.Username, profile.EmailAddress, profile.MobileNumber, profile.CountryCode);

        //    $rootScope.showSymptomChecker = profile.CountryCode === 27;

        FeaturedDealFactory.getAll();


        //    CategoriesFactory.getUserSubscriptions();

        //    //Maybe remove this and just keep messages from message controller
        //    MessagesFactory.getAllMessages();



        //    // TODO: Check for active subscriptions and log out user if none
        //    UserProfileService.updateProducts().success(function (data) {
        //        $ionicLoading.hide();
        //        var activeSubscriptions = data.filter(function (x) {
        //            return x.Active === true;
        //        });

        //        if (activeSubscriptions.length === 0) {
        //            countryCodeforExpired = profile.CountryCode;
        //            LocalStorageService.clear();
        //            $state.go('subscription-expired');
        //        }
        //        else {
        //            $state.go('main.home');
        //        }

        //    }).error(function (error) {
        //        $ionicLoading.hide();
        //        $state.go('sign-in');
        //    });
        //}
        //else {
        //    $state.go('sign-in-intro');
        //}
        $ionicLoading.hide();
        $state.go('tab.dash');
    });
})

.controller('DashCtrl', function ($scope, $state, $rootScope,
    //ionicToast,
    FeaturedDealFactory, DB_CONSTANTS, LocalStorageService, $ionicLoading, $controller) {
    angular.extend(this, $controller('BaseController', { $scope: $scope, ViewName: 'Featured Deals' }));

    $scope.scdata = $rootScope.scdata;
    delete $rootScope.scdata;
    $scope.$on('$ionicView.enter', function () {
        //FeaturedDealFactory.getAll();
        $scope.featuredDeals = LocalStorageService.getObject(DB_CONSTANTS.dbFeaturedDeals);
        $scope.groups = [];
        var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        for (var i = 0; i < 7; i++) {
            $scope.groups[i] = {
                name: weekday[i],
                items: []
            };
            for (var j = 0; j < 3; j++) {
                $scope.groups[i].items.push(i + '-' + j);
            }
        }
       /*
        * if given group is the selected group, deselect it
        * else, select the given group
        */
        $scope.toggleGroup = function (group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function (group) {
            return $scope.shownGroup === group;
        };
    });

})

.controller('LinksController', function ($scope) { })

.controller('MapCtrl', function ($scope, $state, $cordovaGeolocation, GoogleMaps) {

    GoogleMaps.init('AIzaSyBl_LYWRtdJTgDNs1V55kIK1G9owO6Hptw');
    //var cityCircle = new google.maps.Circle({
    //    strokeColor: '#FF0000',
    //    strokeOpacity: 0.8,
    //    strokeWeight: 2,
    //    fillColor: '#8DACD6',
    //    fillOpacity: 0.35,
    //    map: $scope.map,
    //    center: latLng,
    //    radius: 20000
    //});


})

.controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function ($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
