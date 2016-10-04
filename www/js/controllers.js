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

.controller('DashCtrl', function ($scope, $state, $rootScope,
    //ionicToast,
    FeaturedDealFactory, $ionicLoading, $controller) {
    angular.extend(this, $controller('BaseController', { $scope: $scope, ViewName: 'Featured Deals' }));

    $scope.MessageValidation = false;
   
    $scope.scdata = $rootScope.scdata;
    delete $rootScope.scdata;
    $scope.$on('$ionicView.enter', function () {
        FeaturedDealFactory.getAll()
    });

})

.controller('LinksController', function ($scope) { })

.controller('MapCtrl', function ($scope, $state, $cordovaGeolocation,GoogleMaps) {
    
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
