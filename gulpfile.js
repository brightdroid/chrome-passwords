var gulp = require('gulp');
var del = require('del');
var notifier = require('node-notifier');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();


// copy
gulp.task('_copy', function()
{
	gulp.src([
			'src/manifest.json',
			'src/_locales/**/*.json',
			'src/scripts/lib/**/*.js',
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
});


// html
gulp.task('_html', function()
{
	return gulp.src([
			'src/*.html'
		])
		.pipe($.changed('app'))
		.pipe(gulp.dest('app'));
});


// styles
gulp.task('_styles', function()
{
	return gulp.src([
			'!src/styles/**/_*.less',
			'src/styles/**/*.less'
		])
		.pipe($.less())
		.pipe(gulp.dest('app/styles'))
		/*.pipe($.rename({ suffix: '.min' }))
		.pipe($.cache($.cssnano()))
		.pipe(gulp.dest('app/styles'))*/;
});


// scripts
gulp.task('_scripts', function()
{
	return gulp.src('src/scripts/*.js')
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		.pipe(gulp.dest('app/scripts'))
		/*.pipe($.rename({ suffix: '.min' }))
		.pipe($.uglify())
		.pipe(gulp.dest('dist/scripts'))*/;
});


// images
gulp.task('_images', function()
{
	return gulp.src('src/images/**/*')
		.pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
		.pipe(gulp.dest('app/images'));
});



// clean
gulp.task('clean', function()
{
	del([
		'app/*',
		'!app/bower_components',
		'dist/*'
	]);

	$.cache.clearAll();
});


// dist
gulp.task('app', ['clean'], function()
{
	gulp.start('_copy', '_html', '_styles', '_scripts', '_images');

	notifier.notify({ title: "Gulp", message: 'App Ready!' });
});


// default
gulp.task('default', ['watch']);


// Watch
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

