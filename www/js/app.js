// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('myApp', ['ionic', 'ngCordova','ngResource', 'myApp.controllers', 'myApp.services'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function ($compileProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
    $compileProvider.debugInfoEnabled(false);
    //$translateProvider.useSanitizeValueStrategy('escape');
    $ionicConfigProvider.tabs.position('top');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.form.checkbox('circle');
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    //for (var lang in translations) {
    //    $translateProvider.translations(lang, translations[lang]);
    //}

    //$translateProvider.preferredLanguage('en');

    $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        cache: false,
        templateUrl: 'screens/tabs.html'
    })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
      url: '/dash',
      views: {
          'tab-dash': {
              templateUrl: 'screens/tab-dash.html',
              controller: 'DashCtrl'
          }
      }
  })
    .state('tab.bars', {
        url: '/bars',
        views: {
            'tab-bars': {
                templateUrl: 'screens/tab-bars.html',
                controller: 'MapCtrl'
            }
        }
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

})
.constant('CONFIGS', {
    'ClientVersion': '1.0.0',
    'ExpectedApiVersion': '1.0.0',
    'PlatformAndroid': 'android',
    'PlatformIOS': 'ios'//,
    //'GoogleAnalytics': 'UA-46169857-8'
})
.constant('API_PATHS', {
    //Prod
    //'CENTRAL_ROOT': 'https://api-mobi-central.hellodoctor.com',
    //UAT
    'CENTRAL_ROOT': 'http://api-central-mobi-dev.hellodoctor.com/',
    //'CENTRAL_ROOT': 'http://10.3.226.86/MOBILE.API.CENTRAL',
    'CHANGE_PASSWORD': '/changepassword',
    'LOGIN_PATH': '/Login',
    'TIPS_PATH': '/Tips',
    'FEATURED_DEALS': '/FeaturedDeals',
    
})

.constant('DB_CONSTANTS', {
    'dbUserProfileString': 'dbUserProfileString',
    'dbUserString': 'dbUserString',
    'dbProfileString': 'dbProfileString',
    'dbHealthTipCategories': 'dbHealthTipCategories',
    'dbUserSubscriptions': 'dbUserSubscriptions',
    'dbCountries': 'dbCountries',
    'dbRouteCountries': 'dbRouteCountries',
    'dbRoutePath': 'dbRoutePath',
    'dbAccessToken': 'dbAccessToken',
    'dbLoginCountry': 'dbLoginCountry',
    'dbHealthTipCounter': 'dbHealthTipCounter',
    'dbMessageCounter': 'dbMessageCounter'
})


;