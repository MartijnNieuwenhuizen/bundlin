app.controller('IntroController', function($scope, $state, $analytics, Auth, Restangular, $rootScope, $document, $timeout, Bundles) {

    $rootScope.stateTransition.time = 350;
    $scope.featured = [];
    $scope.fullGallery = false;
    $scope.user = false;
    $scope.beta_invites_remaining = 'a couple';
    $scope.itemsLimit = 5;
    $scope.video = angular.element(document.querySelector('#introvideo'));
    $scope.videoSrcLink = "http://player.vimeo.com/video/125583287?color=fff&portrait=0&title=0&byline=0&badge=0&autoplay=0&api=1&player_id=introvideo";

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
        $scope.video[0].src = $scope.videoSrcLink;
        $scope.video_played = true;
        $scope.playvideo = true;
        var toElement = $scope.video;
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
