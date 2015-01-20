// Generated on 2015-01-17 using generator-chrome-extension 0.2.11
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Configurable paths
	var config = {
		app: 'app',
		dist: 'dist'
	};

	grunt.initConfig({

		// Project settings
		config: config,

		update_json: {
			// set some task-level options
			options: {
				src: 'package.json',
				indent: '\t'
			},

			bower: {
				src: 'package.json',
				dest: 'bower.json',
				// the fields to update, as a String Grouping
				fields: 'name version description repository'
			},
		},

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			less: {
				files: ['<%= config.app %>/styles/{,*/}*.less'],
				tasks: ['less']
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				options: {
					reload: true
				}
			},
			bower: {
				files: ['bower.json'],
				tasks: ['bowerInstall']
			},
//
// 			js: {
//				files: ['<%= config.app %>/scripts/{,*/}*.js'],
//				tasks: ['jshint']
//			},
			code: {
				options: {
					livereload: '<%= connect.code.options.livereload %>'
				},
				files: [
					'<%= config.app %>/*.html',
					'{.tmp,<%= config.app %>}/styles/{,*/}*.css',
					'{.tmp,<%= config.app %>}/scripts/{,*/}*.js',
					'<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',

				]
			},

			chrome: {
				options: {
					livereload: '<%= connect.chrome.options.livereload %>'
				},
				files: [
					'<%= config.app %>/manifest.json',
					'<%= config.app %>/_locales/{,*/}*.json'
				]
			}
		},

		// Grunt server and debug server setting
		connect: {
			options: {
				hostname: 'localhost',
				open: false,
				base: [
					'<%= config.app %>'
				]
			},
			code: {
				options: {
					port: 9000,
					livereload: 35730
				}
			},
			chrome: {
				options: {
					port: 9001,
					livereload: 35731
				}
			},
			test: {
				options: {
					open: false,
					base: [
						'test',
						'<%= config.app %>'
					]
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			chrome: {
			},
			dist: {
				files: [{
					dot: true,
					src: [
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},

		less: {
			dist: {
				options: {
					paths: ["<%= config.app %>/styles/"]
				},
				files: [{
					expand: true,
					cwd: '<%= config.app %>/styles',
					src: '[^_]*.less',
					dest: '<%= config.app %>/styles',
					ext: ".css"
				}]
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= config.app %>/scripts/{,*/}*.js',
				'!<%= config.app %>/scripts/vendor/*',
				'test/spec/{,*/}*.js'
			]
		},

		mocha: {
			all: {
				options: {
					run: true,
					urls: ['http://localhost:<%= connect.test.options.port %>/options.html']
				}
			}
		},

		// Automatically inject Bower components into the HTML file
		bowerInstall: {
			app: {
				src: [
					'<%= config.app %>/*.html'
				]
			}
		},

		useminPrepare: {
			html: '<%= config.app %>/{,*/}*.html',
			options: {
				dest: '<%= config.dist %>'
			}
		},
		usemin: {
			html: ['<%= config.dist %>/{,*/}*.html'],
			css: ['<%= config.dist %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= config.dist %>']
			}
		},

		// The following *-min tasks produce minifies files in the dist folder
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/images',
					src: '{,*/}*.{gif,jpeg,jpg,png}',
					dest: '<%= config.dist %>/images'
				}]
			}
		},

		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/images',
					src: '{,*/}*.svg',
					dest: '<%= config.dist %>/images'
				}]
			}
		},

		htmlmin: {
			dist: {
				options: {
				// removeCommentsFromCDATA: true,
				// collapseWhitespace: true,
				// collapseBooleanAttributes: true,
				// removeAttributeQuotes: true,
				// removeRedundantAttributes: true,
				// useShortDoctype: true,
				// removeEmptyAttributes: true,
				// removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.app %>',
					src: '*.html',
					dest: '<%= config.dist %>'
				}]
			}
		},

		// By default, your `index.html`'s <!-- Usemin block --> will take care of
		// minification. These next options are pre-configured if you do not wish
		// to use the Usemin blocks.
		// cssmin: {
		//   dist: {
		//     files: {
		//       '<%= config.dist %>/styles/main.css': [
		//         '<%= config.app %>/styles/{,*/}*.css'
		//       ]
		//     }
		//   }
		// },
		// uglify: {
		//   dist: {
		//     files: {
		//       '<%= config.dist %>/scripts/scripts.js': [
		//         '<%= config.dist %>/scripts/scripts.js'
		//       ]
		//     }
		//   }
		// },
		// concat: {
		//   dist: {}
		// },

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: [
						'*.{ico,png,txt}',
						'images/{,*/}*.{webp,gif}',
						'fonts/{,*/}*.*',
						'{,*/}*.html',
						'styles/{,*/}*.css',
						'_locales/{,*/}*.json',
					]
				}]
			},
			server: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.app %>/bower_components/font-awesome/fonts/',
					dest: '<%= config.app %>/fonts/font-awesome',
					src: ['*']
				}, {
					expand: true,
					dot: true,
					cwd: '<%= config.app %>/bower_components/bootstrap/dist/fonts/',
					dest: '<%= config.app %>/fonts/glyphicons',
					src: ['*']
				}]
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			chrome: [
			],
			dist: [
				'less',
				'imagemin',
				'svgmin'
			],
			test: [
			]
		},

		// Auto buildnumber, exclude debug files. smart builds that event pages
		chromeManifest: {
			dist: {
				options: {
					buildnumber: true,
					background: {
						target: 'scripts/background.js',
						exclude: [
							'scripts/chromereload.js',
							'scripts/debug.js',
						]
					}
				},
				src: '<%= config.app %>',
				dest: '<%= config.dist %>'
			}
		},

		// Compres dist files to package
		compress: {
			dist: {
				options: {
					archive: function() {
						var manifest = grunt.file.readJSON('app/manifest.json');
						return 'package/yo chrome extension-' + manifest.version + '.zip';
					}
				},
				files: [{
					expand: true,
					cwd: 'dist/',
					src: ['**'],
					dest: ''
				}]
			}
		},

		processhtml: {
			options: {
				commentMarker: 'process'
			},
			dist: {
				files: [{
					expand: true,     // Enable dynamic expansion.
					cwd: 'dist/',      // Src matches are relative to this path.
					src: ['*.html'], // Actual pattern(s) to match.
					dest: 'dist/'   // Destination path prefix.
				}]
			}
		},


	});


	grunt.registerTask('debug', function () {
		grunt.task.run([
			'clean:server',
//			'jshint',
			'less',
			'copy:server',
//			'concurrent:chrome',
			'connect:chrome',
			'connect:code',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'clean:server',
		'less',
		'copy:server',
		'connect:test',
		'mocha'
	]);

	grunt.registerTask('build', [
		//'update_json',
		//'chromeManifest:dist',
		'clean:dist',
		'useminPrepare',
		'concurrent:dist',
		//'cssmin',
		'concat',
		'uglify',
		'copy',
		'usemin',
		'processhtml:dist',
//		'compress'
	]);

	grunt.registerTask('default', [
		'jshint',
		'test',
		'build'
	]);
};
