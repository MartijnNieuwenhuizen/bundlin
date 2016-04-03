// task: critical
module.exports = {

	critical: {
        options: {
            base: './',
            css: [
                'build/css/app.css'
            ],
            width: 1280,
            height: 900,
            minify: true
        },
        src: 'build/index.html',
        dest: 'build/css/critical.css'
	}

};