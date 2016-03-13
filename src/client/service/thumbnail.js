define('service/thumbnail', [
], function(
){
    return function(ngModule){
        ngModule
            .service('thumbnail', ['$document', '$q', '$window', function($document, $q, $window){
                function dataURLToBlob(dataURL) {
                    var BASE64_MARKER = ';base64,';
                    if (dataURL.indexOf(BASE64_MARKER) == -1) {
                        var parts = dataURL.split(',');
                        var contentType = parts[0].split(':')[1];
                        var raw = parts[1];

                        return new $window.Blob([raw], {type: contentType});
                    }

                    var parts = dataURL.split(BASE64_MARKER);
                    var contentType = parts[0].split(':')[1];
                    var raw = $window.atob(parts[1]);
                    var rawLength = raw.length;

                    var uInt8Array = new $window.Uint8Array(rawLength);

                    for (var i = 0; i < rawLength; ++i) {
                        uInt8Array[i] = raw.charCodeAt(i);
                    }

                    return new $window.Blob([uInt8Array], {type: contentType});
                }

                return function(file, max_size){
                    return $q(function(resolve, reject) {
                        if (file && file.type.match(/image.*/)) {
                            var reader = new $window.FileReader();
                            reader.onerror = function(error){
                                reject(error);
                            };
                            reader.onload = function (readerEvent) {
                                var image = new $window.Image();
                                image.onerror = function(error){
                                    reject(error);
                                };
                                image.onload = function () {
                                    var canvas = $document[0].createElement('canvas'),
                                        width = image.width,
                                        height = image.height,
                                        size = width,
                                        srcDim = width,
                                        srcX = 0,
                                        srcY = 0;
                                    if (width < height) {
                                        srcY = (height - width) / 2;
                                        if (width > max_size) {
                                            size = max_size;
                                        }
                                    } else {
                                        size = height;
                                        srcDim = height;
                                        srcX = (width - height) / 2;
                                        if (height > max_size) {
                                            size = max_size;
                                        }
                                    }
                                    canvas.width = size;
                                    canvas.height = size;
                                    canvas.getContext('2d').drawImage(image, srcX, srcY, srcDim, srcDim, 0, 0, size, size);
                                    var dataUrl = canvas.toDataURL(file.type);
                                    var resizedImage = new $window.Image();
                                    resizedImage.src = dataUrl;
                                    resolve({image: resizedImage, blob: dataURLToBlob(dataUrl), name: file.name});
                                };
                                image.src = readerEvent.target.result;
                            };
                            reader.readAsDataURL(file);
                        } else {
                            resolve({image: null, blob: null, name: null});
                        }
                    });
                };
            }]);
    }
});
