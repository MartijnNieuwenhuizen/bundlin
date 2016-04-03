// task: uglify
module.exports = {

    // targets
    scripts_project: {
        options: {
            mangle: false,
            beautify: true,
            sourceMap: true,
            compress: {
                drop_console: true
            }
        },
        files: {
            '.grunt-tmp/build/js/app.js': [ '.grunt-tmp/build/js/app.js' ]
        }
    },
    scripts_vendor: {
        options: {
            mangle: false,
            beautify: true,
            sourceMap: true,
            compress: {
                drop_console: true
            }
        },
        files: {
            '.grunt-tmp/build/js/vendor.js': [ '.grunt-tmp/build/js/vendor.js' ]
        }
    }

};
