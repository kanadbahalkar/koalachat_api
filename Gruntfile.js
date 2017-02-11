'use strict';

module.exports = function(grunt) { 
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-express-server');


  grunt.initConfig({ pkg: grunt.file.readJSON('package.json'),
    watch: {
      less: {
        files: 'public/assets/LESS/**/*.less',
        tasks: 'less'
      }
    },
    less: {
        default: {
            options: {
                paths: ['public/assets/less'],
                yuicompress: true
            },
            files: {
                'assets/css/style.css': 'assets/less/style.less'
            }
        }
    },
    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    }
  });

  grunt.registerTask(
    'build', 
    'Compiles all of the assets and copies the files to the build directory.', 
    ['express:dev', 'watch']
  );
};
