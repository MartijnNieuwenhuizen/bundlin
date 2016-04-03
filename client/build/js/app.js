// Bundlin Environment Variable
// please note, this file is overwritten during deployment
// possible values: staging, acceptance, production
var BLN_ENVIRONMENT = "development";
var BLN_BUILD_TIMESTAMP = "111111111";;(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
 (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
 })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

if(typeof BLN_ENVIRONMENT !== 'undefined' && BLN_ENVIRONMENT == 'production') {
  ga('create', 'UA-34557675-9', 'bundlin.com');
} else {
  ga('create', 'UA-34557675-9', {'cookieDomain': 'none'});
}
;// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (! window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (! window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
;'use strict';

// Initialize Angular app
var app = angular.module('bundlin', [
    'duScroll', // durated/angular-scroll: angular scrollTo function
    'ui.router', // to handle the dynamic views
    'ngAnimate',
    'restangular', // to handle API requests
    'angulartics', // Google Analytics for angular
    'angulartics.google.analytics',
    'angularFileUpload',
    'ngTagsInput',
    'ng-fastclick',
    'toastr'
]);;app.config(function(RestangularProvider) {

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setFullResponse(true);

    RestangularProvider.addResponseInterceptor(function(response, operation) {
        if (!response || !response.data) return response;

        var newResponse = response.data;

        if (operation === 'get' || operation === 'post') {
            newResponse = newResponse[0];
        }

        return newResponse;
    });

});
;app.config(function($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) {

    // Disable strict mode
    $urlMatcherFactoryProvider.strictMode(false);

    // HTML5 mode (no #)
    $locationProvider.html5Mode(true); 

    // Redirects
    $urlRouterProvider
        .when('/intro', '/')
        .when('/pim', '/12001')
        .when('/nick', '/12002')
        .when('/peter', '/12003')
        .otherwise(function ($injector, $location) {
            var $state = $injector.get('$state');
            if($state.current.name !== 'app.error') {
                var wrongUrl = $location.$$url;
                $state.go('app.error', { bundleId: 404 });
            }
        });

    // Routes
    $stateProvider

        // app
        .state('app', {
            url: '',
            abstract: true,
            controller: 'AppController',
            templateUrl: '/views/layouts/app.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.error', {
            url: '/error/:bundleId',
            controller: 'ViewBundleController',
            templateUrl: '/views/app/view_bundle.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.home', {
            url: '/',
            template: '<ui-view></ui-view>'
        })
        .state('app.home.intro', {
            url: '',
            controller: 'IntroController',
            templateUrl: '/views/app/intro.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.home.feed', {
            templateUrl: '/views/app/feed.html?v=' + BLN_BUILD_TIMESTAMP,
            controller: 'FeedController',
            abstract: true
        })
        .state('app.home.feed.popular', {
            url: '',
            views: {
                'bundles': {
                    templateUrl: '/views/app/feed_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getPopularBundles(currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('Trending Bundles on Bundlin', 'These are the popular, most viewed Bundles on Bundlin.com. The trending Bundles are refreshed every hour.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.home.feed.new', {
            url: 'latest',
            views: {
                'bundles': {
                    templateUrl: '/views/app/feed_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getLatestBundles(currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('The Latest Bundles on Bundlin', 'This is a stream of the latest Bundles created by people around the world!');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.home.feed.following', {
            url: 'following',
            views: {
                'bundles': {
                    templateUrl: '/views/app/feed_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getFollowerBundles(currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('Bundles created by Bundlers you follow', 'These are the Bundles created by Bundlers you follow! The more people you follow, to more active this stream becomes.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.create_bundle', {
            url: '/create',
            controller: 'CreateBundleController'
        })
        .state('app.profile', {
            url:'/profile',
        })
        .state('app.view_profile', {
            url:'/profile/:profileScreenName',
            templateUrl: '/views/app/view_profile.html?v=' + BLN_BUILD_TIMESTAMP,
            controller: 'ViewProfileController',
            abstract: true
        })
        .state('app.view_profile.bundles', {
            url: '',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll(username + ' on Bundlin.com', username + ' is a creator of beautiful lookbooks consisting of amazing links on Bundlin.com.');
                                SEO.set('author', username);
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.view_profile.collects', {
            url: '/collected',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;

                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserCollectedBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('These are the Bundles collected by ' + username, 'Collect Bundles so you never lose track of your favorite content.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.view_profile.published', {
            url: '/published',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserPublishedBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll(username + '\'s published Bundles on Bundlin', 'These Bundles are visible to everyone.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.view_profile.unpublished', {
            url: '/unpublished',
            views: {
                'bundles': {
                    templateUrl: '/views/app/view_profile_bundles.html?v=' + BLN_BUILD_TIMESTAMP,
                    controller: function($scope, $state, Bundles, $rootScope, SEO) {
                        $rootScope.stateTransition.time = 0;
                        var username = $state.params.profileScreenName, currentPage = 1, loading = false;
                        $scope.bundles  = [];
                        $scope.$parent.loadBundles = function() {
                            if(loading) return;
                            Bundles.getUserUnpublishedBundles(username, currentPage).then(function(bundles){
                                $scope.bundles = $scope.bundles.concat(bundles);
                                currentPage++;
                                loading = false;
                                $rootScope.pageLoading = 'loaded';
                                SEO.setForAll('Your unpublished Bundles', 'This are the Bundles that are not visible to the public.');
                            });
                        };
                        $scope.$parent.loadBundles();
                    }
                }
            }
        })
        .state('app.edit_bundle', {
            url: '/:bundleId/edit',
            controller: 'EditBundleController',
            templateUrl: '/views/app/edit_bundle.html?v=' + BLN_BUILD_TIMESTAMP
        })
        .state('app.view_bundle', {
            url: '/:bundleId',
            controller: 'ViewBundleController',
            templateUrl: '/views/app/view_bundle.html?v=' + BLN_BUILD_TIMESTAMP
        })

});
;app.run(function($rootScope, SEO, $state, tooltips, stateTransition, debouncedEvents, $window, $filter, scrollToggler, $timeout, $document, sideextensions, Auth, $urlRouter) {

    // Rootscope variables
    $rootScope.generalLoading = 'intro';
    $rootScope.state = $state;
    $rootScope.filter = $filter;
    $rootScope.extraStateParams = false;
    $rootScope.Modernizr = Modernizr;
    $rootScope.stateTransition = {
        time: 0,
        status: 'in',
        same: false
    };
    $rootScope.BLN_BUILD_TIMESTAMP = BLN_BUILD_TIMESTAMP;

    debouncedEvents.onResize(function() {
        $rootScope.mobile = $window.innerWidth < 768;
    }, 30);

    var prevent = function (event) {
        event.preventDefault();
        $urlRouter.update(true);
    };

    // On state change
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        if(toState.name == 'app.home') {
            prevent(event);
            Auth.user()
                .then(function(user) {
                    if (user.hasRole('beta', 'admin')) {
                        $state.go('app.home.feed.popular');
                    } else {
                        $state.go('app.home.intro');
                    }
                }, function() {
                    $state.go('app.home.intro');
                });
            return false;
        }
        if(toState.name == 'app.profile'){
            prevent(event);
            Auth.user()
                .then(function(user) {
                    if (user.hasRole('beta', 'admin')) {
                        $state.go('app.view_profile.bundles', {profileScreenName: user.username});
                    } else {
                        $state.go('app.home');
                    }
                }, function() {
                    $state.go('app.home');
                });
            return false;
        }
        

        // Loading
        if($rootScope.generalLoading !== 'intro') {
            $rootScope.generalLoading = 'loading';
            $rootScope.pageLoading = 'loading';
        }

        // Disable all sideextensions
        sideextensions.disableAll();
        tooltips.disableAll();

        // Enable scroll
        scrollToggler.enable();

        // State transition handling
        toState.extraParams = $rootScope.extraStateParams;
        $rootScope.extraStateParams = false;
        stateTransition.run(event, toState, toParams, fromState, fromParams, function() {
            // Pre
            SEO.reset();
        }, function() {
            // Post
            $rootScope.appSidebar = toState.sidebar || $rootScope.appSidebar;
            $rootScope.appSidebarScope = {};
            $rootScope.loading = {
                state: false
            };
            
            // Go to top of page
            $document.scrollTo(angular.element(document.querySelector('html')), 0, 0);
        });
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        $timeout(function(){
            if($rootScope.pageLoading === 'loading') $rootScope.pageLoading = 'loaded';

        }, 1000)
        $timeout(function() {
            // Loading
            if($rootScope.generalLoading === 'loading') $rootScope.generalLoading = 'loaded';
        }, 2000);
    });

    $timeout(function() {
        $rootScope.pageLoading = 'loaded';
        $rootScope.generalLoading = 'loaded';
    }, 3000);

});;app.config(function($sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        '**'
    ]);

});
;app.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        allowHtml: false,
        closeButton: false,
        closeHtml: '',
        containerId: 'bln-toastcontainer',
        iconClass: 'bln-sub-icon',
        iconClasses: {
            error: 'bln-toast-error',
            info: 'bln-toast-info',
            success: 'bln-toast-success',
            warning: 'bln-toast-warning'
        },
        maxOpened: 5,
        messageClass: 'bln-sub-message',
        newestOnTop: true,
        onHidden: null,
        onShown: null,
        positionClass: '',
        preventDuplicates: false,
        progressBar: false,
        tapToDismiss: false,
        target: 'bln-app, bln-modals',
        timeOut: 3500,
        titleClass: 'bln-sub-title',
        toastClass: 'bln-toast'
    });
});;app.controller('AppController', function($scope, Auth, $document, fieldWatcher, $animate, $analytics, $rootScope, scrollToggler) {
    $scope.setFocuspointForPlaceholder = function setFocuspointForPlaceholder(bundle){
        bundle.picture.focus_x = 50;
        bundle.picture.focus_y = 100;
    }
    /***********************************************************************************************/
    /* App config */
    /***********************************************************************************************/
    $animate.enabled(false);


    /***********************************************************************************************/
    /* User check */
    /***********************************************************************************************/
    Auth.user(true) // passing true to force session call
        .then(function () {
            $analytics.eventTrack('Session call', {category: 'System action', label: 'Success: user session created'});
        });


    /***********************************************************************************************/
    /* App event listeners */
    /***********************************************************************************************/
    $scope.modalIsActive = false;
    $rootScope.$on('modals:firstmodalopens', function () {
        scrollToggler.disable();
        $scope.modalIsActive = true;
    });

    $rootScope.$on('modals:lastmodalcloses', function () {
        scrollToggler.enable();
        $scope.modalIsActive = false;
    });
    /***********************************************************************************************/
    /* Secret thing */
    /***********************************************************************************************/
    fieldWatcher('turnaround', function() {
        $('html').addClass('fieldwatcher-turnaround');
        $document.scrollTo($("html"), 0, 500);
    }, $scope);
    fieldWatcher('comicsans', function() {
        $('*').addClass('fieldwatcher-comicsans');
    }, $scope);
    fieldWatcher('pleasebreath', function() {
        $('.bln-sidebaricon, .bln-bundleitem, .bln-title, .bln-paragraph, .bln-tags>li, .bln-author').addClass('fieldwatcher-pleasebreath');
    }, $scope);

});;app.controller('CreateBundleController', function($scope, $rootScope, $stateParams, $state, Auth, Restangular, error, Bundles) {
    
    /***********************************************************************************************/
    /* Create bundle */
    /***********************************************************************************************/
    Bundles.createBundle().then(function (bundle) {
        $state.go('app.edit_bundle', {
            bundleId: bundle._sid
        });
    }, function (error) {
        $state.go('app');
    });

});
;app.controller('EditBundleController', function($scope, $rootScope, $state, $stateParams, FileUploader, Auth, Restangular, $interval, $q, helpers, tags, $location, modals, toastr, SEO, $document) {

    /***********************************************************************************************/
    /* Page */
    /***********************************************************************************************/
    $rootScope.stateTransition.time = 350;
    $scope.Math = window.Math;
    $scope.loading = {
        page: true,
        scraper: false,
        new_quote: false,
        bundle: false,
        suggestion: false
    };
    $scope.scraperError = {
        active: false,
        message: '',
        timer: 0,
        intervalPromise: {}
    };
    var SCRAPER_ERROR_LIFETIME = 5; // seconds
    $scope.tweet = {
        content: ''
    };

    /***********************************************************************************************/
    /* Bundle */
    /***********************************************************************************************/
    var bundleBase = Restangular.one('bundles', $stateParams.bundleId);
    $scope.bundle = {};
    $scope.bundleTags = [];
    $scope.publishedItems = [];
    $scope.archivedItems = [];
    $scope.user = {};
    $scope.bundleValid = {
        valid: false,
        messages: []
    };
    $scope.creatorTwitterHandles = [];
    $scope.PROGRESSBAR_PUBLISH_TRESHOLD = 80;
    $scope.progress = 0;

    Auth.user()
        .then(function (user) {
            $scope.user = user;
        });

    // Get bundle
    $q.all([
            bundleBase.get(),
            Auth.user()
        ])
        .then(function(responses) {
            var bundle = responses[0].data;
            $scope.user = responses[1];

            if($scope.user.loggedIn && (bundle.author._id === $scope.user._id || $scope.user.hasRole('admin'))) {
                handleBundleData(bundle);
            } else {
                $state.go('app.error', { status: '404' });
            }
        }, function () {
            $state.go('app.error', { status: '404' });
        }).finally(function () {
            $scope.loading.page = false;
        });

    // Get tags
    $scope.loadTagsForTagsInput = function($query){
        return tags.load($query);
    };

    // Set SEO
    SEO.setForAll('Create a Bundle', 'You can use all sorts of web content, don\'t forget to come up with a compelling title and use an amazing cover photo.')

    // Handle bundle data
    var handleBundleData = function handleBundleData (bundle) {
        $scope.bundleTags = $scope.transformTagsForUI(bundle.tags);
        hydrateBundle(bundle);
        $scope.bundle = bundle;
        itemMaintenance($scope.bundle);
        if($scope.bundleValid && $scope.bundleValid.valid) {
            fillTweet();
        }
    };

    // Hydrate bundle
    var hydrateBundle = function hydrateBundle (bundle) {

        // Bundle cover image uploader
        bundle.imageUploader = new FileUploader({
            url: '/api/bundles/' + bundle._sid + '/picture',
            autoUpload: true,
            removeAfterUpload: true,
            onSuccessItem: function (uploaditem, response, status) {
                if(status === 200 && response && response.data && response.data[0]) {
                    bundle.picture = response.data[0];
                    bundle.uploaded_user_image = true;
                    runBundleValidation();
                }
            },
            onErrorItem: function(uploaditem, response, status, headers) {
                if(status === 413) {
                    toastr.error('Ooops! We couldn\'t process this immense picture.');
                    return;
                }
                if(response.message) {
                    toastr.error(response.message);
                }
            },
            onBeforeUploadItem: function () {
                bundle.loading.changepicture = true;
            },
            onCompleteItem: function () {
                bundle.loading.changepicture = false;
            }
        });

        // Loading states
        bundle.loading = {
            changepicture: false,
            tweeting: false
        };

        // Picture focus point defaults
        if(!bundle.picture.focus_x) bundle.picture.focus_x = 50;
        if(!bundle.picture.focus_y) bundle.picture.focus_y = 50;

        // Update bundle focuspoint callback
        bundle.setFocusPoint = function (x, y) {
            var newPicture = bundle.picture;
            newPicture.focus_x = x;
            newPicture.focus_y = y;
            $scope.updateBundle({
                picture: newPicture
            });
        };

        // Hydrate bundle items
        _.each(bundle.items, function (item) {
            hydrateItem(item, bundle._sid);
        });
    };

    // Hydrate invididual bundle item
    var hydrateItem = function hydrateItem (item, bundleSid) {

        // Initiate uploader when type=article
        if(item.type === 'article') {
            item.imageUploader = new FileUploader({
                url: '/api/bundles/' + bundleSid + '/items/' + item._sid + '/picture',
                autoUpload: false,
                removeAfterUpload: true,
                onSuccessItem: function (uploaditem, response, status, headers) {
                    if(status === 200 && response && response.data && response.data[0]) {
                        item.fields.picture = response.data[0];
                        item.fields.selected_crawled_image_index = -1;
                    }
                },
                onBeforeUploadItem: function () {
                    item.loading.changepicture = true;
                },
                onCompleteItem: function () {
                    item.loading.changepicture = false;
                },
                onErrorItem: function(uploaditem, response, status, headers) {
                    if(status === 413) {
                        toastr.error('Ooops! We couldn\'t process this immense picture.');
                        return;
                    }
                    if(response.message) {
                        toastr.error(response.message);
                    }
                }
            });

            item.loading = {
                changepicture: false
            };
        }
    };

    // Re-assign all published bundle item order indices
    var reAssignOrder = function reAssignOrder (bundle) {
        _.chain(bundle.items)
            .filter('active')
            .sortBy('order')
            .each(function (item, index) {
                item.order = index + 1;
            });
    };

    // Create filtered bundle items
    var updatePublicArchivedArrays = function updatePublicArchivedArrays (bundle) {
        $scope.publishedItems = _.filter(bundle.items, { active: true });
        $scope.archivedItems = _.filter(bundle.items, { active: false });
    };

    // Update bundle action
    $scope.updateBundle = function(data) {
        $scope.loading.bundle = true;
        return bundleBase.patch(data).then(function() {
            _.merge($scope.bundle, data);
            runBundleValidation()
        }).finally(function () {
            $scope.loading.bundle = false;
        });
    };

    // Update bundle tags
    var debouncedUpdateTags = _.debounce(function (bundleTags) {
        $scope.loading.suggestion = true;
        var transformedTags = $scope.transformTagsForSubmission(bundleTags);
        $scope.updateBundle({
            tags: transformedTags
        });
    }, 1500);
    $scope.updateTags = function (bundleTags) {
        debouncedUpdateTags(bundleTags);
    };

    var fillTweet = function fillTweet () {
        var title = $scope.bundle.title;
        var url = $location.host() + '/' + $scope.bundle._sid;
        url = url.replace('bundlin', 'Bundlin');

        $scope.tweet.content = [
            title,
            'on',
            url
        ].join(' ');
    };

    var updateCreatorTwitterHandles = function updateCreatorTwitterHandles () {
        var bundle = $scope.bundle;
        if(!bundle || !bundle.items || !bundle.items.length) return;

        $scope.creatorTwitterHandles = [];
        _.each(bundle.items, function (item) {
            switch(item.type) {
                case 'article':
                    if(item.fields && item.fields.creator && item.fields.creator.twitter && item.fields.creator.twitter.username && item.fields.creator.twitter.username.length > 0 && $scope.creatorTwitterHandles.indexOf(item.fields.creator.twitter.username) === -1)
                        $scope.creatorTwitterHandles.push(item.fields.creator.twitter.username);
                    break;
                case 'twitter_profile':
                    if(item.fields && item.fields.username && item.fields.username.length > 0 && $scope.creatorTwitterHandles.indexOf(item.fields.username) === -1)
                        $scope.creatorTwitterHandles.push(item.fields.username);
                    break;
                case 'twitter_tweet':
                    if(item.fields && item.fields.author && item.fields.author.username && item.fields.author.username.length > 0 && $scope.creatorTwitterHandles.indexOf(item.fields.author.username) === -1)
                        $scope.creatorTwitterHandles.push(item.fields.author.username);
                    break;
            }
        });
    };

    /***********************************************************************************************/
    /* Data transforms */
    /***********************************************************************************************/
    $scope.transformTagsForUI = function (tags) {
        return _.map(tags, function (tag) {
            return {
                text: tag
            };
        });
    };
    $scope.transformTagsForSubmission = function (tags) {
        // Retrieve suggestions based on provided tags
        $scope.suggestImages(tags);

        return _.map(tags, function (tag) {
            return tag.text;
        });
    };

    /***********************************************************************************************/
    /* Image Suggestions */
    /***********************************************************************************************/
    $scope.suggestImages = function (tags) {
        // Check if there is at least 1 tag to avoid crashes
        if (tags.length < 1) return;

        var tagArray = [];
        tags.forEach(function (tag) {
            tagArray.push(tag.text);
        });

        $scope.bundle.loading.changepicture = false;
        bundleBase
            .customPOST({ tags: tagArray }, 'updatesuggestions')
            .then(function(response) {
                var pictureObject = Restangular.stripRestangular(response.data);
                $scope.bundle.picture = pictureObject;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    $scope.nextSuggestion = function () {
        $scope.bundle.loading.changepicture = true;
        bundleBase
            .post('nextsuggestion')
            .then(function(response) {
                var pictureObject = Restangular.stripRestangular(response.data);
                $scope.bundle.picture = pictureObject;
                $scope.bundle.uploaded_user_image = false;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    $scope.previousSuggestion = function () {
        $scope.bundle.loading.changepicture = true;
        bundleBase
            .post('previoussuggestion')
            .then(function(response) {
                var pictureObject = Restangular.stripRestangular(response.data);
                $scope.bundle.picture = pictureObject;
                $scope.bundle.uploaded_user_image = false;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    $scope.unsetCoverimage = function () {
        $scope.bundle.loading.changepicture = true;
        $scope.updateBundle({ picture: {} })
            .then(function () {
                $scope.bundle.picture = {};
                $scope.bundle.uploaded_user_image = false;
                runBundleValidation();
            })
            .finally(function () {
                $scope.bundle.loading.changepicture = false;
            });
    };

    /***********************************************************************************************/
    /* Publish and restrictions */
    /***********************************************************************************************/
    $scope.publishBundle = function(tweetContent) {
        if(tweetContent.length > 140) return false;
        $scope.bundle.loading.tweeting = true;
        _.defer(function () { $scope.$apply() });

        var publish = function () {
            $scope.loading.bundle = true;
            var data = {
                tweet: tweetContent
            };
            bundleBase.customPOST(data, 'publish').then(function() {
                $scope.bundle.published = true;
                $state.go('app.view_bundle', { bundleId: $scope.bundle._sid });
            }, function(response) {
                if(response.status === 409) {
                    toastr.error('Publishing bundle failed, duplicate tweet found on timeline');
                } else if (response.status === 400) {
                    toastr.error(response.data.message);
                } else {
                    toastr.error('Publishing bundle failed');
                }
            }).finally(function () {
                $scope.bundle.loading.tweeting = false;
                $scope.loading.bundle = false;
            });
        };

        if(!$scope.user.twitter_write) {
            Auth.login().then(function () {
                $scope.user.twitter_write = true;
            })
            .finally(publish);
        } else {
            publish();
        }
    };
    $scope.unpublishBundle = function() {
        $scope.loading.bundle = true;
        bundleBase.customDELETE('publish').then(function() {
            $scope.bundle.published = false;
        }).finally(function () {
            $scope.loading.bundle = false;
        });
    };
    var PROGRESS_VALID_MIN = 80;
    var validProgress = 0;
    var validProgressMax = 9; // title + description + tags + picture + 5 items = 9 total;
    var progress = 0;
    var progressMax = 12; // title + description + tags + picture + 8 items = 12 total;

    $scope.bundleValidations = {
        title: false,
        description: false,
        tags: false,
        picture: false,
        items: false
    };

    var updateProgress = function updateProgress(){
        if(validProgress <= validProgressMax && !$scope.bundleValid.valid){
            $scope.progress = Math.ceil((PROGRESS_VALID_MIN / validProgressMax) * validProgress);
        } else {
            $scope.progress = PROGRESS_VALID_MIN + (Math.ceil(20 / 3) * (progress - validProgress));
        }
    }

    var validateBundle = function validateBundle(bundle) {
        if(!bundle) {
            return {
                valid: false,
                messages: ['no bundle found']
            };
        }
        $scope.bundleValidations = {
            title: false,
            description: false,
            tags: false,
            picture: false,
            items: false
        };
        var valid = true;
        var messages = [];

        progress = 0;
        validProgress = 0;

        if (bundle.title ) {
            if(bundle.title.length < 5 || bundle.title.length > 50) {
                valid = false;
                messages.push('title length incorrect');
            } else {
                $scope.bundleValidations.title = true;
                validProgress += 1;
                progress += 1;
            }

        } else {
            valid = false;
            messages.push('title is required');
        }
        if (bundle.description) {
            if(bundle.description.length < 30 || bundle.description.length > 250) {
                valid = false;
                messages.push('description length incorrect');
            } else {
                $scope.bundleValidations.description = true;
                validProgress += 1;
                progress += 1;
            }
            //EntityValidator.validate(bundle.description, 'Bundle description', 'required|length:min=30,max=250');
        } else {
            valid = false;
            messages.push('description is required');
        }

        if (bundle.tags) {
            if(bundle.tags.length < 1 || bundle.tags.length > 4) {
                valid = false;
                messages.push('number of tags is incorrect');
            } else {
                $scope.bundleValidations.tags = true;
                validProgress += 1;
                progress += 1;
            }
            //EntityValidator.validate(bundle.tags, 'Bundle tags', 'required|length:min=1,max=4');
        } else {
            valid = false;
            messages.push('tags are required');
        }

        if (bundle.items) {
            $scope.bundleValidations.items = true;
            if(_.filter(bundle.items, 'active').length < 5 || _.filter(bundle.items, 'active').length > 8) {
                messages.push('number of items is incorrect');
                valid = false;
                $scope.bundleValidations.items = false;
            }

            validProgress += _.filter(bundle.items, 'active').length < 5 ? _.filter(bundle.items, 'active').length : 5;
            progress += _.filter(bundle.items, 'active').length < 8 ? _.filter(bundle.items, 'active').length : 8;
            
            //EntityValidator.validate(items, 'Bundle items', 'length:min=5,max=8');
            //TODO: this.validateMaximalOne(items, ['quote', 'googlemaps', 'vimeo', 'youtube', 'twitter_tweet', 'twitter_profile', 'soundcloud', 'dribbble']);

        } else {
            valid = false;
            messages.push('items are required');
        }

        if (bundle.picture && bundle.picture.original) {
            $scope.bundleValidations.picture = true;
            validProgress += 1;
            progress += 1;

        } else {
            valid = false;
            messages.push('cover images is required');
        }

        return {
            valid: valid,
            messages: messages
        };
    };

    $scope.addHandleToTweet = function addHandleToTweet (handle) {
        if($scope.tweet.content.indexOf('→') === -1) {
            $scope.tweet.content += ' →';
        }
        $scope.tweet.content += ' ' + handle;
    };

    function runBundleValidation() {
        if(!$scope.bundle) return;
        $scope.bundleValid = validateBundle($scope.bundle);
        updateProgress();
    }

    $scope.$watch('bundleValid', function (newValue, oldValue) {
        if(newValue.valid && !oldValue.valid) {
            fillTweet();
        }
    }, true);

    /***********************************************************************************************/
    /* Delete */
    /***********************************************************************************************/
    $scope.deleteBundle = function() {
        if(confirm('Are you sure you want to delete this bundle?')) {
            bundleBase.remove().then(function() {
                $state.go('app.home');
            });
        }
    };

    /***********************************************************************************************/
    /* Item actions */
    /***********************************************************************************************/
    $scope.updateItem = function updateItem (item, data) {
        item.loading = true;
        return bundleBase.one('items', item._sid).patch(data).then(function() {
            _.merge(item, data);
        }).finally(function () {
            item.loading = false;
        });
    };

    $scope.deleteItem = function deleteItem (item) {
        item.loading = true;
        bundleBase.one('items', item._sid).remove().then(function() {
            $scope.bundle.items = _.without($scope.bundle.items, item);
            itemMaintenance($scope.bundle);
        }, function () {
            item.loading = false;
        });
    };

    $scope.archiveItem = function archiveItem (item) {
        $scope.updateItem(item, { active: false }).finally(function () {
            item.order = 0;

            itemMaintenance($scope.bundle);
        });
    };

    $scope.publishItem = function publishItem (item) {
        $scope.updateItem(item, { active: true }).finally(function () {
            var lastOrderItem = _.max($scope.bundle.items, 'order');
            if(lastOrderItem && lastOrderItem.order) {
                item.order = lastOrderItem.order + 1;
            } else {
                item.order = 1;
            }

            itemMaintenance($scope.bundle);
        });
    };

    $scope.moveItem = function moveItem(item, relativePosition) {
        if(!item.active) return;

        var sortedItems = _.sortBy($scope.bundle.items, 'order'),
            old_index = sortedItems.indexOf(item),
            new_index = old_index + relativePosition;

        var reSortedItems = helpers.moveItemThroughArray(sortedItems, old_index, new_index);
        var idsInOrder = _.pluck(reSortedItems, '_id');

        bundleBase.post('items/order', {ids: idsInOrder}).then(function(response) {

            var orderObject = response.data;
            _.each($scope.bundle.items, function(item) {
                item.order = orderObject[item._id];
            });

        });

    };

    var uploadItemImageByUrl = function uploadItemImageByUrl (item, url) {
        var defer = $q.defer();
        if (! url || ! item) {
            // _.defer(function () {
            //     defer.reject();
            // });
            // return defer.promise;
            return false;
        }

        item.loading.changepicture = true;
        bundleBase
            .one('items', item._sid)
            .customPOST({ picture: url }, 'picture')
            .then(function (response) {
                var picture = Restangular.stripRestangular(response.data);
                item.fields.picture = picture;
                item.fields.selected_crawled_image_index = -1;
                defer.resolve();
            }, function () {
                defer.reject();
            })
            .finally(function () {
                item.loading.changepicture = false;
            });

        return defer.promise;
    };

    var uploadItemImageByFile = function uploadItemImageByFile (item, file) {
        var Uploader = item.imageUploader;
        Uploader.addToQueue(file);
        Uploader.uploadAll();
    };

    var setCrawledImage = function setCrawledImage (item, index) {
        var url = item.fields.pictures[index];
        if(item && url) {
            uploadItemImageByUrl(item, url).then(function () {
                item.fields.selected_crawled_image_index = index;
            });
        }
    };

    $scope.selectPreviousCrawledImage = function selectPreviousCrawledImage (item) {
        var currentIndex = item.fields.selected_crawled_image_index || 0,
            newIndex = currentIndex - 1;

        if(newIndex < 0) {
            newIndex = item.fields.pictures.length - 1;
        }

        setCrawledImage(item, newIndex);
    };

    $scope.selectNextCrawledImage = function selectNextCrawledImage (item) {
        var currentIndex = item.fields.selected_crawled_image_index || 0,
            newIndex = currentIndex + 1;

        if(newIndex > item.fields.pictures.length - 1) {
            newIndex = 0;
        }

        setCrawledImage(item, newIndex);
    };

    $scope.closeCustomImage = function closeCustomImage (item) {
        if(item.fields.pictures.length) {
            $scope.selectNextCrawledImage(item);
        }
    };

    $scope.selectCustomImage = function selectCustomImage (item) {
        if(!modals.checkCurrentlyOpen('modal-custom-article-image')) {
            modals.open('modal-custom-article-image', {
                bundle: $scope.bundle,
                item: item
            }).then(function (responseData) {
                if(!responseData || !responseData.data) return;
                if(responseData.data.url) {
                    uploadItemImageByUrl(item, responseData.data.url);
                } else if (responseData.data.file) {
                    uploadItemImageByFile(item, responseData.data.file);
                }
            });
        }
    };

    /***********************************************************************************************/
    /* Add new scraper item */
    /***********************************************************************************************/
    $scope.newItemUrl = '';
    $scope.newItemSubmit = function newItemSubmit ($event) {
        $event.originalEvent.preventDefault();
        if(!$scope.newItemUrl || $scope.loading.scraper) return false;

        // Add item to bundle
        $scope.closeScraperError();
        $scope.loading.scraper = true;
        bundleBase.post('items/scrape', {
            active: true,
            url: $scope.newItemUrl
        }).then(function(response) {
            if(!response || !response.data) return;

            // Save new item
            var newItem = response.data;
            hydrateItem(newItem, $stateParams.bundleId);
            $scope.bundle.items.push(newItem);
            itemMaintenance($scope.bundle);
            _.defer(function () {
                $document.scrollTo($('.bln-sub-publisheditem:last-of-type'), 100, 500);
            });

            // Reset form
            this.newItemForm.$error    = {};
            this.newItemForm.$pristine = true;
            this.newItemForm.$dirty    = false;
            this.newItemForm.$valid    = true;
            this.newItemForm.$invalid  = false;
            $scope.newItemUrl = '';

        }, function() {

            // New scraper error
            setScraperError('We are unable to load this item, please check your link');

        }).finally(function () {
            $scope.loading.scraper = false;
        });

        return false;
    };

    var itemMaintenance = function itemMaintenance(bundle) {
        reAssignOrder($scope.bundle);
        updatePublicArchivedArrays($scope.bundle);
        runBundleValidation();
        updateCreatorTwitterHandles();
    }

    var setScraperError = function setScraperError (message) {
        $scope.scraperError = {
            active: true,
            message: message,
            timer: 5,
            intervalPromise: $interval(function() {
                $scope.scraperError.timer --;
                if($scope.scraperError.timer <= 0) {
                    $scope.closeScraperError();
                }
            }, 1000)
        };

        $scope.$on('$destroy', function () {
            $interval.cancel($scope.scraperError.intervalPromise);
        });
    };

    $scope.closeScraperError = function closeScraperError () {
        $interval.cancel($scope.scraperError.intervalPromise);
        $scope.scraperError = {
            active: false,
            message: '',
            timer: 0,
            intervalPromise: {}
        };
    };

    /***********************************************************************************************/
    /* Add new quote item */
    /***********************************************************************************************/
    $scope.createEmptyQuote = function() {

        $scope.loading.new_quote = true;
        bundleBase.post('items', {
            active: true,
            type: 'quote',
            fields: {
                'quote': '',
                'quote_author': ''
            }
        }).then(function(response) {
            if(!response || !response.data) return;

            // Save new item
            var newItem = response.data;
            $scope.bundle.items.push(newItem);
            itemMaintenance($scope.bundle);
            _.defer(function () {
                $('.bln-sub-publisheditem:last-of-type .bln-input-smallform-quote').focus();
            });

        }).finally(function () {
            $scope.loading.new_quote = false;
        });
    };

});
;app.controller('FeedController', function($scope, $analytics, Auth, Restangular, $rootScope, $document, $timeout) {

    Auth.user()
        .then(function(user) {
            $scope.user = user;
        });

});
;app.controller('IntroController', function($scope, $state, $analytics, Auth, Restangular, $rootScope, $document, $timeout, Bundles) {

    $rootScope.stateTransition.time = 350;
    $scope.featured = [];
    $scope.fullGallery = false;
    $scope.user = false;
    $scope.beta_invites_remaining = 'a couple';
    $scope.itemsLimit = 5;

    $scope.showMoreLazyload = function(addedAmount) {

        $scope.itemsLimit = $scope.itemsLimit + addedAmount;
        var page = page || 1;
        var bundlesBase = Restangular.all('bundles');
        bundlesBase.all('featured_popular').getList({page: page, limit: 10}).then(function(response, amount) {
            if ( $scope.itemsLimit < 20 ) {
                $scope.featured = response.data.slice(0, $scope.itemsLimit);
            } else {
                // change content of the button to: sdlkf
            }
        });

    }

    Auth.user()
        .then(function (user) {
            $scope.user = user;
        });
    
    $scope.logInWithTwitter = function() {
        Auth.login()
            .then(function(user) {
                if (user.hasRole('beta')) {
                    $state.go('app.home.feed.popular');
                }
            });
    };

    $scope.playvideo = false;
    $scope.video_played = false;
    $scope.playVideo = function() {
        $scope.video_played = true;
        $scope.playvideo = true;
        var toElement = angular.element(document.querySelector('#introvideo'));
        $document.scrollTo(toElement, 150, 1000);
    };

    $scope.stopVideo = function() {
        $scope.playvideo = false;
    };

    Bundles.getFeaturedPopularBundles().then(function (bundles) {
        $scope.featured = bundles;
    });

    Restangular.one('beta_invites_remaining').get().then(function(response) {
        if(response.data.amount > 0) {
            $scope.beta_invites_remaining = response.data.amount;
        }
    });

});
;app.controller('ViewBundleController', function($scope, $rootScope, $state, $stateParams, $q, $location, Auth, Restangular, SEO, $timeout, $document, $filter, $location, error, Bundles) {

    var RELATED_BUNDLES_COUNT = 20;

    $rootScope.stateTransition.time = 1000;
    $scope.bundle = false;
    $scope.isCollected = false;
    $scope.followsAuthor = false;
    $scope.absoluteUrl = $location.absUrl().replace(/https?:\/\//, '');
    $scope.user = false;
    $scope.login = Auth.login;
    $scope.loading = {
        page: true
    };

    var jumpToItem = $state.current.extraParams.jumpToItem || false,
        jumpedToItem = false;

    var bundleBase = Restangular.one('bundles', $stateParams.bundleId);

    // Bundle call
    bundleBase
        .get()
        .then(function (response) {
            var bundle = response.data;
            handleBundle(bundle);

            Auth.user()
                .then(function (user) {
                    $scope.user = user;
                    handleBundleUserRelations(bundle, user);
                });
        }, function () {
            error.status(404);
        })
        .finally(function () {
            $scope.loading.page = false;
        });


    // Handle bundle
    var handleBundle = function(bundle) {
        if(!bundle) return;
        
        var tags = bundle.tags || [];
        var title;
        var description;
        if(bundle.title) {
            title = bundle.title + ' on Bundlin.com. The beauty of the web bundled.';
        } else {
            title = 'Bundle by ' + bundle.author.name + ' on Bundlin';
        }
        if(bundle.description) {
            description = bundle.description ;
        } else {
            description = 'A bundle created by '+ bundle.author.name + ' on Bundlin.com.';
        }

        var seoTags = tags.slice();
        seoTags.push(bundle.author.name);
        seoTags = seoTags.concat(['Bundlin', 'Bundle']);

        SEO.set('keywords', seoTags.join(', '));
        SEO.set('author', bundle.author.name);
        SEO.set('robots', 'index,follow');

        SEO.set('opengraph', {
            'type': 'article',
            'url': $location.protocol() + '://' + $location.host() + '/' + bundle._sid,
            'site_name': 'Bundlin',
            'image': bundle.picture.original
        });

        SEO.set('twitter', {
            'card': 'summary_large_image',
            'site': '@bundlin',
            'image': bundle.picture.original,
            'creator': '@' + bundle.author.username
        });

        SEO.setForAll(title, description);

        bundle.archivedItems = _.filter(bundle.items, function(item) {
            return !item.active;
        });

        bundle.items = _.filter(bundle.items, function(item) {
            return item.active;
        });

        fillRelatedBundles(bundle);

        $scope.bundle = bundle;

        if(jumpToItem && !jumpedToItem) {
            jumpedToItem = true;
            $timeout(function() {
                var toElement = angular.element(document.querySelector('.itemid-' + jumpToItem));
                $document.scrollTo(toElement, 20, 1000);
                toElement.addClass('highlight');
            }, 1000);
        }
    };

    // Fill related bundles with all bundles
    var fillRelatedBundles = function(bundle) {
        bundle.related_bundles = bundle.related_bundles || [];
        var extraBundlesNeeded = RELATED_BUNDLES_COUNT - bundle.related_bundles.length;
        if(extraBundlesNeeded > 0) {

            // If extra bundles are needed
            var bundlesPromise = Restangular.all('bundles').getList();
            bundlesPromise.then(function(response) {
                var extraBundles = [];

                // Call to all bundles
                _.each(Restangular.stripRestangular(response.data), function(extraBundle) {

                    var originalBundle = bundle.original_bundle || false;

                    // Bundle match checks
                    var isCurrentBundle = extraBundle._id === bundle._id,
                        isOriginalBundle = !originalBundle ? false : extraBundle._id === bundle.original_bundle._id,
                        existInRebundles = _.find(bundle.rebundles, {_id: extraBundle._id}),
                        existInRelatedBundles = _.find(bundle.related_bundles, {_id: extraBundle._id}),
                        isProfileBundle = extraBundle._sid < 13000,
                        isErrorBundle = extraBundle._sid === 404;

                    if(!isCurrentBundle && !isOriginalBundle && !existInRebundles && !existInRelatedBundles && !isErrorBundle && !isProfileBundle) {

                        // Add to related bundles
                        bundle.related_bundles.push(extraBundle);
                    }
                });
            });
        }
    };

    function handleBundleUserRelations(bundle, user) {
        if(!bundle || !user) return;
        
        _.each(bundle.collectors, function(collector) {
            if (collector._id == user._id) {
                $scope.isCollected = true;
            }
        });

        _.each(bundle.author.followers, function(follower) {
            if (follower == user._id) {
                $scope.followsAuthor = true;
            }
        });
    }

    $scope.switchFollow = function() {
        $scope.followsAuthor ? $scope.unfollow() : $scope.follow();
    };

    $scope.follow = function() {
        Restangular
            .one('users', $scope.bundle.author._id)
            .customPOST({}, 'follow')
            .then(function(response) {
                $scope.followsAuthor = true;
            });
    };

    $scope.unfollow = function() {
        Restangular
            .one('users', $scope.bundle.author._id)
            .customDELETE('follow')
            .then(function(response) {
                $scope.followsAuthor = false;
            });
    };

    $scope.switchCollect = function() {
        $scope.isCollected ? $scope.uncollect() : $scope.collect();
    };

    $scope.collect = function() {
        Restangular
            .one('bundles', $stateParams.bundleId)
            .customPOST({}, 'collect')
            .then(function(response) {
                $scope.isCollected = true;
                $scope.bundle.collectors.push($scope.user);
            });
    };

    $scope.uncollect = function() {
        Restangular
            .one('bundles', $stateParams.bundleId)
            .customDELETE('collect')
            .then(function(response) {
                _.each($scope.bundle.collectors, function(collector, index) {
                    if (collector._id == $scope.user._id) {
                        $scope.bundle.collectors.splice(index, 1);
                        $scope.isCollected = false;
                    }
                });
            });
    };

    // $scope.rebundle = function() {
    //     Restangular.one('bundles', $stateParams.bundleId).customPOST({}, 'rebundle').then(function(response) {
    //         var newBundle = response.data;
    //         $state.go('app.edit_bundle', { 'bundleId': newBundle._sid });
    //     });
    // };

    $scope.shareWithTwitter = function() {
        if ($scope.bundle) {
            var settings = {
                'height': 420,
                'width': 550,
                'left': (window.innerWidth - 550) / 2,
                'top': 150,
                'toolbar': 0,
                'status': 0
            };

            var settingsString = Object.keys(settings).map(function(key) {
                return key + '=' + settings[key];
            }).join(',');

            var shareText = '' + $scope.bundle.title + ' by @' + $scope.bundle.author.username + ' ' + $location.absUrl() + ' #bundlin',
                shareString = encodeURIComponent(shareText);

            var popup = window.open('https://twitter.com/intent/tweet?text=' + shareString, 'Share', settingsString);

            if (window.focus) {
                popup.focus();
            }
        }
    };

    $scope.shareWithLinkedin = function() {
        if ($scope.bundle) {
            var settings = {
                'height': 420,
                'width': 550,
                'left': (window.innerWidth - 550) / 2,
                'top': 150,
                'toolbar': 0,
                'status': 0
            };

            var settingsString = Object.keys(settings).map(function(key) {
                return key + '=' + settings[key];
            }).join(',');

            var popup = window.open('https://www.linkedin.com/shareArticle?url=' + $location.absUrl() + '&title=Bundlin: ' + $scope.bundle.title + '&summary=' + $scope.bundle.description, 'Share', settingsString);

            if (window.focus) {
                popup.focus();
            }
        }
    };

    $scope.createBundle = function() {
        Bundles.createBundle().then(function(bundle) {
            $state.go('app.edit_bundle', {
                bundleId: bundle._sid
            });
        })
    }

});
;app.controller('ViewProfileController', function($rootScope, $scope, $state, Restangular, Auth, $timeout, SEO, $location) {

    $scope.profile = undefined;
    $scope.user = {};
    $scope.profileScreenName = $state.params.profileScreenName;
    $scope.login = Auth.login;
    $scope.followsAuthor = false;

    Auth.user()
        .then(function (user) {
            $scope.user = user;
        });

    $scope.switchFollow = function() {
        $scope.followsAuthor ? $scope.unfollow() : $scope.follow();
    };

    $scope.follow = function() {
        Restangular
            .one('users', $scope.profile._id)
            .customPOST({}, 'follow')
            .then(function(response) {
                $scope.followsAuthor = true;
                $scope.user.follows.push($scope.profile._id);
                Auth.updateLocal({
                    follows: $scope.user.follows
                });
                _.defer(function () { $scope.$apply(); });
            });
    };

    $scope.unfollow = function() {
        Restangular
            .one('users', $scope.profile._id)
            .customDELETE('follow')
            .then(function(response) {
                $scope.followsAuthor = false;
                var currentFollowerIndex = $scope.user.follows.indexOf($scope.profile._id);
                if(currentFollowerIndex > -1) {
                    $scope.user.follows.splice(currentFollowerIndex, 1);
                    Auth.updateLocal({
                        follows: $scope.user.follows
                    });
                }
                _.defer(function () { $scope.$apply(); });
            });
    };

    function initializeProfile() {
        Restangular
            .one('users', $scope.profileScreenName)
            .get()
            .then(function(user) {
                var profile = user.data;

                // Make user's website url valid to link to from the app
                if(profile.website){
                    if (profile.website.indexOf('http://') !== 0 && profile.website.indexOf('https://') !== 0) {
                        profile.website_url = 'http://' + profile.website;
                    } else {
                        profile.website_url = profile.website;
                    }
                }

                Auth.user().then(function (currentUser) {
                    if(currentUser._id !== user._id) {
                        $scope.followsAuthor = (currentUser.follows.indexOf(profile._id) > -1);
                    }
                });

                // Replace url and Twitter handle occurrences in bio with actual links
                // Commented out because of not using AUtolink yet
                //profile.bio = Autolinker.link(user.data.bio, {
                //    hashtag: 'twitter'
                //});

                $scope.profile = profile;

                //SEO.set('title', profile.name + ' on Bundlin');
                //SEO.set('description', profile.bio);
                SEO.set('author', profile.name);

                SEO.set('opengraph', {
                    'type': 'profile',
                    'title': profile.name + ' on Bundlin',
                    'url': $location.protocol() + '://' + $location.host() + '/profile/' + profile.username,
                    'image': profile.picture.original
                });

                SEO.set('twitter', {
                    'card': 'summary_large_image',
                    'site': '@bundlin',
                    'title': profile.name + ' on Bundlin',
                    'description': profile.bio,
                    'image': profile.picture.original,
                    'creator': '@' + profile.username
                });

                _.defer(function () { $scope.$apply(); });
            }, function(response) {
                if(response.status == 404) {
                    $state.go('app.error', {
                        bundleId: 404
                    });
                }
            });
    }

    initializeProfile();
    var updateListener = $rootScope.$on('bln:profileUpdated', function(event, data){
        if(data.username === $scope.profile.username){
            initializeProfile();
        }
    });

    $scope.$on('$destroy', function(){
        updateListener();
    })
});
;app.directive('videoStatus', function() {
    return {
        restrict: 'AE',
        scope: {
            videoStatus: '='
        },
        link: function(scope, elm, attrs) {
            var player = elm;
            var url = window.location.protocol + player.attr('src').split('?')[0];

            scope.$watch('videoStatus', function(status) {
                if(status) {
                    controlPlayer('seekTo', '0');
                    controlPlayer('play');
                } else {
                    controlPlayer('pause');
                }
            });
            
            // Helper function for sending a message to the player
            var controlPlayer = function(action, value) {
                player[0].contentWindow.postMessage({
                    method: action,
                    value: value
                }, url);
            }
        }
    };
});;app.directive('autoHorizontalScroll', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var mobile = $window.outerWidth < 480;
            // debounced the callback, can only be callen once every 500ms
            var debouncedCallback = _.debounce(function(){
                scope.$apply(attrs['scrollEndCallback'], element);
                scrollEnd = false;
            }, 500, true);

            // remember scrolloffset;
            var oldScrollOffsetLeft = 0;

            // mousewheel handler
            var mouseWheelHandler = function mouseWheelHandler(e){
                // console.log(e)
                var scrollLeft = element[0].scrollLeft;
                var scrollEnd = ((element[0].offsetWidth + scrollLeft) > element[0].scrollWidth - 800);
                var scrollDirection = oldScrollOffsetLeft < scrollLeft ? 'right' : 'left'
                oldScrollOffsetLeft = scrollLeft + 10;

                // callback if scrollend is reached and the scrolldirection is right
                if(scrollEnd && scrollDirection === 'right') {
                    debouncedCallback();
                }
                if(e.type === 'mousewheel'){
                    this.scrollLeft -= e.originalEvent.wheelDeltaY;
                    if(!e.originalEvent.wheelDeltaX){
                        e.preventDefault();
                    }
                } else {
                    e.preventDefault();
                    this.scrollLeft += (e.originalEvent.detail * 5);
                }
            };
            
            var oldScrollOffsetTop = 0;
            var scrollBottomHandler = function scrollBottomHandler(e){
                var scrollTop = element[0].scrollTop;
                var scrollEnd = ((element[0].offsetHeight + scrollTop) > element[0].scrollHeight - 800);
                var scrollDirection = oldScrollOffsetTop < scrollTop ? 'down' : 'up'
                oldScrollOffsetTop = scrollTop + 10;

                // callback if scrollend is reached and the scrolldirection is down
                if(scrollEnd && scrollDirection === 'down') {
                    debouncedCallback();
                }
            };

            if(!mobile){
                element.on('mousewheel DOMMouseScroll', mouseWheelHandler);
            } else {
                element.on('scroll', scrollBottomHandler);
            }





            scope.$on('$destroy', function(){
                element.off('mousewheel', mouseWheelHandler);
                element.off('scroll', scrollBottomHandler);
            });
        }
    }
});;app.directive('bundleItem', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            item: '=item',
            bundle: '=bundle',
            classes: '@classes',
            take: '@take',
            types: '@types',
            template: '@template'
        },
        template: '<div ng-include="getTemplateUrl()"></div>',
        link: function($scope, $element, $attrs) {
            $timeout(function() {
                $scope.getTemplateUrl = function() {
                    if (! _.isEmpty($scope.item)) {
                        $element.addClass($scope.item.type);

                        var file = '/views/partials/bundle/' + $scope.template + '/items/' + $scope.item.type;

                        var allTypes = [];

                        if ($scope.types) {
                            _.each($scope.types.split(','), function(type) {
                                var typeParts = type.split('=');
                                var typeName = typeParts[0];
                                var typeValue = typeParts[1];
                                allTypes[typeName] = typeValue;
                            });

                            if ($scope.item.type in allTypes) {
                                file += '-' + allTypes[$scope.item.type];
                            }
                        }

                        return file + '.html?v=' + BLN_BUILD_TIMESTAMP;
                    }

                    return false;
                };
            }, 0);
        }
    };
});
;app.directive('bundleItemProperty', function($timeout, Restangular) {
    return {
        restrict: 'A',
        scope: {
            bundle: '=bundle',
            item: '=item',
            property: '@property'
        },
        link: function($scope, $element, $attrs) {
            $scope.updated = true;
            $scope.updatedCount = 0;

            var timeoutPromise = true;

            $scope.$watch('item.fields.' + $scope.property, function(field) {
                $scope.updated = false;
                $scope.updatedCount++;

                if ($scope.updatedCount > 1) {
                    if (! $scope.updated) {
                        $timeout.cancel(timeoutPromise);
                    }

                    timeoutPromise = $timeout(function() {
                        var data = {};
                        data.fields = {};
                        data.fields[$scope.property] = field;
                        Restangular.one('bundles', $scope.bundle._sid).one('items', $scope.item._sid).patch(data).then(function() {
                            $scope.updated = true;
                        });
                    }, 1000)
                }
            });
        }
    };
});
;app.directive('bundleProperty', function(Restangular) {
    return {
        restrict: 'A',
        scope: {
            bundle: '=bundle',
            property: '@property'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('bundle', function(bundle) {
                $element.val($scope.bundle[$scope.property]);
            });

            var blurWatcher = function() {
                var data = {};
                data[$scope.property] = $element.val();
                Restangular.one('bundles', $scope.bundle._sid).patch(data);
            };

            $element.on('blur', blurWatcher);

            $scope.$on('$destroy', function() {
                $element.off('blur', blurWatcher);
            });
        }
    };
});
;app.directive('carousel', function ($timeout) {
  return {
    restrict: 'AE',
    link: function(scope, elm, attrs) {
      elm.addClass('bln-carousel');
      var list, items, width;
      scope.current = 0;

      scope.calc = function() {
        list = angular.element(elm.find('list')[0]);
        items = angular.element(list.find('item'));
        width = items[0].offsetWidth;
      };

      scope.to = function(number) {
        scope.current = number < 0 ? items.length - 1 : (number >= items.length ? 0 : number);
        var offset = -1 * width * scope.current;
        items.css({
          '-webkit-transform': 'translate('+offset+'px)',
          '-moz-transform': 'translate('+offset+'px)',
          '-ms-transform': 'translate('+offset+'px)',
          '-o-transform': 'translate('+offset+'px)',
          'transform': 'translate('+offset+'px)'
        });
      };

      scope.prev = function() {
        scope.to(scope.current-1);
      };

      scope.next = function() {
        scope.to(scope.current+1);
      };

      $timeout(function() {
        scope.calc();
        scope.to(scope.current);
      }, 0);
    }
  };
});;app.directive('descriptionContent', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            descriptionContent: '=descriptionContent'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('descriptionContent', function(contentSource) {
                if(!contentSource) return;
                var content = angular.copy(contentSource);
                content = cleanUrls(content);
                $element.html(content);
            });

            var cleanUrls = function(content) {
                // find urls
                var urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
                var urls = content.match(urlRegEx);

                // make each found url pretty
                _.each(urls, function(url) {
                    var hostname = new URL(url).hostname;
                    content = content.replace(url, hostname);
                });

                return content;
            };
        }
    };
});
;app.directive('dropdownToggler', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function(e){
                element.toggleClass('bln-tabs-active');
            })
        }
    }
});;app.directive('enableNgAnimate', function($animate) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $animate.enabled(true, elm);
        }
    }
});

