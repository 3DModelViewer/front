define('service/api', [
    'ng'
], function(
    ng
){
    return function(ngModule){
        ngModule
            .service('api', ['$http', '$q', function($http, $q){
                var currentUserV1,
                    userCacheV1 = {},
                    pendingUserIdToPromiseIdMapV1 = {},
                    pendingUserPromisesV1 = {},
                    promiseIdSrc = 0,
                    newPromiseId = function(){return ''+promiseIdSrc++;},
                    doJsonReq = function(path, data){
                        return $q(function (resolve, reject) {
                            $http.post(path, data)
                                .then(function (resp) {
                                    resolve(resp.data);
                                }, reject);
                        });
                    },
                    doFormReq = function(path, data){
                        return $q(function (resolve, reject) {
                            $http.post(path, data, {
                                headers: {'Content-Type': undefined },
                                transformRequest: angular.identity
                            }).then(function (resp) {
                                    resolve(resp.data);
                            }, reject);
                        });
                    },
                    api = {

                        v1: {

                            user: {

                                getCurrent: function () {
                                    var pendingCurrentUserKey = 'currentUser';
                                    if (!pendingUserIdToPromiseIdMapV1[pendingCurrentUserKey]) {
                                        var promiseId = newPromiseId();
                                        pendingUserPromisesV1[promiseId] = $q(function (resolve, reject) {
                                            if (currentUserV1) {
                                                resolve(ng.copy(currentUserV1));
                                            } else {
                                                $http.post('/api/v1/user/getCurrent')
                                                    .then(function (resp) {
                                                        currentUserV1 = ng.copy(resp.data);
                                                        userCacheV1[currentUserV1.id] = ng.copy(resp.data);
                                                        delete pendingUserPromisesV1[promiseId];
                                                        delete pendingUserIdToPromiseIdMapV1[pendingCurrentUserKey];
                                                        resolve(ng.copy(resp.data));
                                                    }, reject);
                                            }
                                        });
                                        pendingUserIdToPromiseIdMapV1[pendingCurrentUserKey] = promiseId;
                                    }
                                    return pendingUserPromisesV1[pendingUserIdToPromiseIdMapV1[pendingCurrentUserKey]];
                                },

                                setProperty: function (property, value) {
                                    return doJsonReq('/api/v1/user/setProperty', {property: property, value: value});
                                },

                                getDescription: function (id) {
                                    return doJsonReq('/api/v1/user/getDescription', {id: id});
                                },

                                get: function (ids) {
                                    var unCachedAndNonePendingIds = [];
                                    var newPendingUsers = [];
                                    var masterPromiseList = [];
                                    var addedToMasterPromiseIds = {};
                                    for (var i = 0, l = ids.length; i < l; i++) {
                                        var id = ids[i];
                                        var promiseId = pendingUserIdToPromiseIdMapV1[id];
                                        if (promiseId && !addedToMasterPromiseIds[promiseId]) {
                                            masterPromiseList.push(pendingUserPromisesV1[promiseId]);
                                            addedToMasterPromiseIds[promiseId] = true;
                                        } else if (!userCacheV1[id]) {
                                            unCachedAndNonePendingIds.push(id);
                                            newPendingUsers.push(id);
                                        }
                                    }
                                    if (unCachedAndNonePendingIds.length > 0) {
                                        var currentPromiseId = newPromiseId();
                                        pendingUserPromisesV1[currentPromiseId] = $q(function (resolve, reject) {
                                            $http.post('/api/v1/user/get', {ids: unCachedAndNonePendingIds})
                                                .then(function (resp) {
                                                    if (resp && resp.data && resp.data.length > 0) {
                                                        for (var i = 0, l = resp.data.length; i < l; i++) {
                                                            userCacheV1[resp.data[i].id] = ng.copy(resp.data[i]);
                                                            delete pendingUserPromisesV1[currentPromiseId];
                                                            delete pendingUserIdToPromiseIdMapV1[resp.data[i].id];
                                                        }
                                                    }
                                                    resolve();
                                                }, reject);
                                            });
                                        for (var i = 0, l = newPendingUsers.length; i < l; i++) {
                                            pendingUserIdToPromiseIdMapV1[newPendingUsers[i]] = currentPromiseId;
                                        }
                                        masterPromiseList.push(pendingUserPromisesV1[currentPromiseId]);
                                    }
                                    return $q.all(masterPromiseList).then(function(){
                                        var results = [];
                                        for (var i = 0, l = ids.length; i < l; i++) {
                                            results.push(ng.copy(userCacheV1[ids[i]]));
                                        }
                                        return results;
                                    }, function(err){
                                        return err;
                                    });
                                },

                                search: function (search, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/user/search', {search: search, offset: offset, limit: limit, sortBy: sortBy});
                                }
                            },

                            project: {

                                create: function (name, description, image) {
                                    name = name || "";
                                    description = description || "";
                                    var data = new FormData();
                                    data.append('name', name);
                                    data.append('description', description);
                                    if(image) {
                                        data.append('file', image);
                                    }
                                    return doFormReq('/api/v1/project/create', data);
                                },

                                setName: function (id, name) {
                                    return doJsonReq('/api/v1/project/setName', {id: id, name: name});
                                },

                                setDescription: function (id, description) {
                                    return doJsonReq('/api/v1/project/setDescription', {id: id, description: description});
                                },

                                setImage: function (id, image) {
                                    var data = new FormData();
                                    data.append('id', id);
                                    if(image) {
                                        data.append('file', image);
                                    }
                                    return doFormReq('/api/v1/project/setImage', data);
                                },

                                addUsers: function (id, role, users) {
                                    return doJsonReq('/api/v1/project/addUsers', {id: id, role: role, users: users});
                                },

                                removeUsers: function (id, users) {
                                    return doJsonReq('/api/v1/project/removeUsers', {id: id, users: users});
                                },

                                acceptInvite: function (id) {
                                    return doJsonReq('/api/v1/project/acceptInvite', {id: id});
                                },

                                declineInvite: function (id) {
                                    return doJsonReq('/api/v1/project/declineInvite', {id: id});
                                },

                                getMemberships: function (id, role, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/project/getMemberships', {id: id, role: role, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                getMembershipInvites: function (id, role, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/project/getMembershipInvites', {id: id, role: role, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                get: function (ids) {
                                    return doJsonReq('/api/v1/project/get', {ids: ids});
                                },

                                getInUserContext: function (user, role, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/project/getInUserContext', {user: user, role: role, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                getInUserInviteContext: function (user, role, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/project/getInUserInviteContext', {user: user, role: role, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                search: function (search, role, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/project/search', {search: search, role: role, offset: offset, limit: limit, sortBy: sortBy});
                                }
                            },

                            treeNode: {

                                createFolder: function (parent, name) {
                                    return doJsonReq('/api/v1/treeNode/createFolder', {parent: parent, name: name});
                                },

                                createDocument: function (parent, name, uploadComment, file) {
                                    name = name || "";
                                    uploadComment = uploadComment || "";
                                    var data = new FormData();
                                    data.append('parent', parent);
                                    data.append('name', name);
                                    data.append('uploadComment', uploadComment);
                                    data.append('file', file);
                                    return doFormReq('/api/v1/treeNode/createDocument', data);
                                },

                                createViewerState: function() {
                                    //TODO
                                },

                                setName: function (id, name) {
                                    return doJsonReq('/api/v1/treeNode/setName', {id: id, name: name});
                                },

                                move: function (parent, ids) {
                                    return doJsonReq('/api/v1/treeNode/move', {parent: parent, ids: ids});
                                },

                                get: function (ids) {
                                    return doJsonReq('/api/v1/treeNode/get', {ids: ids});
                                },

                                getChildren: function (id, nodeType, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/treeNode/getChildren', {id: id, nodeType: nodeType, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                getParents: function (id) {
                                    return doJsonReq('/api/v1/treeNode/getParents', {id: id});
                                },

                                globalSearch: function (search, nodeType, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/treeNode/globalSearch', {search: search, nodeType: nodeType, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                projectSearch: function (project, search, nodeType, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/treeNode/projectSearch', {project: project, search: search, nodeType: nodeType, offset: offset, limit: limit, sortBy: sortBy});
                                }
                                
                            },

                            documentVersion: {

                                create: function (document, uploadComment, file) {
                                    name = name || "";
                                    uploadComment = uploadComment || "";
                                    var data = new FormData();
                                    data.append('document', document);
                                    data.append('uploadComment', uploadComment);
                                    data.append('file', file);
                                    return doFormReq('/api/v1/documentVersion/create', data);
                                },

                                get: function (ids) {
                                    return doJsonReq('/api/v1/documentVersion/get', {ids: ids});
                                },

                                getForDocument: function (document, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/documentVersion/getForDocument', {document: document, offset: offset, limit: limit, sortBy: sortBy});
                                }

                            },

                            sheet: {

                                setName: function (id, name) {
                                    return doJsonReq('/api/v1/sheet/setName', {id: id, name: name});
                                },

                                get: function (ids) {
                                    return doJsonReq('/api/v1/sheet/get', {ids: ids});
                                },

                                getForDocumentVersion: function (documentVersion, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/sheet/getForDocumentVersion', {documentVersion: documentVersion, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                globalSearch: function (search, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/sheet/globalSearch', {search: search, offset: offset, limit: limit, sortBy: sortBy});
                                },

                                projectSearch: function (project, search, offset, limit, sortBy) {
                                    return doJsonReq('/api/v1/sheet/globalSearch', {project: project, search: search, offset: offset, limit: limit, sortBy: sortBy});
                                }

                            }
                        }
                    };

                api.v1.user.getCurrent(); //just cache this value on page load, it will always be used.
                return api;
            }]);
    }
});