// task: sass
module.exports = {

    // targets
    styles_project: {
        options: {
            compress: true
        },
        files: {
            '.grunt-tmp/css/app.css': 'src/styles/imports.less'
        }
    }

};
