var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('env:dev', function(){
    process.env.NODE_ENV = 'development';
});

gulp.task('env:prod', function(){
    process.env.NODE_ENV = 'production';
});

gulp.task('nodemon', function (cb) {
    var started = false;
    return nodemon({
        script: 'index.js',
        ext:'js html jade css',
        env:{'NODE_ENV': process.env.NODE_ENV}
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task('develop', ['env:dev', 'nodemon']);

gulp.task('default', ['env:prod', 'nodemon']);