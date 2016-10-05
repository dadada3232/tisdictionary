var soap = require('soap');
var config = require('../config');
var log = require('./log')(module);

function getHeader(sguid) {
    var header = '<tns:SessionSOAPHeader xmlns="' + config.get('ws:xmlns') + '">';
    header += '<tns:GUIDSession>' + sguid + '</tns:GUIDSession>';
    header += '<tns:GUIDModule>' + config.get('ws:mguid') + '</tns:GUIDModule>';
    header += '</tns:SessionSOAPHeader>';
    return header;
}

/**
 * Функция для работы с веб-сервисами ТИС-Админ
 *
 * Пример работы с функцией get(null, "aboutWebServicesTis", null, args,  function(result){console.log(result);});
 *
 * @param mode Если значение "db", то работает с веб-сервисом для баз данных
 * Если любое другое значение, то со стандартным.
 * @param name Имя метода в веб-сервисах.
 * @param sguid Сессионная переменная, должна быть получена при авторизации в системе ТИС-АДМИН, не требуется лишь для
 * нескольких методов
 * @param args Аргументы передаваемые в тело SOAP запроса, пример
 //       var args = {
 //           "ModuleGuid" : "58fa1bb3-88f0-48ad-9267-3234eb539292",
 //           "CollectionName" : "cards",
 //           "JSONquery" : "{_id: ObjectId(\"" + id + "\")}",
 //           "skip" : 0,
 //           "limit" : 50,
 //           "DescreamingOrder" : true,
 //           "OrderParam" : "_id"
 //       }
 //        <soap:Body>
 //        <tns:MongoSelect xmlns:tns="http://tissystem.ru.alias.hostingasp.ru/" xmlns="http://tissystem.ru.alias.hostingasp.ru/">
 //        <tns:ModuleGuid>58fa1bb3-88f0-48ad-9267-3234eb539292</tns:ModuleGuid>
 //        <tns:CollectionName>cards</tns:CollectionName>
 //        <tns:JSONquery>{_id: ObjectId("55198cb0ccbc450f78ce7132")}</tns:JSONquery>
 //        <tns:skip>0</tns:skip>
 //        <tns:limit>50</tns:limit>
 //        <tns:DescreamingOrder>true</tns:DescreamingOrder>
 //        <tns:OrderParam>_id</tns:OrderParam>
 //        </tns:MongoSelect>
 //        </soap:Body>
 * @param callback - Функуция в которую приходит результат
 */
function get(mode, name, sguid, args, callback) {
    if (mode == "db") {
        mode = config.get('ws:tiscatalogserver')
    } else {
        mode = config.get('ws:adminservice')
    }
    soap.createClient(mode, function (err, client) {
        client.addSoapHeader(getHeader(sguid));
        client[name](args, function (err, results) {
            try {
                callback(results);
            } catch (err) {
                log.error("Invalid SOAP request", err);
            }
        });
    });
}

exports.get = get;