/*
 * jQuery File Upload Plugin Angular JS Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global window, angular */

;
(function() {
    'use strict';

    angular.module('demo', ['blueimp.fileupload'])
        .config(['$httpProvider', 'fileUploadProvider', function($httpProvider, fileUploadProvider) {
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            fileUploadProvider.defaults.redirect = window.location.href.replace(
                /\/[^\/]*$/,
                '/cors/result.html?%s'
            );

            angular.extend(fileUploadProvider.defaults, {
                disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
                maxFileSize: 1024 * 1024 * 20,
                acceptFileTypes: /(\.|\/)(mp4|jpeg4|ogg|webm)$/i,
                maxNumberOfFiles: 10
            });
        }])

    .controller('DemoFileUploadController', [
        '$scope', '$http', '$filter', '$window',
        function($scope, $http) {
            $scope.options = {
                url: "http://" + config.api.host + ":" + config.api.port + "/api/source/upload?source=video"
            };

            $scope.queue = [];
            $scope.fileList = [];
            $scope.saveStatus = true;

            $scope.$on('fileuploadadd', function(event, data) {
                if ($scope.options.maxNumberOfFiles == 1) {
                    $scope.queue = [];
                }
            });

            $scope.$on('fileuploaddone', function(event, data) {
                if(data.result && data.result.path) {
                    video_save(data.result.path)
                }
            });

            $scope.destoryAll = function() {
                $scope.clear($scope.queue);

            }

            $scope.cancelUpload = function() {
                $scope.closeThisDialog();
            }

            $scope.destory = function(file) {
                $scope.clear(file);
            }
        }
    ]);

}());
