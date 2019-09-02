
const gulp = require('gulp')
const ts = require('gulp-typescript')
const mocha = require('gulp-mocha')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')

const proj = ts.createProject('tsconfig.json')

function buildSrc() {
  return proj.src()
    .pipe(sourcemaps.init())
      .pipe(proj())
      .pipe(babel({ presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3' }]] }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'))
}

function copyPackageJson() {
  return gulp.src('package.json')
    .pipe(gulp.dest('./dist'))
}

const build = gulp.parallel(copyPackageJson, buildSrc)

function watch() {
  gulp.watch('src/**/*.ts', buildSrc)
  gulp.watch('dist/**/*.js', test)
}

function clean() {
  return del('./dist')
}

function test() {
  return gulp.src('dist/test/**/*.js')
    .pipe(mocha({ require: ['source-map-support/register'] }))
}

module.exports = {
  default: build,
  test: gulp.series(build, test),
  watch,
  build,
  clean
}

