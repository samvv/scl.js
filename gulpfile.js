
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
      .pipe(babel({ presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3' }]] }))
      .pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../' }))
      .pipe(gulp.dest('./dist')),
    tsResult.dts
      .pipe(gulp.dest('./dist'))
  ])
}

function copyDts() {
  return gulp.src('src/**/*.d.ts')
    .pipe(gulp.dest('dist/'))
}

function copyPackageJson() {
  return gulp.src('package-template.json')
    .pipe(rename({ basename: 'package' }))
    .pipe(gulp.dest('./dist'))
}

const build = gulp.parallel(copyPackageJson, copyDts, buildSrc)

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

