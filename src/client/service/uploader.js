define('service/uploader', [
], function(
){
    return function(ngModule){
        ngModule
            .service('uploader', ['$rootScope', '$window', 'api', 'thumbnail', 'EVENT', function($rootScope, $window, api, thumbnail, EVENT){
                var idx = {},
                    entries = [],
                    addToEntries = function(newType, parentId, name, thumbnailData){
                        return function(obj){
                            entries.push({uploadId: obj.uploadId, progress: 0, name: name, parentId: parentId, newType: newType, status: 'uploading', image: thumbnailData.image});
                            idx[obj.uploadId] = entries.length - 1;
                        };
                    },
                    uploadHelper = function(newType, parentId, name, file, thumbnailData){
                        if(newType === 'document'){
                            api.v1.treeNode.createDocument(parentId, name, '', file, thumbnailData.type, thumbnailData.blob).then(addToEntries(newType, parentId, name, thumbnailData));
                        } else {
                            api.v1.documentVersion.create(parentId, '', file, thumbnailData.type, thumbnailData.blob).then(addToEntries(newType, parentId, name, thumbnailData));
                        }
                    };

                $rootScope.$on(EVENT.UPLOAD_PROGRESS, function(event, data){
                    var done = data.event.loaded || data.event.position,
                        total = data.event.total || data.event.totalSize;
                    entries[idx[data.uploadId]].progress = $window.Math.round((done / total) * 100);
                });

                $rootScope.$on(EVENT.UPLOAD_SUCCESS, function(event, data){
                    entries[idx[data.uploadId]].progress = 100;
                });

                $rootScope.$on(EVENT.UPLOAD_ERROR, function(event, data){
                    entries[idx[data.uploadId]].status = 'error';
                });

                $rootScope.$on(EVENT.UPLOAD_REQUEST_SUCCESS, function(event, data){
                    entries[idx[data.uploadId]].status = 'success';
                });

                $rootScope.$on(EVENT.UPLOAD_REQUEST_ERROR, function(event, data){
                    entries[idx[data.uploadId]].status = 'error';
                });

                return {
                    start: function(newType, parentId, name, file){
                        if(file) {
                            if (file.type.match(/(image.*|video.*)/)) {
                                thumbnail(file, 196).then(function (thumbnailData) {
                                    uploadHelper(newType, parentId, name, file, thumbnailData);
                                }, function (error) {
                                    uploadHelper(newType, parentId, name, file, {image: null, type: null, blob: null});
                                });
                            } else {
                                uploadHelper(newType, parentId, name, file, {image: null, type: null, blob: null});
                            }
                        }
                    },
                    getUploads: function(){

                    },
                    clearCompletedAndFailed: function(){

                    }
                };
            }]);
    }
});
