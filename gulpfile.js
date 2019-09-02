
const gulp = require('gulp')
const ts = require('gulp-typescript')
const mocha = require('gulp-mocha')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const del = require('del')
const merge = require('merge2')

const proj = ts.createProject('tsconfig.json', { declaration: true })

function buildSrc() {
  const tsResult = proj.src()
    .pipe(sourcemaps.init())
    .pipe(proj());
  return merge([
    tsResult.js
      .pipe(babel({ presets: [['@babel/env', { useBuiltIns: false, exclude: ['@babel/plugin-transform-regenerator'] }]] }))
      .pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../' }))
      .pipe(gulp.dest('./dist')),
    tsResult.dts
      .pipe(gulp.dest('./dist'))
  ])
}

function copyAuxFiles() {
  return gulp.src(['package-template.json', 'README.md', 'LICENSE.txt', 'src/**/*.d.ts'])
    .pipe(rename(function (path) {
      if (path.basename === 'package-template') {
        path.basename = 'package'
      }
    }))
    .pipe(gulp.dest('dist/'))
}

const build = gulp.parallel(copyAuxFiles, buildSrc)

function watch() {
  gulp.watch('src/**/*.ts', buildSrc)
  gulp.watch('dist/**/*.js', test)
}

function clean() {
  return del('./dist')
}

function test() {
  return gulp.src('dist/test/**/*.js')
    .pipe(mocha({ require: ['source-map-support/register'], reporter: 'min' }))
}

module.exports = {
  default: build,
  test: gulp.series(build, test),
  watch,
  build,
  clean
}

