"use strict";

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require("load-grunt-tasks")(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require("time-grunt")(grunt);

	// Configurable paths
	var config = {
		app: "app",
		dist: "dist"
	};

	grunt.initConfig({

		// Project settings
		config: config,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			less: {
				files: ["<%= config.app %>/styles/{,*/}*.less"],
				tasks: ["less"]
			},
			gruntfile: {
				files: ["Gruntfile.js"],
				options: {
					reload: true
				}
			},
			js: {
				files: ["<%= config.app %>/scripts/*.js"],
				tasks: ["jshint:app"]
			},
			code: {
				options: {
					livereload: "<%= connect.code.options.livereload %>"
				},
				files: [
					"<%= config.app %>/*.html",
					"{.tmp,<%= config.app %>}/styles/{,*/}*.css",
					"{.tmp,<%= config.app %>}/scripts/{,*/}*.js",
					"<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}",
				]
			},
			chrome: {
				options: {
					livereload: "<%= connect.chrome.options.livereload %>"
				},
				files: [
					"<%= config.app %>/manifest.json",
					"<%= config.app %>/scripts/background.js",
					"<%= config.app %>/scripts/content.js",
					"<%= config.app %>/scripts/lib/*.js",
					"<%= config.app %>/_locales/{,*/}*.json"
				]
			}
		},

		// Grunt server and debug server setting
		connect: {
			options: {
				hostname: "localhost",
				open: false,
				base: [
					"<%= config.app %>"
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
						"test",
						"<%= config.app %>"
					]
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			chrome: {
			},
			app: {
				files: [{
					dot: true,
					src: [
						"<%= config.app %>/fonts/*"
					]
				}]
			},
			dist: {
				files: [{
					dot: true,
					src: [
						"<%= config.dist %>/*",
						"!<%= config.dist %>/.git*"
					]
				}]
			},
			server: ".tmp"
		},

		less: {
			dist: {
				options: {
					paths: ["<%= config.app %>/styles/"]
				},
				files: [{
					expand: true,
					cwd: "<%= config.app %>/styles",
					src: "[^_]*.less",
					dest: "<%= config.app %>/styles",
					ext: ".css"
				}]
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: ".jshintrc",
				reporter: require("jshint-stylish")
			},
			app: [
				"<%= config.app %>/scripts/{,*/}*.js",
				"!<%= config.app %>/scripts/lib/*"
			],
			dist: [
				"<%= config.dist %>/scripts/{,*/}*.js",
				"!<%= config.dist %>/scripts/jqbootstrap.js",
				"!<%= config.dist %>/scripts/lib/*"
			]
		},

		mocha: {
			all: {
				options: {
					run: true,
					urls: ["http://localhost:<%= connect.test.options.port %>/options.html"]
				}
			}
		},

		useminPrepare: {
			html: "<%= config.app %>/{,*/}*.html",
			options: {
				dest: "<%= config.dist %>",
				flow: {
					html: {
						steps: {
							js: ['concat', 'uglifyjs'],
							css: ['cssmin']
						},
						post: {}
					}
				}
			}
		},

		usemin: {
			html: ["<%= config.dist %>/{,*/}*.html"],
			css: ["<%= config.dist %>/styles/{,*/}*.css"],
		},

		cssmin: {
			options: {
				rebase: false,
			},
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
					cwd: "<%= config.app %>",
					src: "*.html",
					dest: "<%= config.dist %>"
				}]
			}
		},

		// http://lisperator.net/uglifyjs
		uglify: {
			options: {
				mangle: false,
				preserveComments: false,
				//sourceMap: true,
				report: "min",
				beautify: {
					"ascii_only": true
				},
				compress: {
					drop_console: true,
					sequences: false,
					"hoist_funs": false,
					loops: false,
					unused: false
				}
			},
			dist: {
				files: {
					"<%= config.dist %>/scripts/background.js": ["<%= config.app %>/scripts/background.js"],
					"<%= config.dist %>/scripts/content.js": ["<%= config.app %>/scripts/content.js"]
				}
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			server: {
				files: [{
					expand: true,
					dot: true,
					cwd: "<%= config.app %>/bower_components/bootstrap/dist/fonts/",
					dest: "<%= config.app %>/fonts/glyphicons",
					src: ["*"]
				}]
			},
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: "<%= config.app %>",
					dest: "<%= config.dist %>",
					src: [
						"*.*",
						"images/{,*/}*.*",
						"fonts/{,*/}*.*",
						"_locales/{,*/}*.json",
						"scripts/lib/{,*/}*.js",
					]
				}]
			},
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			chrome: [
			],
			dist: [
				"jshint:app",
				"less"
			],
			test: [
			]
		},

		// Compres dist files to package
		compress: {
			dist: {
				options: {
					archive: function() {
						var manifest = grunt.file.readJSON("app/manifest.json");
						return "extension/v" + manifest.version + ".zip";
					}
				},
				files: [{
					expand: true,
					cwd: "dist/",
					src: ["**"],
					dest: ""
				}]
			}
		},

		processhtml: {
			options: {
				commentMarker: "process"
			},
			dist: {
				files: [{
					expand: true,
					cwd: "dist/",
					src: ["*.html"],
					dest: "dist/"
				}]
			}
		},

		// modify manifest.json
		modify_json: {
			options: {
				add: true,
				fields: {
					background: {
						scripts: [
							"scripts/background.js",
							"scripts/lib/traceur-runtime.js",
							"scripts/lib/setImmediate-polyfill.js",
							"scripts/lib/hmac-sha256.js",
							"scripts/lib/lib-typedarrays-min.js",
							"scripts/lib/scrypt-asm.js",
							"scripts/lib/scrypt.js",
							"scripts/lib/mpw.js"
						]
					}
				}
			},
			dist: {
				src: [ 'dist/manifest.json' ]
			}
		},

		concat: {
			options: {
				separator: ';',
			}
		}
	});


	grunt.registerTask("debug", function () {
		grunt.task.run([
			"clean:server",
			"less",
			"copy:server",
			"concurrent:chrome",
			"connect:chrome",
			"connect:code",
			"watch"
		]);
	});

	grunt.registerTask("test", [
		"clean:server",
		"less",
		"copy:server",
		"connect:test",
		"mocha"
	]);

	grunt.registerTask("dist", [
		"clean",
		"copy",
		"concurrent:dist",
		"useminPrepare",
		"concat",
		"cssmin",
		"uglify",
		"usemin",
		"processhtml:dist",
		"modify_json",
		//"jshint:dist",
	]);

	grunt.registerTask("build", [
		"dist",
		"compress"
	]);

	grunt.registerTask("default", [
		"test",
		"build"
	]);
};
