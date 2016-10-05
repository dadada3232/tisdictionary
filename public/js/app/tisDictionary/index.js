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

    "dojo/text!./templates/index.html",
    "dojo/i18n!./nls/message",

    "tisDictionary/pattern",
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
             pattern,
             commonGrid) {
    return declare("index", [
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin], {

        templateString: template,

        _nls: nls,

        copyright: string.substitute(nls.copyright, [new Date().getFullYear()]),

        postCreate: function () {
            this.mainContent.addChild(new commonGrid({mode: this._getMode()}));

            var initMode = lang.hitch(this, "initMode"); // todo исправить полосы прокрутки
            setTimeout(function () {
                initMode();
            }, 100);
        },

        _destroy: function () {
            this.mainContent.destroyDescendants();
        },

        initMode: function (node) {
            var mode = this._getMode(node);
            this._destroy();
            this.mainContent.addChild(new commonGrid({mode: mode, index: this}));
        },

        initPattern: function (patternItem) {
            this._destroy();
            this.mainContent.addChild(new pattern({patternItem: patternItem}));
        },

        _chooseMode: function (mode) {
            var newMode = "";
            switch (mode) {
                case nls.menuParam:
                    newMode = "param";
                    break;
                case nls.menuClassifier:
                    newMode = "classifier";
                    break;
                case nls.menuDomain:
                    newMode = "domain";
                    break;
                case nls.menuDimension:
                    newMode = "dimension";
                    break;
                case nls.menuType:
                    newMode = "type";
                    break;
                case nls.menuPattern:
                    newMode = "pattern";
                    break;
                case nls.menuSystemDomain:
                    newMode = "systemDomain";
                    break;
                default:
                    newMode = "param";
            }
            return newMode;
        },

        _getMode: function (node) {
            var inMode = (node) ? node.target.innerHTML.trim() : "";
            return this._chooseMode(inMode);
        }
    });
});