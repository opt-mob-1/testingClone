var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var merge = require('merge-stream');
const imagemin = require('gulp-imagemin');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {
  browsers: ['last 10 versions', 'ie 9']
};

gulp.task('imageMin', () => {
  var blocks = gulp.src('./blocks/**/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./css/blocks'));
var paragraphs = gulp.src('./paragraphs/**/img/*')
  .pipe(imagemin())
  .pipe(gulp.dest('./css/paragraphs'));
var sassDir = gulp.src('./sass/**/img/*')
  .pipe(imagemin())
  .pipe(gulp.dest('./css'));
return merge(blocks, sassDir);
});

gulp.task('babel', () => {
  var blocks = gulp.src('./blocks/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./js/blocks'));
var paragraphs = gulp.src('./paragraphs/**/*.js')
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('./js/paragraphs'));
var views = gulp.src('./views/**/*.js')
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('./js/views'));
var libs = gulp.src('./libs/**/*.js')
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('./js/libs'));
return merge(blocks, libs);
});

gulp.task('sass', function() {
  var blocks = gulp.src('./blocks/**/*.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('./css/blocks'));
  var paragraphs = gulp.src('./paragraphs/**/*.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('./css/paragraphs'));
  var views = gulp.src('./views/**/*.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('./css/views'));
  var sassDir = gulp.src('./sass/**/*.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('./css'));
  return merge(blocks, sassDir);
});

gulp.task('watch', function() {
  return gulp
  //An array in future
    .watch(['./sass/**/*.scss','./blocks/**/*.scss','./paragraphs/**/*.scss', './views/**/*.scss','./sass/**/img/*','./blocks/**/img/*','./paragraphs/**/img/*', './views/**/img/*','./blocks/**/*.js','./paragraphs/**/*.js', './views/**/*.js','./libs/**/*.js'], ['sass','babel','imageMin'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default',['watch']);