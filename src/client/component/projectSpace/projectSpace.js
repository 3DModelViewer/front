define('projectSpace/projectSpace', [
    'ng',
    'styler',
    'text!projectSpace/projectSpace.css',
    'text!projectSpace/projectSpace.html',
    'text!projectSpace/projectSpace.txt.json'
], function(
    ng,
    styler,
    style,
    tpl,
    txt
){
    styler(style);
    txt = JSON.parse(txt);

    return function(ngModule){
        ngModule
            .directive('mhProjectSpace', function(){
                return {
                    restrict: 'E',
                    template: tpl,
                    scope: {
                        projectId: '@'
                    },
                    controller: ['$rootScope', '$scope', '$window', 'api', 'EVENT', 'i18n', 'sheetExtender', function($rootScope, $scope, $window, api, EVENT, i18n, sheetExtender){
                        i18n($scope, txt);
                        var loadedSheets = {},
                            viewer = null,
                            projectId = $scope.projectId,
                            broadcastReadyEvent = function(){
                                if($scope.project && viewer) {
                                    $rootScope.$broadcast(EVENT.PROJECT_SPACE_CREATED, ng.copy($scope.project));
                                }
                            };

                        var sheets = $scope.sheets = [];
                        $scope.showSheetsMenu = true;
                        $scope.toggleSheetsMenuBtnClick = function(){
                            if(viewer) {
                                $scope.showSheetsMenu = !$scope.showSheetsMenu;
                                $window.setTimeout(viewer.resize, 0);
                            }
                        };

                        $scope.$on(EVENT.VIEWER_READY, function(event, data){
                            if(data.scopeId === $scope.$id){
                                viewer = data.viewer;
                                viewer.addEventListener('svfLoaded', function(event){
                                    var sheetId = event.svf.basePath.split('/')[5];
                                    if(!sheetId){
                                        throw 'couldnt find sheetId from svf basePath property';
                                    }
                                    for(var i = 0, l = sheets.length; i < l; i++){
                                        if(sheets[i].id === sheetId){
                                            sheets[i].svf = event.svf;
                                            sheets[i].model = event.model;
                                            return;
                                        }
                                    }
                                });
                                viewer.addEventListener('geometryLoaded', function(event){
                                    for(var i = 0, l = sheets.length; i < l; i++){
                                        if(sheets[i].model === event.model){
                                            sheets[i].geometryLoaded = true;
                                            if(sheets[i].geometryLoaded && sheets[i].propertyDbLoaded){
                                                sheetExtender(sheets[i]);
                                                $scope.$evalAsync();
                                            }
                                            return;
                                        }
                                    }
                                });
                                viewer.addEventListener('propertyDbLoaded', function(event){
                                    for(var i = 0, l = sheets.length; i < l; i++){
                                        if(sheets[i].model === event.model){
                                            sheets[i].propertyDbLoaded = true;
                                            if(sheets[i].geometryLoaded && sheets[i].propertyDbLoaded){
                                                sheetExtender(sheets[i]);
                                                $scope.$evalAsync();
                                            }
                                            return;
                                        }
                                    }
                                });
                                $scope.$on(EVENT.LOAD_SHEET_IN_PROJECT_SPACE, function(event, sheet){
                                    if(sheet.project === projectId && !loadedSheets[sheet.id]){
                                        var sheetCopy = ng.copy(sheet);
                                        loadedSheets[sheet.id] = true;
                                        sheetCopy.svf = sheetCopy.model = null;
                                        sheetCopy.geometryLoaded = sheetCopy.propertyDbLoaded = false;
                                        sheets.push(sheetCopy);
                                        viewer.loadSheet(sheet);
                                    }
                                });
                                broadcastReadyEvent();
                            }
                        });

                        api.v1.project.get([projectId]).then(function(projects){
                            $scope.project = projects[0];
                            broadcastReadyEvent();
                        });

                        $scope.fitToView = function(sheet){
                            if(sheet.propertyDbLoaded && sheet.geometryLoaded) {
                                viewer.fitToView(false, sheet.getBoundingBox());
                            }
                        };

                        $scope.applyTransforms = function(sheet){
                            if(sheet.propertyDbLoaded && sheet.geometryLoaded) {
                                sheet.applyTransforms();
                                viewer.sceneUpdated();
                            }
                        };

                        $scope.removeSheet = function(sheet){
                            if(sheet.propertyDbLoaded && sheet.geometryLoaded) {
                                viewer.unloadSheet(sheet);
                                delete loadedSheets[sheet.id];
                                for(var i = 0, l = sheets.length; i < l; i++){
                                    if(sheets[i] == sheet){
                                        sheets.splice(i, 1);
                                        if(sheets.length === 0){
                                            viewer.sceneUpdated();
                                        }
                                        return;
                                    }
                                }
                            }
                        };
                    }]
                };
            });
    }
});