var gulp = require('gulp');
var del = require('del');
var notifier = require('node-notifier');
var sequence = require('run-sequence');
var lrFrontend = require('tiny-lr')();
var lrBackend = require('tiny-lr')();
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
// load debug config
require('./src/scripts/_debug/config.js');


/**
 * wrapper for multiple tiny-lr instances
 */
function notifyLivereload(server)
{
	server.changed({
		body: {
			files: ['index.html']
		}
	});
}


/**
 * copy tasks
 */
gulp.task('_copy', function(callback)
{
	gulp.src([
			'src/manifest.json',
			'src/_locales/**/*.json',
			'src/scripts/_debug/*.js',
			'src/scripts/lib/**/*.js',
		], { base: 'src' })
		.pipe($.changed('app'))
		.pipe(gulp.dest('app'));

	gulp.src('src/bower_components/bootstrap/dist/fonts/**/*')
		.pipe($.changed('app/fonts'))
		.pipe(gulp.dest('app/fonts'));

	gulp.src(['src/bower_components/jquery/dist/jquery.js'])
		.pipe($.changed('app/scripts'))
		.pipe(gulp.dest('app/scripts'));

	callback();
});

gulp.task('_copy:dist', function()
{
	return gulp.src([
			'app/fonts/**/*',
			'app/images/**/*',
			'app/_locales/**/*.json',
			'app/scripts/lib/**/*.js',
		], { base: 'app' })
		.pipe(gulp.dest('dist'));
});


/**
 * html tasks
 */
gulp.task('_html', function()
{
	return gulp.src([
			'src/*.html'
		])
		.pipe($.changed('app'))
		.pipe(gulp.dest('app'));
});

gulp.task('_html:dist', function()
{
	return gulp.src([
			'app/*.html'
		])
		// Syntax: https://github.com/dciccale/grunt-processhtml
		.pipe($.processhtml())
		.pipe(gulp.dest('dist'));
});


/**
 * styles task
 */
gulp.task('_styles', function()
{
	return gulp.src([
			'!src/styles/**/_*.less',
			'src/styles/**/*.less'
		])
		.pipe($.less())
		.pipe(gulp.dest('app/styles'))
});

gulp.task('_styles:dist', function()
{
	return gulp.src([
			'app/styles/**/*.css'
		])
		.pipe($.rename({ suffix: '.min' }))
		.pipe($.cssnano())
		.pipe(gulp.dest('dist/styles'));
});


/**
 * script tasks
 */
gulp.task('_scripts', function(callback)
{
	gulp.src('src/scripts/*.js')
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		.pipe(gulp.dest('app/scripts'));

	gulp.src([
			'src/bower_components/bootstrap/js/transition.js',
			'src/bower_components/bootstrap/js/button.js',
			'src/bower_components/bootstrap/js/modal.js',
			'src/bower_components/bootstrap/js/alert.js',
		])
		.pipe($.concat('bootstrap.js'))
		.pipe(gulp.dest('app/scripts'));

	callback();
});

gulp.task('_scripts:dist', function()
{
	return gulp.src([
			'app/scripts/*.js',
			'!app/scripts/_debug/*.js'
		])
		.pipe($.rename({ suffix: '.min' }))
		.pipe($.stripDebug())
		.pipe($.uglify())
		.pipe(gulp.dest('dist/scripts'));
});


/**
 * image task
 */
gulp.task('_images', function()
{
	return gulp.src('src/images/**/*')
		.pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
		.pipe(gulp.dest('app/images'));
});


/**
 * clean task
 */
gulp.task('clean', function(callback)
{
	del([
		'app/*',
		'!app/bower_components',
		'dist/*'
	]);

	$.cache.clearAll();

	callback();
});


/**
 * manifest task
 */
gulp.task('_manifest:dist', function()
{
	return gulp.src('app/manifest.json')
		.pipe($.jsonEditor(function(json)
		{
			// modify background scripts to use minified files
			bgScripts = []
			for (var i=0; i < json.background.scripts.length; i++)
			{
				var file = json.background.scripts[i];

				// omit _debug folder
				if (file.match(/scripts\/_debug\//))
				{
					continue;

				}
				// use minified of everything except in "lib"
				else if (!file.match(/scripts\/lib\//))
				{
					file = file.replace(/\.js$/, ".min.js");
				}

				bgScripts.push(file);
			}
			json.background.scripts = bgScripts;

			// modify content scripts to use minified files
			json.content_scripts[0].js.forEach(function(part, index, theArray)
			{
				theArray[index] = part.replace(/\.js$/, ".min.js");
			});

			return json;
		}))
		.pipe(gulp.dest('dist'));
});


/**
 * create runable "app" folder for debugging
 */
gulp.task('app', function(callback)
{
	sequence(
		'clean',
		['_copy', '_html', '_styles', '_scripts', '_images'],
		callback
	);

	notifier.notify({ title: "Gulp", message: 'App Ready!' });
});


/**
 * create runable "dist" folder for deployment
 */
gulp.task('dist', function(callback)
{
	sequence(
		'app',
		['_copy:dist', '_html:dist', '_styles:dist', '_scripts:dist', '_manifest:dist'],
		callback
	);

	notifier.notify({ title: "Gulp", message: 'Deployment Ready!' });
});


/**
 * create zip build
 */
gulp.task('build', ['dist'], function()
{
	var manifest = require('./dist/manifest'),
		distFileName = manifest.name + ' v' + manifest.version + '.zip';

	return gulp.src(['dist/**'])
		.pipe($.zip(distFileName))
		.pipe(gulp.dest('build'));
});



/**
 * default task: watch
 */
gulp.task('default', ['watch']);


/**
 * watch task
 */
gulp.task('watch', ['app'], function()
{
	// copy task
	gulp.watch([
			'src/manifest.json',
			'src/_locales/**/*.json',
			'src/scripts/_debug/*.js',
			'src/scripts/lib/**/*.js',
			'src/bower_components/bootstrap/dist/fonts/**/*',
			'src/bower_components/jquery/dist/jquery.js',
		], ['_copy']);

	// .html files
 	gulp.watch('src/*.html', ['_html']);

	// .less files
 	gulp.watch('src/styles/**/*.less', ['_styles']);

	// .js files
 	gulp.watch('src/scripts/*.js', ['_scripts']);

	// image files
 	gulp.watch('src/images/**/*', ['_images']);

	// LiveReload Server
	lrFrontend.listen(lrPorts['frontend']);
	lrBackend.listen(lrPorts['backend']);

	// LiveReload backend watch
	gulp.watch([
			'src/manifest.json',
			'src/_locales/**/*.json',
			'src/scripts/background.js',
			'src/scripts/content.js',
		], $.batch(function(events, done)
		{
			$.util.log("Reload backend");

			notifyLivereload(lrBackend);

			done();
		})
	);

	// LiveReload frontend watch
	gulp.watch([
			'app/**/*'
		], $.batch(function(events, done)
		{
			$.util.log("Reload frontend");

			notifyLivereload(lrFrontend);

			done();
		})
	);
});