;app.directive('expandable', function($compile) {
    return {
        restrict: 'AE',
        link: function(scope, elm, attrs) {
            var jqElm = $(elm);
            var expandJqElm = jqElm.find('.expand');
            var compileJqElm = jqElm.find('.compile');

            scope.expand = function() {
                elm.addClass('expanded');
                expandJqElm.trigger('destroy.dot');
                $compile(compileJqElm)(scope);
            };

            scope.contract = function() {
                elm.removeClass('expanded');
                expandJqElm.trigger('update.dot');
                $compile(compileJqElm)(scope);
            };
        }
    };
});;/*
 * This directive gives the element a fancy intro when it appears in the user viewport
 *
 * Usage: attibute only.
 *  
 *  fancy-intro - to initialize the directive
 *  fancy-intro-delay="0" - to set a delay in milliseconds

 *  The following attributes adds classes to the element:
 *  fancy-intro-effect="false" - you can use your own effect name. following classes will be set: 'fancy-intro-effect' and 'fancy-intro-effect-youreffectname'
 *  fancy-intro-effect-distance="false" - only use with fancy-intro-effect. you can use your own distance name. following classes will be set: 'fancy-intro-effect-distance' and 'fancy-intro-effect-distance-yourdistancename'
 *  fancy-intro-speed="false" - you can use your own speed name. follow classes will be set: 'fancy-intro-speed' and 'fancy-intro-speed-yourspeedname'
 *
 *  You can define the necessary classes in styles/components/fancy-intro.less
 *
 */

