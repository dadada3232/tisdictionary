define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/string",

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

    "dojo/text!./templates/pattern.html",
    "dojo/i18n!./nls/message",

    "tisDictionary/commonGrid"
], function (declare,
             lang,
             string,
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
             template,
             nls,
             commonGrid) {
    return declare("pattern", [
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin], {

        templateString: template,

        patternItem: null, // obj pattenItem

        _nls: nls,

        postCreate: function () {
            this.inherited(arguments);
            this._initRest();
            this.initParamGrid();
        },

        initParamGrid: function () {
            this.paramGrid = new commonGrid({
                mode: "param", buttonMode: "paramInner", pageSize: 5,
                cb: lang.hitch(this, "initPatternGrid")
            });
            this.paramGrid.initRest("param");
            this.paramGrid.getCurrentResult = lang.hitch(this, "addParamInPatternGrid");
            this.paramContent.addChild(this.paramGrid);
        },

        addParamInPatternGrid: function (item) {
            if (this.patternItem.parameters.indexOf(item._id) != -1) {
                alert(nls.paramExist);
                return;
            }
            this.patternItem.parameters.push(item._id);
            this.initPatternGrid(null, true);
            this.restUpdate();
        },

        removeParamInPatternGrid: function (item) {
            this.removeItemFromArr(this.patternItem.parameters, item._id);
            this.initPatternGrid(null, true);
            this.restUpdate();
        },

        restUpdate: function () {
            this.rest.put(this.patternItem, {id: this.patternItem._id});
        },

        removeItemFromArr: function (arr, id) {
            for (var i = arr.length; i--;) {
                if (arr[i] == id) {
                    arr.splice(i, 1)
                }
            }
        },

        _initRest: function () {
            this.rest = new JsonRest({
                target: "/pattern/"
            });
        },

        initPatternGrid: function (data, refresh) {
            if (!refresh) {
                this.data = data;
            }
            this.paramsStore = new Memory({
                data: (refresh) ? this.data : data,
                idProperty: "_id"
            });
            var store = [];
            this.patternItem.parameters.forEach(function (item) {
                var obj = this.paramsStore.get(item);
                store.push(obj);
            }, this);
            if (this.patternGrid) {
                this.patternContent.destroyDescendants();
            }
            this.patternGrid = new commonGrid({pageSize: 5, buttonMode: "patternInner"});
            this.patternGrid.initGrid("param", store);
            this.patternGrid.initRest("param");
            this.patternGrid.getCurrentResult = lang.hitch(this, "removeParamInPatternGrid");
            this.patternContent.addChild(this.patternGrid);
        }
    });
});