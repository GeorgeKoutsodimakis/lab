'use strict';

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	config = require('../config'),
	argv = require('yargs').argv,
	webpack = require('webpack');

//-----------------------------------------------------o

var logger = function(err, stats)
{
	if(err) throw new gutil.PluginError('webpack', err);

	if(stats.compilation.errors.length > 0)
	{
		stats.compilation.errors.forEach(function(error)
		{
			gutil.log(gutil.colors.red(error.toString().split(': ').join(':\n')));
		});
	}
	else
	{
		gutil.log(gutil.colors.green('JS built in ' + (stats.endTime - stats.startTime) + 'ms'));
	}
};

//-----------------------------------------------------o

gulp.task('webpack', ['setModuleSrc'], function(callback)
{
	var built = false;

	var webpackConfig = config.webpack;
	webpackConfig.entry = config.moduleSrc + 'js/Main.es6';
	webpackConfig.output = 
	{
		path: config.bin + argv.name +  "/js", 
		filename: "scripts.js"
	};

	webpackConfig.resolve.root = 
	[
		config.src + '_shared/js/',
		config.src + config.moduleSrc + '/js/'
	];

	if(config.env === 'prod')
	{
		webpackConfig.devtool = undefined;
		webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin(
		{
			minimize: true,
			output: {comments: false}
		}));
	}

	if(config.isWatching)
	{
		webpack(webpackConfig).watch(200, function(err, stats)
		{
			logger(err, stats);
			// browserSync.reload();
			// On the initial compile, let gulp know the task is done
			if(!built)
			{
				built = true;
				callback();
			}
		});
	}
	else
	{
		webpack(webpackConfig, function(err, stats)
		{
			logger(err, stats);
			callback();
		});
	}
});