app.directive('fancyIntro', function($window, debouncedEvents, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      // Test for unsupported circumstances
      var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
          mobile = $window.innerWidth < 768,
          noSupport = iOS || mobile;

      // Save element as Angular-element and save options
      var delay = noSupport ? 0 : attrs.fancyIntroDelay || 0,
          delay = delay ? parseInt(delay, 10) : 0,
          effect = attrs.fancyIntroEffect || false,
          speed = attrs.fancyIntroSpeed || false,
          offset = attrs.fancyIntroOffset || 0,
          effectDistance = attrs.fancyIntroEffectDistance || false,
          children = attrs.fancyIntroChildren || false,
          childrenDelay = attrs.fancyIntroChildrenDelay || false,
          childrenDelay = childrenDelay ? parseInt(childrenDelay, 10) : 0;

      // Introed
      var introed = false;

      // Get window height on resize
      var windowHeight = 0;
      var saveWindowDimensions = function() {
        windowHeight = $window.innerHeight;
        mobile = $window.innerWidth < 768;
      };
      var resizeEventId = debouncedEvents.onResize(saveWindowDimensions);
      saveWindowDimensions();

      var initializeElement = function(element) {
        // Set the basic class
        element.addClass('fancy-intro');

        // Set the effect classes
        if(effect) {
          element.addClass('fancy-intro-effect fancy-intro-effect-'+effect);
          if(effectDistance) {
          element.addClass('fancy-intro-effect-distance-'+effectDistance);
          }
        }

        // Set the speed classes
        if(speed) {
          element.addClass('fancy-intro-speed fancy-intro-speed-'+speed);
        }
      };

      // Show element with delay
      var showUp = function(element, delay, index) {
        delay = children ? delay + childrenDelay * index : delay;
        $timeout(function() {
          element.addClass('fancy-intro-init');
        }, delay);
      };

      // Init
      var elements = children ? $(elm).find(children) : [elm];
      _.each(elements, function(element) {
        element = angular.element(element);
        initializeElement(element);
      });

      // When scrolled, check if element is in view, then call showUp()
      var scrollHandler = function() {
        if(!introed && (noSupport || (elm[0].getBoundingClientRect().top + parseInt(offset, 0)) <= windowHeight)) {
          _.each(elements, function(element, index) {
            element = angular.element(element);
            showUp(element, delay, index);
          });
          introed = true;
        }
      };

      // Call scrolled() on scroll
      var scrollEventId = debouncedEvents.onScroll(scrollHandler);
      scrollHandler();

      // Event destroy
      scope.$on('$destroy', function () {
        debouncedEvents.off(resizeEventId);
        debouncedEvents.off(scrollEventId);
      });

    }
  };
});;app.directive('fillup', function($timeout, debouncedEvents, $interval, $rootScope) {
  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {

      var jqElm = $(element);
      var jqEndElm = $(jqElm.children('[fillup-element]')[0]);
      var direction = attrs.fillup.length > 0 ? attrs.fillup : 'height';

      var getParts = function() {
        return jqElm.children('[fillup-part]');
      };

      var calculate = function() {
        var width = jqElm.outerWidth();
        var height = jqElm.outerHeight();

        var partWidth = 0;
        var partHeight = 0;
        _.each(parts, function(part) {
          partWidth += $(part).outerWidth();
          partHeight += $(part).outerHeight();
        });

        return {
          'height': height - partHeight,
          'width': width - partWidth
        };
      };

      var applyFilllup = function() {
        if(direction === 'height') {
          jqEndElm.height(0);
          jqEndElm.height(calculate().height);
        } else if (direction === 'width') {
          jqEndElm.width(0);
          jqEndElm.width(calculate().width);
        }
        $rootScope.$broadcast('bundle_edit_details:fillup');
      };

      var resizeEventId = debouncedEvents.onResize(function() {
        $timeout(applyFilllup);
        $timeout(applyFilllup, 100);
      });

      var parts = getParts();
      $timeout(applyFilllup);

      scope.$on('$destroy', function () {
        debouncedEvents.off(resizeEventId);
      });
    }
  };
});;app.directive('focuspicture', function($document, documentProps) {
  return {
    restrict: 'A',
    scope: {
      fx: '@focuspictureX',
      fy: '@focuspictureY'
    },
    link: function(scope, elm, attrs) {

      // Apply function
      var applyFocus = function(x, y) {
        elm.css({
          backgroundPosition: 'top ' + y + '% left ' + x + '%'
        });
      };

      // Watch values
      scope.$watch(function() {
        return scope.fx + ',' + scope.fy;
      }, function() {
        applyFocus(scope.fx, scope.fy);
      }, true);

      // Initial
      applyFocus(scope.fx, scope.fy);

    }
  };
});
;app.directive('focuspoint', function($document, documentProps, debouncedEvents, $timeout, $window, $rootScope) {
  return {
    restrict: 'A',
    scope: {
      fx: '=focuspointX',
      fy: '=focuspointY',
      releaseFunction: '=onFocuspointRelease'
    },
    link: function(scope, elm, attrs) {

      // Get picture element
      var pictureElm = elm.find('figure');

      // Add focuspoint class to elements
      var focuspointElm = angular.element('<div class="bln-focuspoint"></div>');
      elm.append(focuspointElm);

      // standard loading
      elm.addClass('fp-loading');

      // Get container dimensions
      var getContainerDimensions = function() {
        return {
          x: elm[0].getBoundingClientRect().left,
          y: elm[0].getBoundingClientRect().top,
          width: elm[0].offsetWidth,
          height: elm[0].offsetHeight
        };
      };

      // Do the dragging
      var touchDevice = documentProps.isTouch();
      var events = {
        down: touchDevice ? 'touchstart' : 'mousedown',
        move: touchDevice ? 'touchmove' : 'mousemove',
        up: touchDevice ? 'touchend' : 'mouseup',
        hoverstart: touchDevice ? 'touchstart' : 'mouseenter',
        hoverend: touchDevice ? 'touchend' : 'mouseleave'
      };

      var container = getContainerDimensions();
      var offset = 30;
      var startCoords = { x: 0, y: 0 };
      var startFocuspoints = { fx: 0, fy: 0 };
      var dragging = false;

      // Mouse/finger down (start dragging)
      var downHandler = function(event) {
        event.preventDefault();

        // Both touch & mouse
        container = getContainerDimensions();
        if(!event) event = window.event;
        var button = event.which || event.button;
        elm.addClass('fp-dragging');
        dragging = true;
        startCoords = {
          x: event.clientX,
          y: event.clientY
        };
        startFocuspoints = {
          fx: scope.fx,
          fy: scope.fy,
        };

      };
      focuspointElm.on(events.down, downHandler);

       // Drag if enabled
      var moveElm = touchDevice ? focuspointElm : $document;
      moveElm.on(events.move, function(event) {
        if(!dragging) return;
        event.preventDefault();

        scope.fx = bound(startFocuspoints.fx / 100 + ((event.clientX - startCoords.x) / (container.width - offset * 2)), 0, 1) * 100;
        scope.fy = bound(startFocuspoints.fy / 100 + ((event.clientY - startCoords.y) / (container.height - offset * 2)), 0, 1) * 100;

        movePoint();
        movePicture();
      });

       // Mouse/finger up (end of dragging)
      var documentHandler = function() {
        if(!dragging) return;
        event.preventDefault();

        dragging = false;
        elm.removeClass('fp-dragging');
        _.defer(function () { scope.$apply(); });
        if(scope.releaseFunction) scope.releaseFunction(scope.fx, scope.fy);
      };
      $document.on(events.up, documentHandler);

      // Hover
      elm.on(events.hoverstart, function() {
        elm.addClass('fp-hover');
      });
      elm.on(events.hoverend, function() {
        elm.removeClass('fp-hover');
      });

      // Move the point
      var movePoint = function() {
        focuspointElm.css({
          left: (offset / container.width * 100 + scope.fx * (1 - offset / container.width * 2)).toFixed(1) + '%',
          top: (offset / container.height * 100 + scope.fy * (1 - offset / container.height * 2)).toFixed(1) + '%'
        });
      };

      // Move the picture
      var movePicture = function() {
        pictureElm.css({
          backgroundPosition: 'top ' + scope.fy + '% left ' + scope.fx + '%'
        });
      };

      // On window resize
      var resizeEventId = debouncedEvents.onResize(function() {
        container = getContainerDimensions();
        movePoint();
      });

      // On fillup change
      var fillupListener = $rootScope.$on('bundle_edit_details:fillup', function () {
        container = getContainerDimensions();
        movePoint();
      });

      // Boundaries
      var bound = function(val, min, max) {
        return Math.max(min, Math.min(max, val));
      };

      // Validate scope focuspoint
      var validate = function(fx, fy) {
        var x_defined = typeof fx != 'undefined';
        var y_defined = typeof fy != 'undefined';
        var x_in_range = fx >= 0 && fx <= 100;
        var y_in_range = fy >= 0 && fy <= 100;

        return x_defined && y_defined && x_in_range && y_in_range;
      };

      // Reset the coordinates
      var reset = function() {
        elm.removeClass('fp-loading');
        
        return {
          reset: true,
          x: 50,
          y: 50
        };
      };

      // Watch values
      scope.$watch(function() {
        return scope.fx + ',' + scope.fy;
      }, function() {
        // Validate values
        if(!validate(scope.fx, scope.fy)) {
          var def = reset();
          scope.freset = def.reset;
          scope.fx = def.x;
          scope.fy = def.y;
        } else if(scope.freset) {
          scope.freset = false;
        } else {
          elm.removeClass('fp-loading');
        }

        movePoint();
        movePicture();
      }, true);

      // Apply positions for first time
      movePoint();
      movePicture();

      // Destroy events on scope destroy
      scope.$on('$destroy', function () {
        focuspointElm.off(events.down, downHandler);
        $document.off(events.up, documentHandler);
        debouncedEvents.off(resizeEventId);
        fillupListener();
      });
    }
  };
});;app.directive('getHeightOfContentitem', function(debouncedEvents) {
	return {
		restrict: 'AE',
		scope: {
			getHeightOfContentitemClass: '@',
			getHeightOfContentitemWatch: '@'
		},
		link: function(scope, elm, attrs) {
			if(!scope.getHeightOfContentitemClass) return;
			var className = scope.getHeightOfContentitemClass;

			var run = function() {
				var targetElm = $(elm).find('.' + className);
				elm.css({'height': targetElm.height() + 'px'});
				
				// re-run after a delay
				setTimeout(run, 300);
			};

			scope.$watch('getHeightOfContentitemWatch', run);
			var resizeEventId = debouncedEvents.onResize(run);

			// Destroy events on scope destroy
			scope.$on('$destroy', function () {
				debouncedEvents.off(resizeEventId);
			});
			
			elm.on('$destroy', function(){
			    scope.$destroy();
			});
		}
	};
});;app.directive('googlemaps', function() {

  var key = 'AIzaSyDpZYfosiwZ62qxOaa86CvlOC8_bmUgCdg';

  return {
    restrict: 'AE',
    scope: {
      latitude: "@",
      longitude: "@",
      zoom: "@",
      name: "@",
      mode: "@",
      streetviewAvailability: "=setStreetviewAvailabilityTo"
    },
    link: function(scope, elm, attrs) {

      var map, panorama, marker, location;

      scope.$watch(function() {
        return scope.latitude + scope.longitude;
      }, function() {
        location = new google.maps.LatLng(scope.latitude, scope.longitude);
        checkStreetViewAvailability(location);
      });

      // Create an array of styles.
      var styles = [{"featureType":"landscape.natural.landcover","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#F1FF00 "},{"saturation":-27.4},{"lightness":9.4},{"gamma":1}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed "},{"saturation":-78},{"lightness":67}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"hue":"#ffffff "},{"saturation":-100},{"lightness":100}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4 "},{"saturation":-93},{"lightness":31}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"hue":"#ffffff "},{"saturation":-100},{"lightness":100}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"},{"hue":"#e9ebed "},{"saturation":-90},{"lightness":-8}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#e9ebed "},{"saturation":10},{"lightness":69}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"},{"hue":"#2c2e33 "},{"saturation":7},{"lightness":19}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"},{"hue":"#bbc0c4 "},{"saturation":-93},{"lightness":31}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"simplified"},{"hue":"#bbc0c4 "},{"saturation":-93},{"lightness":-2}]},{"featureType":"administrative.locality","elementType":"labels","stylers":[{"hue":"#32b38c"}]}];
      var styledMap = new google.maps.StyledMapType(styles, { name: "Map" });

      var enableMapsMode = function() {
        // Initialize map
        map = new google.maps.Map(elm[0], {
          center: location,
          zoom: 10, // parseInt(scope.zoom, 10)
          panControl: true,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: false,
          scrollwheel: false,
          overviewMapControl: false,
          mapTypeControlOptions: {
            mapTypeIds: []
          }
        });

        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');

        // Place marker
        marker = new google.maps.Marker({
          position: location,
          map: map
        });
      };

      var enableStreetViewMode = function() {
        // Initialize streetview
        panorama = new google.maps.StreetViewPanorama(elm[0], {
          position: location
        });
        panorama.setVisible(true);

        // Calculate heading
        var service = new google.maps.StreetViewService;
        service.getPanoramaByLocation(panorama.getPosition(), 50, function(panoData, status) {
          if(status !== 'OK') {
            scope.streetviewAvailability = false;
          }
          if (panoData !== null) {
            var panoCenter = panoData.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(panoCenter, location);
            var pov = panorama.getPov();
            pov.heading = heading;
            panorama.setPov(pov);
          }
        });

        // Place marker
        marker = new google.maps.Marker({
          position: location,
          map: panorama
        });
      };

      var switchMode = function(mode) {
        if(mode === 'street') {
          enableStreetViewMode();
        } else {
          enableMapsMode();
        }
      };

      scope.$watch('mode', function(newVal) {
        switchMode(newVal);
      });

      switchMode(scope.mode);

      var checkStreetViewAvailability = function(location) {
        if(!scope.streetviewAvailability) return;

        location = location || false;
        if(!location) return;

        var service = new google.maps.StreetViewService;
        service.getPanoramaByLocation(location, 50, function(panoData, status) {
          scope.streetviewAvailability = (status === 'OK');
        });
      };

    }
  };
});
;app.directive('modalAskEmail', function (Auth) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {

            scope.setCloseDelay(500);

            /***********************************************************************************************/
            /* Email form */
            /***********************************************************************************************/
            scope.emailAddress = '';
            scope.emailAddressValid = false;
            scope.$watch('emailAddress', function () {
                var emailregex = /(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+ |\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\ ".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z |(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/;
                scope.emailAddressValid = emailregex.test(scope.emailAddress);
            });
            scope.submitEmailForm = function ($event) {
                $event.preventDefault();

                if(scope.emailAddressValid) {
                    Auth.update({ email: scope.emailAddress }).then(function () {
                        scope.close();
                    });
                } else {
                    alert('This emailaddress is invalid');
                }

                return false;
            };


            /***********************************************************************************************/
            /* Video */
            /***********************************************************************************************/
            scope.videoIsPlaying = false;
            scope.videoPlayed = false;

            scope.playVideo = function() {
                scope.videoPlayed = true;
                scope.videoIsPlaying = true;
                var toElement = angular.element(document.querySelector('#modalaskemailvideo'));
                elm.parent().scrollTo(toElement, 150, 1000);
            };

            scope.stopVideo = function() {
                scope.videoIsPlaying = false;
            };

        }
    };
});;app.directive('modalCustomArticleImage', function (Auth, Restangular, debouncedEvents) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            
            scope.setCloseDelay(500);
            scope.loading = {
                suggestions: false
            };

            var form = elm.find('#imageForm');

            /***********************************************************************************************/
            /* Current chosen picture */
            /***********************************************************************************************/
            scope.picture = {
                type: 'none',
                data: {}
            };

            scope.unsetPicture = function () {
                scope.picture.type = 'none';
                scope.picture.data = {};
                form[0].reset();
            };

            /***********************************************************************************************/
            /* Close modal if screen is small than 990 */
            /***********************************************************************************************/
            var previousWidth = window.innerWidth;
            var resizeEventid = debouncedEvents.onResize(function () {
                if(window.innerWidth < 990 && previousWidth >= 990) {
                    scope.close();
                }
            });
            scope.$on('$destroy', function () {
                debouncedEvents.off(resizeEventid);
            });

            /***********************************************************************************************/
            /* Suggestions */
            /***********************************************************************************************/
            scope.suggestions = [];
            scope.loading.suggestions = true;
            Restangular
                .one('bundles', scope.data.bundle._sid)
                .one('items', scope.data.item._sid)
                .customGET('suggestimages')
                .then(function (response) {
                    scope.suggestions = response.data.slice(0, 8);
                })
                .finally(function () {
                    scope.loading.suggestions = false;
                });

            scope.setPictureBySuggestion = function (suggestion) {
                scope.picture.type = 'suggestion';
                scope.picture.data = {
                    url: suggestion.imageUrl
                };
                _.defer(function () { scope.$apply(); });
            };

            /***********************************************************************************************/
            /* Upload */
            /***********************************************************************************************/
            var imageFileInput = elm.find('#imageFileUploadButton');
            imageFileInput.on('change', function (event) {
                scope.picture.data = {};
                var file = event.target.files[0];

                if(!file) {
                    scope.imageBase64Valid = false;
                } else {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        var contents = event.target.result;
                        if(file.type.indexOf('image') === -1) {
                            scope.imageBase64Valid = false;
                        } else {
                            scope.imageBase64Valid = true;
                            scope.imageBase64 = contents;
                            scope.setPictureByUpload(file);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });

            scope.imageBase64Valid = false;
            scope.imageBase64 = '';
            scope.setPictureByUpload = function (file) {
                scope.picture.type = 'upload';
                scope.picture.data = {
                    base64: scope.imageBase64,
                    file: file
                };
                _.defer(function () { scope.$apply(); });
            };

            /***********************************************************************************************/
            /* Custom URL */
            /***********************************************************************************************/
            scope.imageURLValid = false;
            scope.imageURL = '';
            scope.setPictureByUrl = function () {
                scope.picture.type = 'url';
                scope.picture.data = {
                    url: scope.imageURL
                };
                _.defer(function () { scope.$apply(); });
            };

            var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            scope.$watch('imageURL', function (url) {
                scope.imageURLValid = urlRegex.test(url);
            });

        }
    };
});;app.directive('ngWidth', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var applyWidth = function(width) {
        elm.css("cssText", "width: " + width + " !important;");
      };

      applyWidth(attrs.ngWidth);
      attrs.$observe('ngWidth', function(value) {
        applyWidth(value);
      }, true);
    }
  };
});;app.directive('notifications', function(Auth, userProfile) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            scope.user = false;
            
            Auth.user() // pass true to force refresh
                .then(function(user) {
                    scope.user = user;
                });
            scope.$on('$destroy', function(){
                userProfile.markNotificationsAsRead();
                Auth.user(true); // pass true to force refresh

            })
        }
    }
});
;app.directive('overflown', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            // Check which element we should watch for overflow
            var altElm = attrs.overflownElement || false;
            element = altElm ? $(element).find(altElm)[0] : $(element)[0];

            var checkOverflown = function() {
                scope.overflown = {
                    horizontal: element.scrollWidth > element.clientWidth,
                    vertical: element.scrollHeight > element.clientHeight
                };
            };

            // Check on content change
            scope.$watch(function() {
                return '-' + element.scrollWidth + element.clientWidth + element.scrollHeight + element.clientHeight;
            }, checkOverflown);

            // Initial check
            checkOverflown();
        }
    };
});;app.directive('partial', function($http, $templateCache, $compile, $state, Auth) {
	return {
		restrict: 'AE',
		scope: {
			name: '@',
			scope: '='
		},
		link: function(scope, elm, attrs) {
			$http.get('/views/partials/' + scope.name + '.html?v='+BLN_BUILD_TIMESTAMP, { cache: $templateCache }).then(function(response) {
                var newScope = scope.$new();
                newScope.state = $state;
                newScope.user = {};
                mergedScope = _.merge(newScope, scope.scope);
                var newElement = $compile(response.data)(mergedScope);
                elm.replaceWith(angular.element(newElement));
                
                Auth.user()
                    .then(function (user) {
                        if(!newElement) return;
                        var elmScope = newElement.scope();
                        if(!elmScope) return;
                        elmScope.user = user;
                    });
            });
		}
	};
});;// /*
//  *
//  * This directive creates a infinite moving photoroll
//  *
//  * Usage: element or attibute.
//  * Just create a list and put the elements in a horizontal row with display:inline-block.
//  * This directive should be the container of the elements
//  *
//  *  photoroll - initialize the directive
//  *  photoroll-speed="40" - pixels the photoroll travels in a second
//  *
//  */

