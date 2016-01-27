var gulp = require('gulp');
var del = require('del');
var notifier = require('node-notifier');
var sequence = require('run-sequence');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();


/**
 * copy tasks
 */
gulp.task('_copy', function(callback)
{
	gulp.src([
			'src/manifest.json',
			'src/_locales/**/*.json',
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
gulp.task('_scripts', function()
{
	return gulp.src('src/scripts/*.js')
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		.pipe(gulp.dest('app/scripts'));
});

gulp.task('_scripts:dist', function()
{
	return gulp.src('app/scripts/*.js')
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
			json.background.scripts.forEach(function(part, index, theArray)
			{
				var path = part.split("/");

				// do not modify lib files
				if (path[1] != "lib")
				{
					path[1] = path[1].replace(/\.js$/, ".min.js");
					theArray[index] = path.join("/");
				}
			});

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
	// Chrome-Ext. core files
	gulp.watch([
			'src/manifest.json',
			'src/_locales/**/*.json',
			'src/scripts/lib/**/*.js',
			'src/bower_components/bootstrap/dist/fonts/**/*',
			'src/bower_components/jquery/dist/jquery.js',
		], ['_copy']);

	// .html files
 	gulp.watch('src/*.html', ['_html']);

	// .less files
 	gulp.watch('src/styles/**/*.less', ['_styles']);

	// .js files
 	gulp.watch('src/scripts/**/*.js', ['_scripts']);

	// image files
 	gulp.watch('src/images/**/*', ['_images']);

	// LiveReload Server
	$.livereload.listen({
		port: 35729
	});

	// LiveReload watch
	gulp.watch([
			'app/**/*'
		], $.batch(function(events, done)
		{
			$.notify({ message: "reload frontend" });

			$.livereload.reload();

			done();
		})
	);

});

