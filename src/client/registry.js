define('registry', [
    'ng',
    //constants
    'constant/event',
    //services
    'service/api',
    'service/csrfToken',
    'service/currentUser',
    'service/i18n',
    'service/lmv',
    'service/lmvLoader',
    'service/logout',
    'service/md',
    'service/sheetExtender',
    'service/three',
    'service/thumbnail',
    'service/uploader',
    //components
    'audioDoc/audioDoc',
    'breadcrumbs/breadcrumbs',
    'createForm/createForm',
    'document/document',
    'documentRoute/documentRoute',
    'documentVersion/documentVersion',
    'documentVersionRoute/documentVersionRoute',
    'folder/folder',
    'folderRoute/folderRoute',
    'invites/invites',
    'imageDoc/imageDoc',
    'langSelector/langSelector',
    'lmvDoc/lmvDoc',
    'loader/loader',
    'logout/logout',
    'mainMenu/mainMenu',
    'markdownDoc/markdownDoc',
    'openDoc/openDoc',
    'projects/projects',
    'projectSpace/projectSpace',
    'projectSpaceRoute/projectSpaceRoute',
    'projectSpaceViewer/projectSpaceViewer',
    'rootLayout/rootLayout',
    'search/search',
    'searchRoute/searchRoute',
    'sheet/sheet',
    'sheetRoute/sheetRoute',
    'settings/settings',
    'uploads/uploads',
    'videoDoc/videoDoc',
    'viewer/viewer'
], function(
    ng,
    //constants
    EVENT,
    //services
    api,
    csrfToken,
    currentUser,
    i18n,
    lmv,
    lmvLoader,
    logoutService,
    md,
    sheetExtender,
    three,
    thumbnail,
    uploader,
    //components
    audioDoc,
    breadcrumbs,
    createForm,
    document,
    documentRoute,
    documentVersion,
    documentVersionRoute,
    folder,
    folderRoute,
    invites,
    imageDoc,
    langSelector,
    lmvDoc,
    loader,
    logout,
    mainMenu,
    markdownDoc,
    openDoc,
    projects,
    projectSpace,
    projectSpaceRoute,
    projectSpaceViewer,
    rootLayout,
    search,
    searchRoute,
    sheet,
    sheetRoute,
    settings,
    uploads,
    videoDoc,
    viewer
){
    var registry = ng.module('mh.registry', []);
    [].slice.call(arguments).forEach(function(arg){
        if(arg !== ng){
            arg(registry);
        }
    });

    return registry;
});