// app.directive('photoRoll', function(debouncedEvents) {
//     return {
//         link: function($scope, $element, $attrs) {
//             // Save the original elements
//             var items = $element.find('li');
//             var originalItems = items.clone();

//             // Prepare PhotoRoll properties
//             var speed = $attrs.photoRollSpeed || 40;
            
//             // resize event id
//             var resizeEventId;

//             // PhotoRoll object
//             var PhotoRoll = function(originalItems, speed) {
//                 var stop = true;
//                 var rollWidth = 0;
//                 var currentOffset = 0;

//                 var getRollWidthAndPrepare = function() {
//                     // Reset HTML content
//                     $element.html('').append(originalItems);

//                     // Calculate widths
//                     var viewWidth = $element[0].offsetWidth;
//                     var localRollWidth = 0;
//                     _(originalItems).each(function(item) {
//                         localRollWidth += item.offsetWidth;
//                     });

//                     // Make necessary copies
//                     if (localRollWidth > 100) {
//                         var necessaryCopies = Math.ceil(viewWidth / localRollWidth * 2);
//                         for (var i = 0; i < necessaryCopies; i++) {
//                             var clone = $element.html();
//                             $element.append(clone);
//                         }
//                     }

//                     rollWidth = localRollWidth;
//                     return localRollWidth;
//                 };

