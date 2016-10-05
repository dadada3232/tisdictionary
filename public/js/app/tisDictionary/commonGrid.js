define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/string",

    "dojo/dom-style",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/aspect",

    'dojo/store/Memory',
    "dojo/store/JsonRest",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    'dijit/form/ComboBox',
    'dijit/form/FilteringSelect',

    "dojo/i18n!./nls/message",
    "dojo/text!./templates/commonGrid.html",

    "tisDictionary/pattern",

    'gridx/Grid',
    'gridx/core/model/cache/Sync',
    "gridx/modules/SingleSort",
    "gridx/modules/select/Row",
    "gridx/modules/CellWidget",
    "gridx/modules/Edit",
    "gridx/modules/Focus",
    "gridx/modules/Pagination",
    "gridx/modules/pagination/PaginationBar",
    "gridx/modules/Filter",
    "gridx/modules/filter/FilterBar",
    "gridx/modules/filter/QuickFilter"
], function (declare,
             lang,
             string,
             domStyle,
             Deferred,
             all,
             aspect,
             Memory,
             JsonRest,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             ComboBox,
             FilteringSelect,
             nls,
             template,
             pattern,
             Grid,
             Cache,
             SingleSort,
             SelectRow,
             CellWidget,
             Edit,
             Focus,
             Pagination,
             PaginationBar,
             Filter,
             FilterBar,
             QuickFilter) {
    return declare("commonGrid", [
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin], {

        templateString: template,

        _nls: nls,

        rest: null,

        mode: null,

        buttonMode: null,

        pageSize: 20,

        setButtonMode: function () {
            var buttonMode = this.buttonMode;

            domStyle.set(this.deleteButton.domNode, "display", "none");
            domStyle.set(this.addButton.domNode, "display", "none");
            domStyle.set(this.openButton.domNode, "display", "none");
            domStyle.set(this.addParamButton.domNode, "display", "none");
            domStyle.set(this.deleteParamButton.domNode, "display", "none");

            if (this.mode == "pattern") { // then click Pattern menu
                domStyle.set(this.deleteButton.domNode, "display", "inline-block");
                domStyle.set(this.addButton.domNode, "display", "inline-block");
                domStyle.set(this.openButton.domNode, "display", "inline-block");
            } else if (buttonMode && buttonMode == "paramInner") {
                domStyle.set(this.addParamButton.domNode, "display", "inline-block");
            } else if (buttonMode && buttonMode == "patternInner") {
                domStyle.set(this.deleteParamButton.domNode, "display", "inline-block");
            } else { //default for every grids
                domStyle.set(this.deleteButton.domNode, "display", "inline-block");
                domStyle.set(this.addButton.domNode, "display", "inline-block");
            }
        },

        postCreate: function () {
            this.init();
            this.arrButtons = [
                this.deleteButton,
                this.openButton,
                this.addParamButton,
                this.deleteParamButton
            ];

            this.setButtonMode();
        },

        debug: function () {
            debugger;
        },

        init: function () {
            if (!this.mode) return;
            var mode = this.mode;
            this.initRest(mode);
            this._getData().then(lang.hitch(this, "initGrid", mode));
        },

        initRest: function (mode) {
            this.rest = new JsonRest({
                target: "/" + mode + "/"
            });
        },

        /**
         * Get json data from back end
         * @return Deferred.promise
         */
        _getData: function () {
            var deferred = new Deferred();
            this.rest.get("").then(function (results) {
                deferred.resolve(results);
            });
            return deferred.promise;
        },

        open: function () {
            var currentResult = this.currentResult;
            if (!currentResult) return;

            this.index.initPattern(currentResult);
        },

        add: function () {
            this.rest.add({});
            this.init();
        },

        _getCurrentResult: function () {
            var currentResult = this.currentResult;
            if (!currentResult) return;
            this.getCurrentResult(this.currentResult)
        },

        getCurrentResult: function (currentResult) {
        },

        delete: function () {
            var currentResult = this.currentResult;
            if (!currentResult) return;

            if (confirm(string.substitute(nls.confirmDeleteParam, [currentResult.title]))) {
                this.rest.remove(currentResult._id);
                this.grid.store.remove(currentResult._id);
                this.setActiveButtons(false);
            }
        },

        update: function (rowId) {
            if (!rowId) return;
            var store = this.grid.store;
            var item = store.get(rowId);
            this.rest.put(item, {id: rowId});
        },

        _handleGrid: function () {
            aspect.after(this.grid, 'onRowClick', lang.hitch(this, "_onRowClick"), true);

            var update = lang.hitch(this, "update");
            this.grid.edit.connect(this.grid.edit, "onApply", function (cell) {
                update(cell.row.id)
            });
        },

        _onRowClick: function (data) {
            this.grid.select.row.clear();
            this.grid.select.row.selectById(data.rowId);
            this.currentResult = this.grid.row(data.rowId).rawData();
            this.setActiveButtons(true);
        },

        setActiveButtons: function (bool) {
            this.arrButtons.forEach(function (item) {
                item.set("disabled", !bool);
            });
        },

        _initAdditionalStores: function (additionalStores) {
            var promise = [];
            additionalStores.forEach(function (item) {
                var additionalRest = new JsonRest({
                    target: "/" + item + "/"
                });
                promise.push(additionalRest.get(""));
            }, this);
            all(promise).then(function (results) {
                additionalStores.forEach(function (item, index) {
                    window[item + "Store"] = new Memory({
                        idProperty: "_id",
                        data: results[index]
                    });
                }, this);
            });
        },

        initGrid: function (mode, data) {
            if (this.cb) { //return data for patten grid
                this.cb(data);
            }

            if (mode == "param") {
                this._initAdditionalStores(["domain", "type", "dimension", "classifier"]);
            }
            if (mode == "pattern") {
                this._initAdditionalStores(["systemDomain"]);
            }

            var layout = this.initLayout();
            var store = new Memory({
                idProperty: "_id",
                data: data
            });
            if (this.grid) {
                this.grid.setColumns(layout[mode]);
                this.grid.setStore(store);
            } else {
                this.grid = new Grid({
                    cacheClass: Cache,
                    store: store,
                    paginationInitialPageSize: this.pageSize,
                    structure: layout[mode],
                    modules: [
                        CellWidget,
                        Edit,
                        SelectRow,
                        Pagination,
                        PaginationBar,
                        Filter,
                        FilterBar,
                        QuickFilter
                    ]
                }, this.gridNodeInputs);
                this.grid.startup();
                this._handleGrid();
            }
        },

        initLayout: function () {
            return {
                "param": [
                    {
                        field: 'domain', name: nls.domain, editable: true, width: '100px',
                        editor: "dijit/form/ComboBox",
                        editorArgs: {
                            props: 'store: domainStore, searchAttr: "title"'
                        }
                    },
                    {field: 'title', name: nls.name, editable: true, width: "300px"},
                    {field: 'notation', name: nls.notation, editable: true, width: '100px'},
                    {
                        field: 'classifier', name: nls.classifier, editable: true, width: '100px',
                        editor: "dijit/form/ComboBox",
                        editorArgs: {
                            props: 'store: classifierStore, searchAttr: "title"'
                        }
                    },
                    {
                        field: 'dimension', name: nls.dimension, editable: true, width: '100px',
                        editor: "dijit/form/ComboBox",
                        editorArgs: {
                            props: 'store: dimensionStore, searchAttr: "title"'
                        }
                    },
                    {
                        field: 'type', name: nls.type, editable: true, width: '100px',
                        editor: "dijit/form/ComboBox",
                        editorArgs: {
                            props: 'store: typeStore, searchAttr: "title"'
                        }
                    },
                    {field: 'length', name: nls.length, editable: true, width: '90px'},
                    {field: 'comma', name: nls.comma, editable: true, width: '90px'},
                    {field: 'minValue', name: nls.minValue, editable: true, width: '90px'},
                    {field: 'maxValue', name: nls.maxValue, editable: true, width: '90px'},
                    {field: 'note', name: nls.note, editable: true, width: "150px"}
                ],
                "classifier": [
                    {field: 'title', name: nls.name, editable: true},
                    {field: 'notation', name: nls.notation, editable: true}
                ],
                "domain": [
                    {field: 'title', name: nls.name, editable: true},
                    {field: 'notation', name: nls.notation, editable: true}
                ],
                "dimension": [
                    {field: 'title', name: nls.name, editable: true},
                    {field: 'notation', name: nls.notation, editable: true}
                ],
                "type": [
                    {field: 'title', name: nls.name, editable: true},
                    {field: 'notation', name: nls.notation, editable: true}
                ],
                "systemDomain": [
                    {field: 'title', name: nls.name, editable: true},
                    {field: 'notation', name: nls.notation, editable: true}
                ],
                "pattern": [
                    {
                        field: 'systemDomain', name: nls.systemDomain, editable: true,
                        editor: "dijit/form/ComboBox",
                        editorArgs: {
                            props: 'store: systemDomainStore, searchAttr: "title"'
                        }
                    },
                    {field: 'title', name: nls.name, editable: true},
                    {field: 'notation', name: nls.notation, editable: true}
                ]
            };
        }
    });
});