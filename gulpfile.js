var gulp = require('gulp');
var del = require('del');
var notifier = require('node-notifier');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();


// copy
gulp.task('_copy', function()
{
	gulp.src([
			'app/*.*',
			'app/_locales/**/*',
			'app/scripts/lib/**/*',
		], { base: 'app' })
		.pipe(gulp.dest('dist'));

	gulp.src(['app/bower_components/bootstrap/dist/fonts/**/*'])
		.pipe(gulp.dest('app/fonts'));

});


// styles
gulp.task('_styles', function()
{
	return gulp.src([
			'!app/styles/**/_*.less',
			'app/styles/**/*.less'
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
	return gulp.src('app/scripts/*.js')
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		/*.pipe(gulp.dest('dist/scripts'))
		.pipe($.rename({ suffix: '.min' }))
		.pipe($.uglify())
		.pipe(gulp.dest('dist/scripts'))*/;
});


// images
gulp.task('_images', function()
{
	return gulp.src('app/images/**/*')
		.pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
		.pipe(gulp.dest('dist/images'));
});



// clean
gulp.task('clean', function()
{
	del([
		'app/styles/**/*.css',
		'dist/*'
	]);

	return $.cache.clearAll();
});


// dist
gulp.task('dist', ['clean'], function()
{
	gulp.start('_copy', '_styles', '_scripts', '_images')
	notifier.notify({ title: "Gulp", message: 'Dist complete' });
});


// default
gulp.task('default', ['watch']);


// Watch
gulp.task('watch', ['dist'], function()
{
	// Watch .less files
 	gulp.watch('app/styles/**/*.less', ['_styles']);

	// Watch .js files
 	gulp.watch('app/scripts/**/*.js', ['_scripts']);

	// Watch image files
 	gulp.watch('app/images/**/*', ['_images']);

	// Create LiveReload server
	$.livereload.listen();

	// Watch Chrome core file changes
	gulp.watch([
			'app/**/*'
// 			'app/manifest.json',
// 			'app/_locales/**/*',
// 			'app/scripts/background.js',
// 			'app/scripts/lib/**/*'
		]).on('change', $.livereload.reload);
});