//                 var step = function() {
//                     requestAnimationFrame(step);

//                     var stepLength = speed / 60;
//                     var transformArguments = 'translate3d(-' + Math.round(currentOffset) + 'px, 0, 0)';

//                     $element.css({
//                         '-webkit-transform': transformArguments,
//                         '-moz-transform': transformArguments,
//                         '-ms-transform': transformArguments,
//                         '-o-transform': transformArguments,
//                         'transform': transformArguments
//                     });

//                     if (currentOffset < rollWidth) {
//                         currentOffset += stepLength;
//                     } else {
//                         getRollWidthAndPrepare();
//                         currentOffset = stepLength;
//                     }
//                 };

//                 resizeEventId = debouncedEvents.onResize(getRollWidthAndPrepare, 100);
//                 step();

//                 return this;
//             };

//             // Initialize the movement
//             var photoroll = new PhotoRoll(originalItems, speed);

//             $scope.$on('$destroy', function () {
//                 debouncedEvents.off(resizeEventId);
//             });
//         }
//     };
// });
;app.directive('reloadOnResize', function(debouncedEvents) {
  return {
    restrict: 'A',
    scope: {
      src: '@ngSrc'
    },
    link: function(scope, elm, attrs) {
      if(elm[0].tagName != 'IFRAME') return;

      var src = scope.src;

      scope.$watch('src', function(newSrc) {
        src = newSrc;
        reloadIframe();
      });

      var resizeEventId = debouncedEvents.onResize(function() {
        reloadIframe();
      });

      var debounceTimer;
      var reloadIframe = function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
          elm[0].src = src;
        }, 100);
      };

      reloadIframe();

      scope.$on('$destroy', function () {
        debouncedEvents.off(resizeEventId);
      });

      elm.on('$destroy', function(){
          scope.$destroy();
      });
    }
  };
});;app.directive('scrollButtons', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var scrollElement = element.find('[scrolling-element]');
            var scrollDistance = scrollElement.width();

            scope.scrollRight = function scrollRight(e){
                scrollElement.animate({scrollLeft: '+=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
            };

            scope.scrollLeft = function scrollLeft(e){
                scrollElement.animate({scrollLeft: '-=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
            };
        }
    }
});;app.directive('scrollButtonsIe', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
            if(msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
                scope.ie = true;
                var scrollElement = element;
                var scrollDistance = scrollElement.width();

                scope.scrollRight = function scrollRight(e){
                    scrollElement.animate({scrollLeft: '+=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
                };

                scope.scrollLeft = function scrollLeft(e){
                    scrollElement.animate({scrollLeft: '-=' + (scrollDistance * 0.8)}, 500, $.bez([0.74, 0.14, 0.28, 0.9]));
                };
            } else {
                scope.ie = false;
            }
        }
    }
});;app.directive('scrollStatus', function(debouncedEvents, $timeout) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, elm, attrs) {
            // Check which element we should watch for scroll events
            var altElm = attrs.scrollStatusElement || false;
            elm = altElm ? $(elm).find(altElm)[0] : $(elm)[0];

            // Fire check-function on scroll
            var scrollEventId = debouncedEvents.on(elm, 'scroll', function() {
                scope.scrollStatus = getScrollStatus();
            }, 15);

            // Check on content change
            scope.$watch(function() {
                return '-' + elm.scrollWidth + elm.clientWidth + elm.scrollHeight + elm.clientHeight;
            }, function() {
                scope.scrollStatus = getScrollStatus();
            });

            // Check-function
            var getScrollStatus = function() {
                var boundTreshold = 40;
                return {
                    horizontal: {
                        view: elm.clientWidth,
                        content: elm.scrollWidth,
                        scroll: {
                            position: elm.scrollLeft,
                            left: elm.scrollLeft <= boundTreshold,
                            right: elm.scrollLeft >= elm.scrollWidth - elm.clientWidth - boundTreshold
                        }
                    },
                    vertical: {
                        view: elm.clientHeight,
                        content: elm.scrollHeight,
                        scroll: {
                            position: elm.scrollTop,
                            top: elm.scrollTop <= boundTreshold,
                            bottom: elm.scrollTop >= elm.scrollHeight - elm.clientHeight - boundTreshold
                        }
                    }
                };
            };

            // Initial check
            scope.scrollStatus = getScrollStatus();

            // Destroy scope
            scope.$on('$destroy', function () {
                debouncedEvents.off(scrollEventId);
            });
        }
    };
});;/*
 * This directive lets the browser scroll to another point on the website
 *
 * Usage: attibute only.
 *
 *  scroll-to - specify the selector of the destination element here. the directive will add a touchend/click event
 *
 */

app.directive('scrollTo', function($document, scrollToggler) {
    return {
        restrict: 'AE',
        link: function($scope, $element, $attrs) {
            var offset = $attrs.scrollToOffset || 0;
            offset = parseInt(offset, 10);
            var time = $attrs.scrollToSpeed || 1000;

            var clickHandler = function clickHandler () {
                if (scrollToggler.status || typeof $attrs.scrollToForce !== 'undefined') {
                    var toSelector = $attrs.scrollTo;

                    if (toSelector.length > 0) {
                        var toElement = $(toSelector);
                        if(toElement && toElement.length) {
                            _.defer(function () {
                                $document.scrollTo(toElement, offset, time);
                            });
                        }

                    }
                }
            };

            $element.on('click', clickHandler);

            $scope.$on('$destroy', function () {
                $element.off('click', clickHandler);
            });

        }
    };
});
;/*
 * This directive sets the height of the element to the height of the window (also on window-resize)
 *
 * Usage: attibute only.
 *
 *  set-window - possible options: width/height/min-width/min-height (default is height)
 *  set-window-percentage - percentage (0, 50, 100, etc)
 *
 */

app.directive('setWindow', function($window, debouncedEvents) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var cssprop = attrs.setWindow || 'height',
                percentage = attrs.setWindowPercentage || 100,
                percentagePlus = attrs.setWindowPercentagePlus || 0;

            // Function to assign window height to the element
            var set = function() {                
                var prop = cssprop.indexOf('height') >= 0 ? 'innerHeight' : cssprop.indexOf('width') >= 0 ? 'innerWidth' : false;
                if(prop) {
                    element.css(cssprop, ($window[prop] * parseInt(percentage, 10) / 100 + parseInt(percentagePlus, 10)) + 'px');
                }
            };

            // Every time the user stops resizing the window
            var resizeEventId = debouncedEvents.onResize(set, 100);

            // Once
            set();

            scope.$on('$destroy', function () {
                debouncedEvents.off(resizeEventId);
            });
        }
    };
});
;app.directive('settings', function(userProfile, Auth, sideextensions, $rootScope) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            var currentState = 'profile',
                expanded = true;

            scope.userProfile = undefined;
            scope.inputErrors = {};
            scope.expand = function(state){
                element.find('.bln-state-open').removeClass('bln-state-open');
                element.find('.' + state).addClass('bln-state-open');
            }

            var formError = function formError(formElm, key, errorMessage){
                scope.inputErrors[key] = errorMessage;
                formElm.addClass('bln-state-error');
            }

            var formSuccess = function formError(formElm, key){
                scope.inputErrors[key] = '';
                formElm.removeClass('bln-state-error');
            }

            var patchData = function patchData(formElm, value, key) {
                var patchData = {};
                patchData[key] = value;
                userProfile.update(patchData).then(function () {
                    formSuccess(formElm, key);
                }, function(err) {
                    var errMessage = err.data.message;
                    if(err.status !== 400 || !errMessage) {
                        errMessage = 'Whoops, something went wrong with this'
                    }
                    if(err && err.data) {
                        formError(formElm, key, errMessage);
                    }
                });
            }

            scope.submitProfile = function(value, key, $event) {
                var formElm = angular.element($event.target);

                patchData(formElm, value, key);

                /*if(key === 'spiritgif'){
                    $.ajax({
                        type: "HEAD",
                        async: true,
                        url: value,
                        success: function(message,text,response){
                            var contentType = response.getResponseHeader('Content-Type');
                            if(contentType === 'image/gif'){
                                patchData(formElm, value, key);
                            } else {
                                scope.$apply(function(){formError(formElm, key, 'The image has to be a .gif');});
                            }
                        },
                        error: function(){
                            scope.$apply(function(){formError(formElm, key, 'The image has to be a .gif');});
                        }
                    });
                } else {
                    patchData(formElm, value, key);
                }*/
            }

            scope.refreshAvatar = function () {
                userProfile.refreshAvatar();
            };

            scope.logout = function() {
                Auth.logout().then(function () {
                    sideextensions.disableAll();
                }, function (){

                });
            };
            Auth.user()
                .then(function(user) {
                    scope.userProfile = user;

                });

            scope.$on('$destroy', function(){
                $rootScope.$broadcast('bln:profileUpdated', {username:scope.userProfile.username});
            });
        }
    }
});;/*
 * Only show this element on top/bottom of page. This is disabled on ios, because Safari on touch-devices pauses Javascript while scrolling.
 *
 * Usage: attibute only.
 *
 *  show-at="false" - can be top/bottom
 *
 */

