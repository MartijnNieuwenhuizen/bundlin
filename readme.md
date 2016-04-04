# Bundlin

The beauty of the web, bundled.

[![wercker status](https://app.wercker.com/status/6f71ffb1dc1c3ce5488726fa13b88b4e/m "wercker status")](https://app.wercker.com/project/bykey/6f71ffb1dc1c3ce5488726fa13b88b4e)

# API
## Postman

The Postman collection can be found online, you can import it to view the api endpoints.

https://www.getpostman.com/collections/1ff785ca48c3c771a59e

## Documentation

> **Note**: The documentation is currently incomplete, use the postman collection instead.

Generate the api documentation using the following commands:
* `cd server`
* `npm run docs`

You can now find the documentation in the `docs/api` folder of the project root.



# Administration
## Add a User to the Beta
* ssh into the associated server
* `mongo`
* `use bundlin`
* `db.users.update({ 'username': 'PimVerlaan' }, { $set: { 'roles': ['beta'] } })`

# Development
## Common
* `vagrant up`
* `vagrant provision`
* `brew install ansible` (only if ansible is not available on your system yet)
* `cd devops`
* `./devops provision vagrant all`
* be sure to add `33.33.33.103 bundlin.dev` to your /etc/hosts file

> The root directory of the application will be mounted in the VM at /home/deploy/bundlin, use that as your working directory.

## Backend environment setup
* `cd server`
* `npm run fixtures` (if applicable)
* use one of the following commands
	* `./debug .` in the `server` folder.
	* `npm start` (production like)
* connect a debugger
    * setup ssh tunnel: `ssh -L 5858:localhost:5858 root@33.33.33.103`
    * webstorm: run / edit configurations /  + nodejs remote debug / host localhost port 5858, then run debugger with debug icon
    * node-inspector:
        * `ssh -L 8080:localhost:8080 root@33.33.33.103`
        * in vagrant, `npm install -g node-inspector`
        * in vagrant, `node-inspector`
        * on host, visit 127.0.0.1:8080 in browser

## Frontend environment setup
* `cd client`
* `grunt`

# Provisioning
## provisioning a server
* `./devops provision environment all`

## updating encrypted ansible config files
* `./devops edit provision/group_vars/environment.yml`

# Deployment
## Staging
Deployments to the staging environment are done through Wercker.

https://app.wercker.com/#applications/538c47ca3e1f413e380c72a2/tab/deployment.

## Production
Deployments to production can be done using the followings commands:

* `cd devops`
* `./devops command deploy production webdbservers`

Rolling back a release can be done using the following command:

* `./devops command rollback production webdbservers`

# Database management

## Dump
Databases can be backed completely up using the following command:
./devops command database_dump staging dbservers

## Export
Collections in databases can be exported as JSON with the following command:
./devops command database_export staging dbservers

# Monitoring
## New Relic
New Relic is being used to monitor the different environments of the application, as well as all the servers that are provisioned using the provided provision scripts.










# Enhancements && Performance
## Performance
### Start
All the tests are done in a Incognito browser with the Cache desabled and a throttling on a Good 3G connection.

At the start of the project, this are the statistics:

* Requests: 113
* Size: 3.4MB
* Finish: 19.35s
* DOMContentLoaded: 5.65s
* Load: 5.86s

![start of the project](https://github.com/MartijnNieuwenhuizen/bundlin/blob/master/screenshots/start-of-the-project.png"start of the project")

### PhotoRoll
Load less photo's in the photoroll

* Requests: 106
* Size: 3.2MB
* Finish: 18.43s
* DOMContentLoaded: 5.85s
* Load: 5.13s

![load less photos in photo frame](https://github.com/MartijnNieuwenhuizen/bundlin/blob/master/screenshots/load-less-photos-in-photo-frame.png"load less photos in photo frame")

### Less Favicons
Load less Favicons

* Requests: 102
* Size: 3.1MB
* Finish: 17.94s
* DOMContentLoaded: 5.69s
* Load: 5.90s

![load less favicons](https://github.com/MartijnNieuwenhuizen/bundlin/blob/master/screenshots/load-less-favicons.png"load-less-favicons")

### Reduce amount of bundles
* Requests: 82
* Size: 2.4MB
* Finish: 14.02s
* DOMContentLoaded: 5.68s
* Load: 5.91s

![less-bundless](https://github.com/MartijnNieuwenhuizen/bundlin/blob/master/screenshots/less-bundless.png"less-bundless")

**Code**
```
// intro.html
// added the Load More button with a Angular(ng-click) listener
<a class="load-more-button" href="" ng-click='showMoreLazyload(5)'>Load More</a>

// introController.js
// added a new scope to the app
$scope.showMoreLazyload = function(addedAmount) {
    // Adds 5 more items to the list
    $scope.itemsLimit = $scope.itemsLimit + addedAmount;
    var page = page || 1;
    var bundlesBase = Restangular.all('bundles');
    // Make a request for all the Featured Bundles
    bundlesBase.all('featured_popular').getList({page: page, limit: 10}).then(function(response, amount) {
        if ( $scope.itemsLimit < 20 ) {
            // Set the diced data to the older Scope. Angular will automaticly refresh this block.
            $scope.featured = response.data.slice(0, $scope.itemsLimit);
        }
    });

}
```

### The video
The video is loaded on the start of the pageload. This creates 9 unnecessary requests at that point. This video is not visible until the user clicks on the button to look at the video, so this video can be loaded at that point, not at the load of the whole page

* Requests: 73
* Size: 2.3MB
* Finish: 13.28s
* DOMContentLoaded: 5.65s
* Load: 5.84s

![show-video-after-click](https://github.com/MartijnNieuwenhuizen/bundlin/blob/master/screenshots/show-video-after-click.png"show-video-after-click")

**Code** 
```
// Intro.html
// Removed the src

<iframe class="bln-video" webkitallowfullscreen mozallowfullscreen allowfullscreen video-status="playvideo" id="introvideo"></iframe>

// introController.js
// Set src on click

$scope.video = angular.element(document.querySelector('#introvideo'));
$scope.videoSrcLink = "http://player.vimeo.com/video/125583287?color=fff&portrait=0&title=0&byline=0&badge=0&autoplay=0&api=1&player_id=introvideo";

$scope.playVideo = function() {
    $scope.video[0].src = $scope.videoSrcLink;
};

```

### Image Row
The animated imagesroll contains 20 images who arn't combined into a sprite.
After combining them into a sprite, this is the progress.

* Requests: 60
* Size: 1.9MB
* Finish: 11.16s
* DOMContentLoaded: 5.97s
* Load: 5.62s


### Team Foto Sprite
The team consists of 9 people, each with a different photo. After combining the nine avatar pics into a sprite and set them as a background, this are the numbers.

* Requests: 52
* Size: 1.8MB
* Finish: 10.50s
* DOMContentLoaded: 5.94s
* Load: 6.22s

### Critital CSS
Used the grunt plugin grunt-critical-css

* Requests: 52
* Size: 1.8MB
* Finish: 10.42s
* DOMContentLoaded: 5.91s
* Load: 6.13s

### Removed animations
If the page loads, there are a view delay's and animations on the elements above the fold. By removing a part of this animations, the site looks quicker (and loads quicker!).

* Requests: 58
* Size: 1.5MB
* Finish: 8.99s
* DOMContentLoaded: 6.07s
* Load: 6.33s

## Enhancements
### :focus



## Cleaner HTML
### Bundle Tile
Old code
```
<p class="comment">
    <span class="commentheader">
        <a class="author" ui-sref="app.view_profile.bundles({ profileScreenName: bundle.author.username })">
            <img ng-src="{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}" alt="{{ bundle.author.name }}">
            <span class="name">{{ bundle.author.name }}</span>
        </a>
        <a ng-show="bundle.author._id == user._id" ui-sref="app.edit_bundle({ 'bundleId': bundle._sid })" class="bln-editbutton">
            <span class="bln-icon bln-icon-greybutton bln-icon-budicon-56"></span>
        </a>
    </span>
    <span class="description expand" truncate truncate-after="a.bln-readmore">
        {{ bundle.description }}
        <a class="bln-readmore bln-readmore-truncate compile" ng-click="expand()"></a>
    </span>
</p>
```

New code
```
<section class="comment">
    <div class="commentheader">
        <a class="author" ui-sref="app.view_profile.bundles({ profileScreenName: bundle.author.username })">
            <img ng-src="{{ bundle.author.picture.h64 || bundle.author.picture.original || '/images/default.png' }}" alt="{{ bundle.author.name }}">
            <span class="name">{{ bundle.author.name }}</span>
        </a>
        <a ng-show="bundle.author._id == user._id" ui-sref="app.edit_bundle({ 'bundleId': bundle._sid })" class="bln-editbutton">
            <span class="bln-icon bln-icon-greybutton bln-icon-budicon-56"></span>
        </a>
    </div>
    <p class="description expand" truncate truncate-after="a.bln-readmore">
        {{ bundle.description }}
        <a class="bln-readmore bln-readmore-truncate compile" ng-click="expand()"></a>
    </p>
</section>
```

# Further Advice
* Make the HTML More Semantic
* Use a method like BEM to create more consistentsy in your namegiving
* Update Anguler to the latest version this allows you to only import the modules you want to use from Anguler
* Reduce the amount of CSS by making it more generic


# Conclusion
By reducing the amount of content that's immediately loaded if the page is loaded, the loading time is reduced significantly. Tricks, like using a sprite or creating a 'Load More' button instead of loading all 20 items, have helped a lot in this case. 