app.directive("showAt", function($window, debouncedEvents, documentProps) {
    return {
        restrict: 'AE',
        link: function($scope, $element, $attrs) {
            // Test for iOS
            var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

            // Disable on iOS if set
            if (iOS && typeof $attrs.showAtIos != "undefined") {
                return false;
            }

            // Set hide class name
            var hideClass = 'bln-invisible';

            // Set bln-invisible classes based on top/bottom
            var scrolled = function() {
                if ($attrs.showAt === "top" && $window.pageYOffset <= 200) {
                    $element.removeClass(hideClass);
                } else if ($attrs.showAt === "bottom" && $window.pageYOffset >= documentProps.getHeight() - $window.innerHeight - 100) {
                    $element.removeClass(hideClass);
                } else {
                    $element.addClass(hideClass);
                }
            };

            // Call scrolled() on pageload and debounced scroll
            var scrollEventId = debouncedEvents.onScroll(scrolled);
            scrolled();

            // Destroy
            $scope.$on('$destroy', function () {
                debouncedEvents.off(scrollEventId);
            });
        }
    };
});
;app.directive('sideExtensionToggle', function(sideextensions, $document, $rootScope) {
    return {
        restrict: 'AE',
        link: function($scope, $element, $attrs) {
            $scope.sideextensions = sideextensions;
            var name = $attrs.sideExtensionToggle || false;

            var clickHandler = function clickHandler () {
                _.defer(function () {
                    $scope.$apply(function () {
                        sideextensions.all[name].toggle();
                    });
                });
            };

            $element.on('click', clickHandler);

            $scope.$on('$destroy', function () {
                $element.off('click', clickHandler);
            });
        }
    };
});
;app.directive('sidebar', function($rootScope, sideextensions, Auth, $state) {
    return {
        restrict: 'AE',
        replace: true,
        templateUrl: '/views/partials/sidebar.html?v=' + BLN_BUILD_TIMESTAMP,
        link: function (scope) {

            scope.user = false;
            scope.$state = $state;

            Auth.user()
                .then(function(user) {
                    scope.user = user;
                });

            /***********************************************************************************************/
            /* Login function */
            /***********************************************************************************************/
            scope.login = function login () {
                $rootScope.$broadcast('closeSidebarPlease');

                Auth.login()
                    .then(function(user) {
                        if (user.hasRole('beta')) {
                            $state.go('app.home.feed.popular');
                        }
                    });
            };

            /***********************************************************************************************/
            /* Side extensions */
            /***********************************************************************************************/
            scope.menuStates = {
                notifications: false,
                settings: false,
            };

            var sideExtensionChangeDestroyer = $rootScope.$on('sideExtensionChange', function () {
                scope.menuStates.notifications = sideextensions.all['notificationsMenu'].state;
                scope.menuStates.settings = sideextensions.all['settingsMenu'].state;
            });
            
            scope.disableSideextensions = sideextensions.disableAll;

            scope.$on('$destroy', function () {
                sideExtensionChangeDestroyer();
            });
        }
    };
});;app.directive('sidebarState', function($rootScope, $state, $timeout, scrollToggler, $document, helpers, debouncedEvents, sideextensions, Bundles) {
    return {
        restrict: 'A',
        link: function sidebarStateLink (scope, $elm, attrs) {

            var DISABLED_MOBILE_STATES = [
                'app.home.intro'
            ];

            // Document click handler
            var documentClickHandler = function ($event) {
                if(helpers.checkIfElementIsBelow($event.target, '.bln-sidebarcontainer, .bln-sideextension')) return;
                scope.disableSidebar();
                _.defer(function () { scope.$apply(); });
            };

            // State
            scope.sidebarIsActive = false;

            // Enable / disable
            scope.disableSidebar = function disableSidebar () {
                scrollToggler.enable();
                scope.sidebarIsActive = false;
                $document.off('click', documentClickHandler);
            };
            scope.enableSidebar = function enableSidebar () {
                scope.sidebarIsActive = true;
                scrollToggler.disable();
                $document.on('click', documentClickHandler);
            };

            // Toggle
            scope.toggleSidebar = function toggleSidebar () {
                scope.sidebarIsActive ? scope.disableSidebar() : scope.enableSidebar();
            };

            scope.createBundle = function() {
                Bundles.createBundle().then(function(bundle) {
                    $state.go('app.edit_bundle', {
                        bundleId: bundle._sid
                    });
                })
            }

            // Auto toggle on window resize
            var previousWidth = window.innerWidth;
            var resizeEventId = debouncedEvents.onResize(function () {
                if(previousWidth < 768 && window.innerWidth >= 768) {
                    scope.disableSidebar();
                }
                previousWidth = window.innerWidth;
            });

            // Add 'top' class on top
            var scrollEventId = debouncedEvents.onScroll(function () {
                scope.onTop = window.scrollY <= 0;
            });

            // Check disabled mobile states
            var checkDisabledMobileStates = function checkDisabledMobileStates () {
                scope.disableMobileSidebar = false;
                _.each(DISABLED_MOBILE_STATES, function (stateName) {
                    if($state.includes(stateName)) {
                        scope.disableMobileSidebar = true;
                        return;
                    }
                });
                
                if(scope.disableMobileSidebar) scope.disableSidebar();
            };

            // Listen to disableSidebarPlease event
            var closeSidebarPleaseDestroyer = $rootScope.$on('closeSidebarPlease', scope.disableSidebar);
            var openSidebarPleaseDestroyer = $rootScope.$on('openSidebarPlease', scope.enableSidebar);
            var stateChangeSuccessDestroyer = $rootScope.$on('$stateChangeSuccess', checkDisabledMobileStates);
            $timeout(checkDisabledMobileStates);
            checkDisabledMobileStates();

            // Destroy
            scope.$on('$destroy', function () {
                closeSidebarPleaseDestroyer();
                openSidebarPleaseDestroyer();
                stateChangeSuccessDestroyer();
                debouncedEvents.off(resizeEventId);
                debouncedEvents.off(scrollEventId);
                $document.off('click', documentClickHandler);
            });

        }
    };
});;app.directive('sideExtension', function(debouncedEvents, sideextensions) {
    return {
        restrict: 'AE',
        scope: true,
        link: function($scope, $element, $attrs) {
            var name = $attrs.sideExtension || false;
            $scope.sideextension = sideextensions.register(name);
        }
    };
});
;app.directive('sideextensionState', function($rootScope, $document, helpers, sideextensions) {
    return {
        restrict: 'A',
        link: function sidebarStateLink (scope, $elm, attrs) {

            // Close specific sideextension
            scope.closeSideExtension = function closeSideExtension (name) {
                sideextensions.all[name].close();
            };

            // Document click handler
            var documentClickHandler = function ($event) {
                if(helpers.checkIfElementIsBelow($event.target, '.bln-sidebarcontainer, .bln-sideextension')) return;
                sideextensions.disableAll();
                _.defer(function () { scope.$apply(); });
            };

            // State
            $rootScope.$on('sideExtensionChange', function (event, state) {
                scope.sideextensionIsActive = state;
                if(state) {
                    $document.on('click', documentClickHandler);
                } else {
                    $document.off('click', documentClickHandler);
                }
            });

            // Disable on scope destroy
            scope.$on('$destroy', function () {
                $document.off('click', documentClickHandler);
            });

        }
    };
});;//TODO: shouldn't this be a filter?
app.directive('simplifyWebsite', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            websiteUrl: '=content'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('websiteUrl', function(websiteUrl) {
                
                var content = angular.copy(websiteUrl);

                if(typeof $scope.websiteUrl === 'string') {
                    content = content.replace('http://www.', '').replace('https://www.', '').replace('http://', '').replace('https://', ''); // remove protocol and www.
                    content = content.split('?')[0]; // remove '?' and everything after it
                    while(content[content.length - 1] === '/') { // remove trailing slash(es)
                        content = content.substring(0, content.length - 1);
                    }
                    content = content.charAt(0).toUpperCase() + content.slice(1); // capitalize
                }

                $element.html(content);

            });
        }
    };
});
;app.directive('snapOnScroll', function(debouncedEvents, $document) {
    return {
        scope: {
            snapOnScrollEnabled: '='
        },
        link: function(scope, elm, attrs) {
            // init vars
            var enabled = scope.snapOnScrollEnabled || scope.snapOnScrollEnabled === 'undefined' || false,
                treshold = attrs.snapOnScrollTreshold || false,
                scrollElementSelector = attrs.snapOnScrollElement || false,
                scrollElement = scrollElementSelector ? $(elm).find(scrollElementSelector) : elm,
                snapped = false,
                inRange = false;

            // on element scroll
            var elementScrollEventId = debouncedEvents.on(scrollElement, 'scroll', function() {
                if(snapped || (treshold && !inRange) || !enabled) return;
                snapped = true;

                // oh snap
                $document.scrollTo(elm, 0, 100);
            }, 20);

            // on page scroll
            var documentScrollEventId = debouncedEvents.onScroll(function() {
                // prevent snap if element is not in range
                if(treshold) {
                    var elmOffset = Math.abs(elm[0].getBoundingClientRect().top);
                    inRange = elmOffset <= treshold;
                }

                // Reset snapped when out of range
                if(!inRange) snapped = false;
            }, 20);

            scope.$on('$destroy', function () {
                debouncedEvents.off(elementScrollEventId);
                debouncedEvents.off(documentScrollEventId);
            })
        }
    };
});
;app.directive('spinner', function() {
  var opts = {
    lines: 15, // The number of lines to draw
    length: 0, // The length of each line
    width: 2, // The line thickness
    radius: 15, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 24, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1.2, // Rounds per second
    trail: 70, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };

  return {
    restrict: 'EA',
    link: function(scope, elm, attrs) {
      // Retrieve settings
      var type = attrs.type || false;
      var color = attrs.color || false;
      var options = opts;
      var target = elm[0];

      // Apply classes
      elm.addClass('bln-spinner');
      if(type) elm.addClass('bln-spinner-'+type);

      // Change options based on settings
      switch(type) {
        case "content":
          options.radius = 8;
          options.width = 2;
          break;
        case "button":
          options.radius = 4;
          options.width = 1;
          break;
        case "row":
          options.radius = 4;
          options.width = 1;
          break;
      }

      // Set color
      if(color === 'invert') {
        options.color = "#fff";
      } else if(color) {
        options.color = color;
      }

      // Apply spinner to target element
      var spinner = new Spinner(options).spin(target);
    }
  };
});;app.directive('stateAnimation', function($rootScope, $timeout, debouncedEvents) {
    return {
        restrict: 'AE',
        scope: {
            enterWatch: '='
        },
        link: function(scope, elm, attrs) {
            var delayTimer;

            var watchStateTransitionDestroy = $rootScope.$watch('stateTransition', function(stateTransition) {
                $timeout.cancel(delayTimer);

                var settings = {
                    enterDelay: attrs.enterDelay || 0,
                    leaveDelay: attrs.leaveDelay || 0,
                    preventIfSame: typeof attrs.preventIfSame !== 'undefined' && attrs.preventIfSame !== 'false',
                    enterWatch: attrs.enterWatch || false
                };

                if(stateTransition.status === 'out') {
                    delayTimer = $timeout(function() { elm.removeClass('enter'); }, settings.leaveDelay);
                }

                if(settings.enterWatch) {
                    scope.$watch('enterWatch', function(enter) {
                        enter ? elm.addClass('enter') : elm.removeClass('enter');
                    });
                } else {
                    if(stateTransition.status === 'in') {
                        delayTimer = $timeout(function() { elm.addClass('enter'); }, settings.enterDelay);
                    }
                }

                // Prevent if fromState and toState are the same
                if (settings.preventIfSame && stateTransition.same) {
                    elm.addClass('prevent');
                } else {
                    elm.removeClass('prevent');
                }

            }, true);

            scope.$on('$destroy', function () {
                watchStateTransitionDestroy();
            });
        }
    };
});;app.directive('switch', function() {
    return {
        restrict: 'AE',
        scope: true,
        link: function($scope, $element, $attrs) {
            // Get varnames
            var varNames = $attrs.vars.split(',');
            var toggle = typeof $attrs.toggle != 'undefined' && $attrs.toggle != 'false';
            var defaultVarName = $attrs.default;
            $scope.switches = {};

            // Reset function
            $scope.reset = function(varNames) {
                _.each(varNames, function(varName) {
                    $scope.switches[varName] = false;
                });
            };

            // Switch function
            $scope.switch = function(varName) {
                var prevstate = $scope.switches[varName];
                $scope.reset(varNames);
                $scope.switches[varName] = toggle ? !prevstate : true;
            };

            // Initialize default states
            $scope.reset(varNames);
            $scope.switch(defaultVarName);
        }
    };
});
;app.directive('templateContainer', function($q, $compile, $http, $templateCache, $injector, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            bundle: '=bundle',
            template: '@name'
        },
        link: function($scope, $element, $attrs) {
            $element.addClass('bln-template');
            $scope.$watch('bundle', function(bundle) {
                if(!bundle || !bundle.items || !bundle.items.length) return;

                var algorithm = $injector.get($scope.template.charAt(0).toUpperCase() + $scope.template.slice(1) + 'TemplateAlgorithm');

                var structures = algorithm.run(bundle.items);
                var promises = [];


                _.each(structures, function(structure) {
                    promises.push($http.get('/views/' + structure.structureTemplate, { cache: $templateCache }));
                });

                $q.all(promises).then(function(responses) {

                    var amountOfItemsTaken = 0;
                    
                    $element.html('');

                    _.each(responses, function(response, index) {
                        var takes = structures[index].itemTemplates.length;

                        var newScope = $rootScope.$new(true);
                        newScope.items = bundle.items.slice(amountOfItemsTaken, amountOfItemsTaken + takes);
                        newScope.bundle = bundle;
                        newScope.templates = structures[index].itemTemplates;

                        if (index === 0) newScope.items[0].first = true;

                        amountOfItemsTaken += takes;

                        // Add element to collection
                        var newElement = angular.element(response.data);
                        $compile(newElement)(newScope);
                        $element.append(newElement);
                        
                    });
                });
            }, true);
        }
    };
});
;app.directive('templateItem', function($compile, $http, $templateCache, $state, $rootScope, $location, $sce) {
    return {
        restrict: 'E',
        scope: {
            item: '=item',
            bundle: '=bundle',
            template: '=template',
            classes: '@classes',
            vars: '@vars'
        },
        link: function($scope, $element, $attrs) {
            
            $scope.$watch(function() {

                return $scope.item + $scope.bundle + $scope.template + $scope.classes + $scope.vars;

            }, function() {

                $element.html('');

                if ($scope.item && $scope.template) {
                    $http.get('/views/' + $scope.template, { cache: $templateCache }).then(function(response) {
                        var newScope = $rootScope.$new(true);
                        newScope.item = $scope.item;
                        newScope.bundle = $scope.bundle;
                        newScope.template = {};
                        newScope.state = $state;
                        newScope.trustHtml = $sce.trustAsHtml;
                        if($scope.vars) {
                            var varsToPass = $scope.vars.split(' ');
                            _.each(varsToPass, function(varToPass) {
                                newScope.template[varToPass] = true;
                            });
                        }
                        newScope.goToWebsite = function(url) {
                            window.location.href = url;
                        };
                        newScope.allowed = true;

                        var newElement = angular.element(response.data);
                        if (newScope.item.first) newElement.addClass('bln-bundleitem-first');
                        newElement.addClass($scope.classes);
                        newElement.addClass('itemid-' + $scope.item._sid);
                        
                        $element.append(newElement);

                        $compile($element.contents())(newScope);
                    });
                }

            }, true);
        }
    };
});
;app.directive('templateStructure', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            template: '@file',
            bundle: '=bundle',
            skips: '@skips'
        },
        template: '<div ng-include="templateToLoad"></div>',
        link: function($scope, $element, $attrs) {
            $timeout(function() {
                if (! _.isEmpty($scope.bundle)) {
                    $scope.skips = parseInt($scope.skips);
                    $scope.templateToLoad = $scope.template;
                }
            }, 0);
        }
    };
});
;app.directive('tooltip', function($timeout, $rootScope) {
    return {
        restrict: 'AE',
        scope: {
            angle: '@',
            size: '@',
            state: '@',
            selectSelector: '@'
        },
        link: function(scope, elm, attrs) {
            $timeout(function() {

                // Generate tooltip classes
                scope.angle = scope.angle || 'top';
                scope.size = scope.size || false;

                if (scope.angle) elm.addClass('bln-tooltip-' + scope.angle);
                if (scope.size) elm.addClass('bln-tooltip-' + scope.size);

                // DOM changes on state change
                scope.$watch('state', function(state) {
                    if(state === "true") {
                        elm.addClass('active');
                    } else {
                        elm.removeClass('active');
                    }
                });

            }, 0);
        }
    };
});;app.directive('tooltiptoggle', function(tooltips, $timeout) {
    return {
        restrict: 'A',
        scope: {
            tooltiptoggle: '=',
            tooltiptoggleTemplate: '@',
            tooltiptoggleScope: '=',
            tooltiptoggleAngle: '@',
            tooltiptoggleStyle: '@',
            tooltiptoggleSize: '@',
            tooltiptoggleSelect: '@',
            tooltiptoggleHideIf: '=',
            tooltiptoggleDoIf: '=',
            tooltiptoggleDoAction: '='
        },
        link: function(scope, elm, attrs) {

            // Check for existance
            scope.tooltiptoggleTemplate = scope.tooltiptoggleTemplate || false;
            scope.tooltiptoggleAngle = scope.tooltiptoggleAngle || false;
            scope.tooltiptoggleSelect = scope.tooltiptoggleSelect || false;

            // Tooltip requirements (tooltipTemplate)
            if(!scope.tooltiptoggleTemplate) return false;

            // Register tooltip
            scope.template = 'tooltips/' + scope.tooltiptoggleTemplate;
            var tooltip = tooltips.register({
                template: 'tooltips/' + scope.tooltiptoggleTemplate,
                sourceScope: scope
            });

            // On click
            var clickHandler = function clickHandler () {
                if(attrs.tooltiptoggle.length > 0 && !scope.tooltiptoggle) return;
                
                var jqElm = $(elm);
                tooltip.toggle();
                scope.tooltipActive = tooltip.state;
                tooltip.setPosition({
                    x: jqElm.offset().left,
                    y: jqElm.offset().top,
                    width: jqElm.outerWidth(),
                    height: jqElm.outerHeight()
                });

                if(scope.tooltiptoggleSelect && !Modernizr.touch) {
                    var selectElm = tooltip.find(scope.tooltiptoggleSelect);
                    $timeout(function() {
                        selectElm.select();
                    }, 0);
                }
            }
            elm.on('click', clickHandler);

            // Scope watchers
            scope.$watch(function() {
                return scope.tooltiptoggleDoIf + ' ' + scope.tooltiptoggleHideIf;
            }, function(variable) {
                // Do if
                if(scope.tooltiptoggleDoAction && variable && tooltip.state) {
                    scope.tooltiptoggleDoAction();
                }

                // Hide if variable if true
                if(variable) {
                    tooltip.close();
                }
            });

            // Add toggle class
            elm.addClass('bln-tooltiptoggle');

            scope.$on('$destroy', function () {
                elm.off('click', clickHandler);
                tooltips.unsubscribe(tooltip);
            });
        }
    };
});
;/*
 * Adds the 'touchhover' class on touchend, to use with CSS
 *
 * Usage: attibute only.
 *  
 *  toggle-hover - does the thing
 *
 */

app.directive('touchHover', function() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
            if (! iOS) return false;

            var touchHandler = function touchHandler () {
                $element.toggleClass('touchhover');
            };

            $element.on('touchend', touchHandler);

            $scope.$on('$destroy', function () {
                $element.off('touchend', touchHandler);
            });
        }
    };
});
;app.directive('triggerloading', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            $rootScope.loading.state = true;
            $(elm).load(function() {
                if(elm[0].src) {
                    $rootScope.loading.state = false;
                }
            });
        }
    };
});;// uses jQuery Dotdotdot (http://dotdotdot.frebsite.nl/)
app.directive('truncate', function($timeout, $compile) {
    return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
            var jqElm = $(element);
            
            $timeout(function() {

                jqElm.dotdotdot({
                    watch: true,
                    after: attrs.truncateAfter || null,
                    callback: function() {
                        $compile(jqElm.find('.compile'))(scope);
                    }
                });
                
            });
        }
    };
});;app.directive('twitterBioContent', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            bioContent: '=twitterBioContent',
            bioUrls: '=urls',
            bioUserMentions: '=userMentions'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('bioContent', function(contentSource) {
                var content = angular.copy(contentSource);

                if(typeof $scope.bioUrls === 'object') {
                    _.each($scope.bioUrls, function(urlData) {
                        content = content.replace(urlData.shortened_url, generatePrettyHyperlink(urlData.url));
                    });
                }

                if(typeof $scope.bioUserMentions === 'object') {
                    _.each($scope.bioUserMentions, function(userMentionData) {
                        content = content.replace('@' + userMentionData.username, generateUserHyperlink(userMentionData.username));
                    });
                }

                $element.html(content);
            });

            // Generate pretty <a> from twitter username
            var generateUserHyperlink = function(username) {
                var generatedLink = username;

                // wrap url in <a></a>
                generatedLink = '<a href="http://twitter.com/' + username + '" target="_blank" class="user">@' + username + '</a>';

                return generatedLink;
            };

            // Generate pretty <a> tag from url
            var generatePrettyHyperlink = function(url) {
                var generatedLink = url;

                // make url valid
                if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }

                // strip protocol from url
                generatedLink = generatedLink.replace('http://', '').replace('https://', '');

                // strip url after '?'
                generatedLink = generatedLink.split('?')[0];

                // truncate url after 35 characters
                if(generatedLink.length > 45)
                    generatedLink = generatedLink.substring(0, 45) + '...';

                // wrap url in <a></a>
                generatedLink = '<a href="' + url + '" target="_blank" class="url">' + generatedLink + '</a>';

                return generatedLink;
            };
        }
    };
});
;app.directive('twitterTweetContent', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            tweetContent: '=twitterTweetContent',
            tweetUrls: '=urls',
            tweetMedia: '=media',
            tweetUserMentions: '=userMentions',
            tweetHashtags: '=hashtags'
        },
        link: function($scope, $element, $attrs) {
            $scope.$watch('tweetContent', function(contentSource) {
                var content = angular.copy(contentSource);

                if(typeof $scope.tweetUrls === 'object') {
                    _.each($scope.tweetUrls, function(urlData) {
                        content = content.replace(urlData.shortened_url, generatePrettyHyperlink(urlData.url));
                    }); 
                }

                if(typeof $scope.tweetMedia === 'object') {
                    _.each($scope.tweetMedia, function(mediaData) {
                        if (mediaData.type === 'photo') {
                            content = content.replace(mediaData.shortened_url, '');
                        } else {
                            content = content.replace(mediaData.shortened_url, generatePrettyHyperlink(mediaData.shortened_url))
                        }
                    });
                }

                if(typeof $scope.tweetUserMentions === 'object') {
                    _.each($scope.tweetUserMentions, function(userData) {
                        content = content.replace('@' + userData.username, generateUserHyperlink(userData.username));
                    });
                }

                if(typeof $scope.tweetHashtags === 'object') {
                    _.each($scope.tweetHashtags, function(hashtagData) {
                        content = content.replace('#' + hashtagData, generateHashtagSpan(hashtagData));
                    });
                }

                $element.html(content);
            });

            // Generate pretty <a> tag from url
            var generatePrettyHyperlink = function(url) {
                var generatedLink = url;

                // make url valid
                if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }

                // strip protocol from url
                generatedLink = generatedLink.replace('http://', '').replace('https://', '');

                // strip url after '?'
                generatedLink = generatedLink.split('?')[0];

                // truncate url after 35 characters
                if(generatedLink.length > 45)
                    generatedLink = generatedLink.substring(0, 45) + '...';

                // wrap url in <a></a>
                generatedLink = '<a href="' + url + '" target="_blank" class="url">' + generatedLink + '</a>';

                return generatedLink;
            };

            // Generate pretty <a> from twitter username
            var generateUserHyperlink = function(username) {
                var generatedLink = username;

                // wrap url in <a></a>
                generatedLink = '<a href="http://twitter.com/' + username + '?ref=bundlin" target="_blank" class="user">@' + username + '</a>';

                return generatedLink;
            };

            // Generate pretty <a> from twitter username
            var generateHashtagSpan = function(hashtag) {
                var generatedSpan = hashtag;

                // wrap url in <a></a>
                generatedSpan = '<span class="hashtag">#' + hashtag + '</span>';

                return generatedSpan;

            };
        }
    };
});
;/**
 * @ngdoc filter
 * @name bundleItemLink
 * @param {string} bundle_sid - the _sid value of the bundle
 * @param {string} item_sid - the _sid value of the item inside the bundle
 * @description
 *     constructs a url for a specific bundle item
 * @example
 *     {{ bundle._sid | bundleItemLink:item._sid }}
 */
app.filter('addRefToUrl', function() {
    return function(url) {
        if(url) {
            if(url.indexOf('?') > -1) {
                return url.replace('?','?ref=bundlin&')
            } else {
                return url += '?ref=bundlin';
            }
        } else {
            return url;
        }
    };
})
    .filter('trustedUrl', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);;/**
 * @ngdoc filter
 * @name bundleItemLink
 * @param {string} bundle_sid - the _sid value of the bundle
 * @param {string} item_sid - the _sid value of the item inside the bundle
 * @description
 *     constructs a url for a specific bundle item
 * @example
 *     {{ bundle._sid | bundleItemLink:item._sid }}
 */
app.filter('bundleItemLink', function(Restangular) {
    return function(bundle_sid, item_sid) {
        if(bundle_sid && item_sid) {
            return Restangular.configuration.baseUrl + '/c/' + bundle_sid + '/' + item_sid;
        } else {
            return bundle_sid;
        }
    };
});;app.filter('bundlinDate', function($filter) {
  return function(input, type) {
    var time = $filter('date')(input, 'HH:mm'),
        date = $filter('date')(input, 'mediumDate');

    switch(type) {
        case 'date':
            return date;
            break;
        case 'time':
            return time;
            break;
        default:
            return time + ' - ' + date;
            break;
    }
  };
});;app.filter('bundlinPlural', function () {
    return function (input) {
        var pluralInput = input;

        if(input[input.length - 1] === 's') {
            input += 'es';
        } else if(input[input.length - 1] === 'y') {
            input = input.substr(0, input.length - 1);
            input += 'ies';
        } else {
            input += 's';
        }

        return input;
    };
});;app.filter('bundlinRaw', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    };
});;app.filter('item', function() {
  return function(items, conditions) {
    return _.filter(items, function(item) {
      var match = false;
      _.each(conditions, function(condition) {
        match = match || eval(condition);
      });
      return match;
    });
  };
});;app.filter('reverse', function() {
    return function(items) {
        if(typeof items !== 'object') return items;
        return items.slice().reverse();
    };
});;app.factory('Auth', function($q, Restangular, $analytics, $interval, $state, modals) {

    var SESSION_CALLS_DEBOUNCE = 50;
    var sessionBase = Restangular.one('session');
    var User = {
        loggedIn: false,
        hasRole: function hasRole (role) {
            if(!this.loggedIn) return false;
            var roles = arguments || [role];
            var matches = _.intersection(roles, this.roles);
            return matches.length > 0;
        },
        hasUnreadNotifications: function hasUnreadNotifications(){
            return _.some(this.notifications, {'read': false});
        }
    };
    var defaultUserProperties = Object.keys(User);
    var checkForNewNotificationsIntervalId;
    var NOTIFICATION_CHECK_INTERVAL = 30 * 1000; // 30 seconds

    /***********************************************************************************************/
    /* Auth service API */
    /***********************************************************************************************/
    var Auth = {
        user: function (force) {
            var defer = $q.defer();

            // If User is unknown or force is enabled, perform a session call
            if(!User.loggedIn || force) {

                defersArray.push(defer);
                debouncedSessionCall();

            // Otherwise, directly resolve with current User
            } else {
                defer.resolve(User);
            }

            // Return promise
            return defer.promise;
        },

        login: function () {
            var defer = $q.defer();
            $analytics.eventTrack('System', { category: 'Auth', label: 'Login with Twitter' });

            // Twitter login popup settings
            var settings = {
                'height': 420,
                'width': 550,
                'left': (window.innerWidth - 550) / 2,
                'top': 150,
                'toolbar': 0,
                'status': 0
            };

            // Stringify settings
            var windowSettingsString = Object.keys(settings).map(function(key) {
                return key + '=' + settings[key];
            }).join(',');

            // Open the popup
            var popup = window.open('/api/auth/twitter', 'Bundlin - Login with Twitter', windowSettingsString);

            // Focus the popup
            if (window.focus) popup.focus();

            // Callback function to be executed by popup's JavaScript
            window.doBundlinTwitterLogin = function (userData) {
                popup.close();

                var handle = function (newUser) {
                    mergeUserWith(newUser);
                    User.loggedIn = true;
                    defer.resolve(User);
                    checkUserMail();
                };

                if(userData) {
                    handle(userData);
                } else {
                    Auth.user(true)
                        .then(function (response) {
                            handle(response.data);
                        });
                }
            };

            // Return promise
            return defer.promise;
        },

        logout: function () {

            // Perform call, return promise
            return Restangular.one('auth').one('logout').post().then(function(response) {
                cleanUpUser();
                $state.go('app.home');
            });
        },

        updateLocal: function (data) {
            mergeUserWith(data);
            return User;
        },

        update: function (data) {
            var defer = $q.defer();

            Auth.user().then(function(user) {
                Restangular
                    .one('users', user._id)
                    .patch(data)
                    .then(function (response) {
                        Auth.updateLocal(data);
                        defer.resolve(User);
                    }, function (error) {
                        defer.reject(error);
                    });
            });

            return defer.promise;
        }
    };

    /***********************************************************************************************/
    /* Debounced session call logic */
    /***********************************************************************************************/
    var defersArray = [];
    var sessionCall = function () {
        sessionBase.get().then(function (response) {
            var newUser = response.data;
            mergeUserWith(newUser);
            User.loggedIn = true;
            checkUserMail();
            $interval.cancel(checkForNewNotificationsIntervalId);
            var checkForNewNotificationsIntervalId = $interval(debouncedNotificationsCall, NOTIFICATION_CHECK_INTERVAL);

            _.each(defersArray, function (defer) {
                defer.resolve(User);
            });
            defersArray = [];

        }, function () {
            cleanUpUser();
            _.each(defersArray, function (defer) {
                defer.resolve(User);
            });
            defersArray = [];
        });
    };
    var debouncedSessionCall = _.debounce(sessionCall, SESSION_CALLS_DEBOUNCE);


    /***********************************************************************************************/
    /* Auth helper functions */
    /***********************************************************************************************/
    var mergeUserWith = function mergeUserWith (newUser) {
        _.each(newUser, function (value, key) {
            User[key] = value;
        })
    };

    var cleanUpUser = function cleanUpUser () {
        User.loggedIn = false;
        _.each(User, function (value, key) {
            if(defaultUserProperties.indexOf(key) === -1) {
                delete User[key];
            }
        });
    };

    var checkUserMail = function checkUserMail () {
        if(!User.email && !modals.checkCurrentlyOpen('modal-ask-email')) {
            modals.open('modal-ask-email', { user: User });
        }
    };

    var checkForNewNotifications = function checkForNewNotifications () {
        if(!User.loggedIn) return;

        Restangular
            .one('users', User._id)
            .all('unreadnotifications')
            .getList()
            .then(function (response) {
                var newNotifications = response.data || [];
                User.notifications = _.filter(User.notifications, { read: true } );
                User.notifications = newNotifications.concat(User.notifications);
            });
    };
    var debouncedNotificationsCall = _.debounce(checkForNewNotifications, 500);

    return Auth;

});
;app.factory('Bundles', function($q, Restangular, BundlesHelpers, Auth) {
    var Bundles = {};

    var bundlesBase = Restangular.all('bundles');
    var userBundlesBase = function(username){
        return Restangular.one('users', username);
    }
    var BUNDLE_LOAD_LIMIT = 10;

    Bundles.getLatestBundles = function getLatestBundles(page){
        var defer = $q.defer();
        bundlesBase.getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {

            Auth.user().then(function(user){

                var bundles = BundlesHelpers.markCollected(user, response.data),
                    bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);

                defer.resolve(bundlesWithLoadIndex);
            });

        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    };

    // Bundles.getFeaturedPopularBundles = function getFeaturedPopularBundles(page) {
    //     var defer = $q.defer();
    //     page = page || 1;
    //     bundlesBase.all('featured_popular').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
    //         // defer.resolve(Bundles.showPagedItems(response));
    //         defer.resolve(response);
    //     }, function(error){
    //         defer.reject(error);
    //     });

    //     return defer.promise;
    // }

    Bundles.getFeaturedPopularBundles = function getFeaturedPopularBundles(page) {
        var defer = $q.defer();
        page = page || 1;
        bundlesBase.all('featured_popular').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response, amount) {

            // Get data and show
            var slicedData = Bundles.showPagedItems(response.data, 5);
            defer.resolve(slicedData);

        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    }

    Bundles.showMore = function(data, amount) {

        // check amount of items in the row
        Bundles.showPagedItems()

    }

    Bundles.showPagedItems = function(data, amount) {
        var defer = $q.defer();
        var _data = data;
        // var _dataLength = _data.length;
        var elementAmount =  document.querySelectorAll('.featured-bundles-item').length;
        var _amount = elementAmount + amount;
        var slicedData = _data.slice(0, _amount);

        defer.resolve(slicedData);
        return slicedData;
    }

    Bundles.getPopularBundles = function getPopularBundles(page){
        var defer = $q.defer();
        bundlesBase.all('popular').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {

            Auth.user().then(function(user){

                var bundles = BundlesHelpers.markCollected(user, response.data),
                    bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);

                defer.resolve(bundlesWithLoadIndex);
            });
        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    }

    Bundles.getFollowerBundles = function getFollowerBundles(page){
        var defer = $q.defer();
        bundlesBase.all('following').getList({page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {

            Auth.user().then(function(user){

                var bundles = BundlesHelpers.markCollected(user, response.data),
                    bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);

                defer.resolve(bundlesWithLoadIndex);
            });
        }, function(error){
            defer.reject(error);
        });

        return defer.promise;
    }
    
    Bundles.getUserBundles = function getUserBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).getList('bundles', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundles = BundlesHelpers.markUnpublishedByCurrentUser(response.data),
                bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.getUserCollectedBundles = function getUserCollectedBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).all('bundles').customGETLIST('collects', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(response.data);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.getUserPublishedBundles = function getUserPublishedBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).all('bundles').customGETLIST('published', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(response.data);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.getUserUnpublishedBundles = function getUserUnpublishedBundles(username, page){
        var defer = $q.defer();
        userBundlesBase(username).all('bundles').customGETLIST('unpublished', {page: page, limit: BUNDLE_LOAD_LIMIT}).then(function(response) {
            var bundles = BundlesHelpers.markAllUnpublishedByCurrentUser(response.data),
                bundlesWithLoadIndex = BundlesHelpers.setLoadIndex(bundles);
            defer.resolve(bundlesWithLoadIndex);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    Bundles.createBundle = function createBundle() {
        var defer = $q.defer();
        bundlesBase.post().then(function (response) {
            defer.resolve(response.data)
        }, function (error) {
            defer.reject(error);
        });
        return defer.promise;
    }

    return Bundles;
});;app.factory('BundlesHelpers', function(){
    var BundlesHelpers = {};

    BundlesHelpers.markCollected = function markCollected (user, bundles) {
        return _.map(bundles, function (bundle) {
            // mark as collected
            bundle.collectedByCurrentUser = user.collected_bundles.indexOf(bundle._id) > -1 ? true : false;
            return bundle;
        });
        
    };

    BundlesHelpers.markUnpublishedByCurrentUser = function markCollected (bundles) {
        return _.map(bundles, function (bundle) {
            // mark as unpublished
            bundle.unpublishedByCurrentUser = bundle.published ? false : true;
            return bundle;
        });
        
    };

    BundlesHelpers.markAllUnpublishedByCurrentUser = function markCollected (bundles) {
        return _.map(bundles, function (bundle) {
            // mark as unpublished
            bundle.unpublishedByCurrentUser = true;
            return bundle;
        });
        
    };

    BundlesHelpers.setLoadIndex = function markCollected (bundles) {
        return _.map(bundles, function (bundle, index) {
            // set a load index
            bundle.loadIndex = index;
            return bundle;
        });
        
    };

    return BundlesHelpers;
});;/*
 * This service debounces heavy events like 'scroll' and 'resize'
 *
 * Syntax:
 *  debouncedEvents.on(element, event(s), handler, time);
 *
 * Where time is the debounce milliseconds for the event. Default is 10.
 *
 */

app.service('debouncedEvents', function($window, $rootScope, $timeout) {
    var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

    var bindedEvents = [];

    // Scroll event
    this.onScroll = function(handler, time) {
        return this.onWindow('load scroll', handler, time);
    };

    // Resize event
    this.onResize = function(handler, time) {
        if(iOS) {
            return this.onWindow('load orientationchange', handler, time);
        }

        return this.onWindow('load resize', handler, time);
    };

    // Window event
    this.onWindow = function(eventString, handler, time) {
        return this.on($window, eventString, handler, time);
    };

    // Event
    this.on = function(elm, eventString, callback, time) {
        time = time || 10;
        var timeout = null;

        var handler = function() {
            if (timeout !== null) {
                $timeout.cancel(timeout);
            }

            timeout = $timeout(function() {
                if (typeof callback === "function") {
                    return callback();
                }
            }, time);
        };

        $elm = angular.element(elm);
        $elm.on(eventString, handler);

        var newId = 0;
        if(bindedEvents.length) newId = _.max(bindedEvents, 'id').id + 1;
        bindedEvents.push({
            id: newId,
            elm: $elm,
            eventString: eventString,
            handler: handler
        });

        return newId;
    };

    this.off = function (identifier) {
        var index = _.findIndex(bindedEvents, { id: identifier });
        var bindedEvent = bindedEvents[index];
        bindedEvent.elm.off(bindedEvent.eventString, bindedEvent.handler);
        if (index > -1) bindedEvents.splice(index, 1);
    };

});;app.factory('DefaultTemplateAlgorithm', function() {

    var structureTemplatePath = '/partials/bundle/default/structures';
    var itemTemplatePath = '/partials/bundle/default/items';
    var itemStructure = [];
    var remainingItems = [];
    var position = 1;

    var run = function(items) {
        itemStructure = [];
        position = 1;
        remainingItems = angular.copy(items);

        while (remainingItems.length > 0) {
            if (tryThreeContainer()) continue;
            if (tryTwoContainer()) continue;
            doOneContainer();
        }

        return itemStructure;
    };

    var tryThreeContainer = function() {
        if (notEnoughItems(3) || isPosition(1) || !previousIsNot('two-container') || !previousIsNot('three-container') || !previousIsNot('three-container-alt')) return false;

        if (itemsAreOfTypes(3, ['article', 'quote', 'twitter_tweet']) &&
            tweetsDontContainMedia(3) &&
            !articleMayBeWide(2) &&
            !articleMayBeWide(0) &&
            !(articleMayBeHigh(0) && articleMayBeHigh(1)) &&
            !(articleMayBeHigh(1) && articleMayBeHigh(2))) {

            if(articleMayBeHigh(0)) {
                addTemplate('three-container', [remainingItems[0].type, remainingItems[1].type, remainingItems[2].type]);
                return true;
            } else if(articleMayBeHigh(2)) {
                addTemplate('three-container-alt', [remainingItems[0].type, remainingItems[1].type, remainingItems[2].type]);
                return true;
            }
        }

        return false;
    };

    var tryTwoContainer = function() {
        if (notEnoughItems(2) || isPosition(1) || !previousIsNot('two-container') || !previousIsNot('three-container') || !previousIsNot('three-container-alt')) return false;

        var case1 = isPosition(2) && itemsAreNotOfTypes(1, ['article', 'quote']) && tweetsContainMedia(2) && itemsAreOfTypes(2, ['dribbble_shot', 'vine_video', 'twitter_tweet', 'article', 'quote']);
        var case2 = itemsAreOfTypes(1, ['article']) && !articleMayBeWide(1) && itemsAreOfTypes(1, ['dribbble_shot', 'vine_video', 'twitter_tweet'], 1) && tweetsContainMedia(2);
        var case3 = itemsAreOfTypes(2, ['article', 'quote', 'twitter_tweet']) && tweetsDontContainMedia(2);
        var case4 = case3 && itemsAreOfTypes(1, ['article', 'quote', 'twitter_tweet'], 1) && tweetsDontContainMedia(2) && articleMayBeWide(1);
        var case5 = case3 && itemsAreOfTypes(1, ['article']) && articleMayBeWide(0);
        var case6 = itemsAreOfTypes(2, ['soundcloud', 'dribbble_shot', 'vine_video', 'twitter_tweet', 'twitter_profile', 'article', 'quote']);

        if(case1 || case2 || case3 || case4 || case5 || case6) {
            if(itemsAreOfTypes(2, ['article']) && articleMayBeHigh(0) && articleMayBeHigh(1)) {
                addTemplate('two-container', ['article-high', 'article-high']);
                return true;
            } else {
                addTemplate('two-container', [remainingItems[0].type, remainingItems[1].type]);
                return true;
            }
        }

        return false;
    };

    var doOneContainer = function() {
        if (notEnoughItems(1)) return false;

        if(itemsAreOfTypes(1, ['article']) && !articleMayBeWide(0)) {
            addTemplate('one-container', ['article-figureleft']);
        } else if(itemsAreOfTypes(1, ['article']) && articleMayBeWide(0) && !isPosition(1)) {
            addTemplate('one-container', ['article']);
        } else {
            addTemplate('one-container', [remainingItems[0].type]);
        }

        return true;
    };

    // VALIDATORS

    var notEnoughItems = function(count) {
        return remainingItems.length < count;
    };

    var isPosition = function(requiredPos) {
        return position === requiredPos;
    };

    var previousIsNot = function(structure) {
        var lastStructure = itemStructure[itemStructure.length - 1];

        return structure !== lastStructure.structureName;
    };

    var itemsAreOfTypesInOrder = function(types) {
        var valid = true;

        _.each(types, function(type, index) {
            if (remainingItems[index].type !== type) valid = false;
        });

        return valid;
    };

    var itemsAreOfTypes = function(count, types, offset) {
        var valid = true;
        offset = offset || 0;

        for(var index = offset; index < count; index++) {
            if(types.indexOf(remainingItems[index].type) === -1) valid = false;
        }

        return valid;
    };

    var itemsAreNotOfTypes = function(count, types, offset) {
        var valid = true;
        offset = offset || 0;

        for(var index = offset; index < count; index++) {
            if(types.indexOf(remainingItems[index].type) > -1) valid = false;
        }

        return valid;
    };

    var tweetsContainMedia = function(count) {
        var valid = true;

        for(var index = 0; index < count; index++) {
            if(remainingItems[index].type === 'twitter_tweet' && (!remainingItems[index].fields.media || remainingItems[index].fields.media.length === 0)) valid = false;
        }

        return valid;
    };

    var tweetsDontContainMedia = function(count) {
        var valid = true;

        for(var index = 0; index < count; index++) {
            if(remainingItems[index].type === 'twitter_tweet' && (!remainingItems[index].fields.media || remainingItems[index].fields.media && remainingItems[index].fields.media.length > 0)) valid = false;
        }

        return valid;
    };

    var articleMayBeWide = function(itemIndex) {
        var item = remainingItems[itemIndex];
        var valid = true;
        if (item.type !== 'article' || !item.fields.picture || !item.fields.picture_aspect_ratio) valid = false;
        if (item.fields.picture_aspect_ratio < 1.5 ) valid = false;
        return valid;
    };

    var articleMayBeHigh = function(itemIndex) {
        var item = remainingItems[itemIndex];
        var valid = true;
        if (item.type !== 'article' || !item.fields.picture || !item.fields.picture_aspect_ratio) valid = false;
        if (item.fields.picture_aspect_ratio > 0.8 ) valid = false;
        return valid;
    };

    // HELPERS

    var addTemplate = function(structure, templates) {
        var structureFile = structureTemplatePath + '/' + structure + '.html?v=' + BLN_BUILD_TIMESTAMP;

        var templateFiles = templates.map(function(template) {
            position++;

            return itemTemplatePath + '/' + template + '.html?v=' + BLN_BUILD_TIMESTAMP;
        });

        remainingItems.splice(0, templates.length);

        itemStructure.push({
            structureName: structure,
            structureTemplate: structureFile,
            itemTemplates: templateFiles,
            itemNames: templates
        });
    };

    return {
        'run': run
    };

});
;/*
 * This service returns properties of the browser, document, agent or window
 *
 * Syntax:
 *  documentProps.getHeight();
 *  documentProps.isTouch();
 *
 */

app.service('documentProps', function() {

    this.getHeight = function() {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    };

    this.isTouch = function() {
        return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    };

});
;app.service('error', function($state) {

    //
    this.status = function(status) {
        switch(status) {
            case 404:
                $state.go('app.error', {
                    bundleId: 404
                });
                break;
        }
    };

});;app.factory('fieldWatcher', function($document) {
  var watchers = [];
  var pressedKeys = "";

  $document.on('keypress', function(e) {
    pressedKeys += String.fromCharCode(e.which);
    _.each(watchers, function(watcher) {
      if(pressedKeys.indexOf(watcher.word) != -1) {
        watcher.scope.$apply(watcher.handler);
        pressedKeys = "";
      }
    });
  });

  return function(word, handler, scope) {
    watchers.push({word:word, handler:handler, scope:scope});
  };
});;app.service('helpers', function() {

    this.moveItemThroughArray = function(array, old_index, new_index) {
        if (new_index > array.length + 1 || new_index < 0) return array;
        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
        return array;
    };

    this.checkIfElementIsBelow = function(element, selector) {
        $element = $(element);
        var self = false;
        $(selector).each(function (idx, match) {
            if(!self) {
                self = $element.get(0) === match;
                return;
            }
        });
        var parents = $element.parents(selector);
        return (!! parents.length || self);
    };
});;app.service('modals', function($rootScope, $compile, $q, scrollToggler, $timeout) {

    // find placeholder for all modals
    var modalPlaceholder = $('.bln-modals');

    // store this
    var me = this;

    this.all = [];
    modalPlaceholder.html('');

    // Open a modal
    this.open = function (template, data) {
        var defer = $q.defer();

        var templateName = 'modals/' + template;
        var element = angular.element('<li><partial name="' + templateName + '" scope="partialScope"></partial></li>');
        var modalScope = $rootScope.$new();
        modalScope.partialScope = {};
        modalScope.partialScope.data = data;
        modalScope.partialScope.closeDelay = 0;
        modalScope.partialScope.close = function closeModal (resolveData) {
            modal.element.find('.bln-modalcontainer').addClass('bln-state-leaving');
            $timeout(function () {
                defer.resolve(resolveData);
                modal.element.remove();
                var index = me.all.indexOf(modal);
                if(index > -1) {
                    me.all.splice(index, 1);
                }
                if(me.all.length === 0) {
                    $rootScope.$broadcast('modals:lastmodalcloses');
                }
            }, modal.closeDelay);
        };
        modalScope.partialScope.setCloseDelay = function setCloseDelay (closeDelay) {
            if(typeof closeDelay !== 'number') return 0;
            return modal.closeDelay = closeDelay;
        };

        var modal = {};
        modal.template = template;
        modal.element = $compile(element)(modalScope);
        modal.scope = modal.element.scope();
        modal.closeDelay = 0;

        me.all.push(modal);
        modalPlaceholder.append(modal.element);

        if(me.all.length === 1) {
            $rootScope.$broadcast('modals:firstmodalopens');
        }

        return defer.promise;
    };

    this.checkCurrentlyOpen = function checkCurrentlyOpen (template) {
        return !! _.find(me.all, { template: template });
    };

    // Function to clean up all modals
    this.cleanUp = function cleanUp () {
        _.each(me.all, function (modal) {
            modal.scope.close();
        });
    };

});
;/*
 * This service can freeze the browsers scroll
 *
 * Syntax:
 *  scrollToggler.enable();
 *  scrollToggler.disable();
 *  scrollToggler.toggle();
 *  scrollToggler.status();
 *
 */

app.service('scrollToggler', function() {

    var scrollEnabled = true;
    var body = angular.element(document.querySelector('body'));

    this.enable = function() {
        body.removeClass('no-scroll');
        scrollEnabled = true;
    };

    this.disable = function() {
        body.addClass('no-scroll');
        scrollEnabled = false;
    };

    this.toggle = function() {
        scrollEnabled ? this.disableStatus() : this.enableStatus();
    };

    this.status = scrollEnabled;

});
;app.service('SEO', function($location, $rootScope) {

    var serviceThis = this;

    var defaults = {
        title: 'Bundlin - The beauty of the web, bundled.',
        description: 'Create, discover and share Bundles of links about your favorite subjects. Bundlin is handcrafted by Lifely in Amsterdam.',
        keywords: 'Bundlin, Create, Links, Lifely, Discover, Pim Verlaan, Nick de Bruijn, Bundle, Bundled, Bundling',

        opengraph: {
            'type': 'website',
            'title': 'Bundlin - The beauty of the web, bundled.',
            'description': 'Create, discover and share Bundles of links about your favorite subjects. Bundlin is handcrafted by Lifely in Amsterdam.',
            'url': $location.protocol() + '://' + $location.host(),
            'site_name': 'Bundlin',
            'image': $location.protocol() + '://' + $location.host() + '/images/bundlin.jpg'
        },

        twitter: {
            'card': 'summary',
            'site': '@bundlin',
            'title': 'Bundlin - The beauty of the web, bundled.',
            'description': 'Create, discover and share Bundles of links about your favorite subjects. Bundlin is handcrafted by Lifely in Amsterdam.',
            'image': $location.protocol() + '://' + $location.host() + '/images/bundlin.jpg',
            'url': $location.protocol() + '://' + $location.host()
        }
    };

    $rootScope.SEO = angular.copy(defaults);

    this.set = function(key, settings) {
        $rootScope.SEO[key] = settings;
    };

    this.setForAll = function(title,description) {
        $rootScope.SEO.title = title;
        $rootScope.SEO.opengraph.title = title;
        $rootScope.SEO.twitter.title = title;

        $rootScope.SEO.description = description;
        $rootScope.SEO.opengraph.description = description;
        $rootScope.SEO.twitter.description = description;
    };

    this.reset = function() {
        $rootScope.SEO = angular.copy(defaults);
    };

});
;app.service('sideextensions', function($rootScope, scrollToggler, $timeout) {

    var self = this;

    this.all = {};

    this.register = function(name, defaultstate) {
        var defaultstate = defaultstate || false;
        var destroyer;
        var sideextension = {
            state: false,
            name: name,
            render: false,
            close: function(){
                if(!sideextension.state) return;
                destroyer = $timeout(function(){
                    sideextension.render = false;
                }, 500);
                sideextension.state = false;
                scrollToggler.enable();
                $rootScope.$broadcast('sideExtensionChange', false);
                return true;
            },
            open: function() {
                $timeout.cancel(destroyer);
                sideextension.render = true;
                self.disableAll();
                sideextension.state = true;
                scrollToggler.disable();
                $rootScope.$broadcast('sideExtensionChange', true);
                return true;
            },
            toggle: function() {
                sideextension.state ? sideextension.close() : sideextension.open();
                return true;
            }
        };

        return self.all[name] = sideextension;
    };

    this.disableAll = function() {
        _.each(self.all, function(sideextension) {
            sideextension.close();
        });
    };

});
;app.service('stateTransition', function($timeout, $state, $rootScope, debouncedEvents, $urlRouter) {

    var me = this;

    // State transition handling variables
    var CSS_TRIGGER_ANIMATION_DELAY = 150;
    var transitioned = false;
    var transitioning = false;
    var stateQueue = [];
    var enabled;

    debouncedEvents.onResize(function () {
        enabled = window.innerWidth >= 768;
    });

    var prevent = function (event) {
        event.preventDefault();
        $urlRouter.update(true);
    };

    this.run = function(event, toState, toParams, fromState, fromParams, preCallback, postCallback) {

        preCallback = preCallback || false;
        postCallback = postCallback || false;

        // Return if already transitioned
        if(transitioned) {
            transitioned = false;
            return;
        }

        // Put transition in queue if transition is running
        if(transitioning) {
            stateQueue.push({
                toState: toState,
                toParams: toParams
            });
            prevent(event);
            return;
        }
        
        transitioning = true; // start
        prevent(event);

        $rootScope.stateTransition.same = false;
        if(fromState.name === toState.name) {
            $rootScope.stateTransition.same = true;
        }

        $rootScope.stateTransition.status = 'out'; // (begin fade-out old page) 

        $timeout(function() {
            transitioned = true;
            $rootScope.extraStateParams = toState.extraParams;
            if(postCallback) postCallback();
            $state.go(toState.name, toParams);
            if(preCallback) preCallback();

            $timeout(function() {
                $rootScope.stateTransition.status = 'in'; // (fade-in new page)
                transitioning = false; // end

                // state queue
                var stateQueueItem = stateQueue.shift();
                if(typeof stateQueueItem !== 'undefined') {
                    $rootScope.extraStateParams = stateQueueItem.toState.extraParams;
                    $state.go(stateQueueItem.toState, stateQueueItem.toParams);
                }
            }, enabled ? CSS_TRIGGER_ANIMATION_DELAY : 0);
        }, enabled ? $rootScope.stateTransition.time : 0);

    }
});;app.service('tags', function($q, Restangular) {

    var tagsPromise = Restangular.one('tags');

    this.load = function(query) {
        // should work with this promise
        var deferred = $q.defer();
        tagsPromise.getList('autocomplete', {search:query}).then(function(response){
            deferred.resolve(response.data);
        }, function(){
            deferred.reject();
        });
        
        return deferred.promise;
    };
});;app.service('tooltips', function($rootScope, debouncedEvents, $compile, $document, helpers) {

    // find placeholder for all tooltips
    var tooltipPlaceholder = $('.bln-tooltips');

    // store this
    var me = this;

    this.all = [];
    tooltipPlaceholder.html('');

    // register tooltip
    this.register = function(properties) {
        properties.sourceScope.state = false;

        var element = angular.element('<div class="bln-tooltipcontainer" ng-class="{\'active\': state}" ng-style="{ left: position.x + \'px\', top: position.y + \'px\', width: position.width + \'px\', height: position.height + \'px\' }"><tooltip angle="{{tooltiptoggleAngle}}" state="{{state}}" class="bln-tooltip" style="{{tooltiptoggleStyle}}" size="{{tooltiptoggleSize}}"><ng-include src="\'/views/partials/\' + template + \'.html?v=\' + BLN_BUILD_TIMESTAMP"></ng-include></tooltip></div>');
        var compiledElement = $compile(element)(properties.sourceScope);

        var tooltip = {};
        tooltip.state = false;
        tooltip.element = angular.element(compiledElement);
        tooltip.scope = compiledElement.scope();
        tooltip.open = function() {
            me.disableAll();
            tooltip.state = true;
            tooltip.scope.state = true;
            _.defer(function () { tooltip.scope.$apply(); });
        };
        tooltip.close = function() {
            tooltip.state = false;
            tooltip.scope.state = false;
            _.defer(function () { tooltip.scope.$apply(); });
        };
        tooltip.toggle = function() {
            if (tooltip.state) {
                tooltip.close();
            } else {
                tooltip.open();
            }
        };
        tooltip.setPosition = function(position) {
            tooltip.scope.position = position;
        };
        tooltip.find = function(selector) {
            return $(tooltip.element).find(selector);
        };

        tooltipPlaceholder.append(compiledElement);

        me.all.push(tooltip);
        return tooltip;
    };

    // disable all tooltips: handling
    this.disableAll = function() {
        _.each(me.all, function(tooltip) {
            tooltip.close();
        });
    };

    // disable all tooltips on resize and scroll
    debouncedEvents.onResize(me.disableAll);
    debouncedEvents.onScroll(me.disableAll);

    // disable all tooltips when user clicks next to it
    var documentElement = angular.element(document);
    documentElement.on('mousedown', function($event) {
        var preventClick = false;
        _.each(me.all, function (tooltip) {
            if(helpers.checkIfElementIsBelow($event.target, '.bln-tooltip')) {
                preventClick = true;
            }
        });

        if(!preventClick) me.disableAll();
    });

    this.unsubscribe = function(tooltip) {
        tooltip.element.remove();
        var index = me.all.indexOf(tooltip);
        if (index > -1) {
            me.all.splice(index, 1);
        }
    };

});
;app.service('userProfile', function($q, Auth, Restangular) {

    this.refreshAvatar = function() {
        Auth.user().then(function(user) {
            Restangular
                .one('users', user._id)
                .one('refresh_avatar')
                .customPOST({ userId: user._id })
                .then(function () {
                    Auth.user(true);
                });
        });
    }

    this.markNotificationsAsRead = function() {
        var defer = $q.defer();

        Auth.user().then(function(user) {
            Restangular
                .one('users', user._id)
                .one('mark_notifications_read')
                .customPOST({ userId: user._id });
        });

        return defer.promise;
    }

    this.update = Auth.update;
    
});