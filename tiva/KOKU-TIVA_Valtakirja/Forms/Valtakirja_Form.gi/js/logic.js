kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
    if(kokuServiceEndpoints == null) {
        kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
    }

    return kokuServiceEndpoints.services[serviceName];
}

//Getting the domain name and port if available
function getUrl() {

    var domain = getDomainName();
    //domain = "http://62.61.65.15:8380";
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

function getDomainName() {

    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];

    return domain_name;

}

function intalioPreStart() {
    //Valtakirja_Form.getJSXByName("Tiedot_VastaanottajaDisplay").setValue(Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").getText());
    Valtakirja_Form.getJSXByName("Tiedot_HenkiloDisplay").setValue(Valtakirja_Form.getJSXByName("Tiedot_Henkilo").getText());
}

// Removes HTML-tags.
function escapeHTML(value) {
    if(value !== null && value !== undefined && isNaN(value) && value.replace()) {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
        return value;
    }
}

// Goes through textfields in order to check XSS-vulnerabilities.
function throughTextfields() {
    var temp, value, descendants = [];
    descendants = Valtakirja_Form.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");

    for( i = 0; i < descendants.length; i++) {
        value = Valtakirja_Form.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        Valtakirja_Form.getJSXByName(descendants[i].getName()).setValue(temp);
        Valtakirja_Form.getJSXByName(descendants[i].getName()).repaint();
    }
}

jsx3.lang.Package.definePackage("Intalio.Internal.CustomErrors", function(error) {

    error.getError = function(name) {
        var errortext = Valtakirja_Form.getJSXByName(name).getTip();
        errortext = "Virheelliset tiedot: " + errortext;
        parent.scrollTo(0, 0); // scroll the parent window up
        return errortext;
    };
});

function setReceipientKunpoName(userUid) {
    try {
        var kunpoName = Arcusys.Internal.Communication.GetKunpoUsernameByUid(userUid);
        if (kunpoName != null) {
            var displayName = kunpoName.selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
            Valtakirja_Form.getJSXByName("Tiedot_VastaanottajaDisplay").setValue(displayName);
        }
    } catch (e) {
        alert(e);
    }

}

function handleSend(serviceName, soapMessage) {
    var xmlString = parent.KokuWS.handleSend(serviceName, soapMessage);
    var xmlDoc = new jsx3.xml.Document();
    return xmlDoc.loadXML(xmlString);
}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetKunpoUsernameByUid = function(uid) {

        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getKunpoNameByUserUid><userUid>" + uid + "</userUid></soa:getKunpoNameByUserUid></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetTemplateNames = function() {

        var SEARCH_STRING = "";
        var LIMIT = 100;
        var SERVICE_NAME = "KokuValtakirjaProcessingService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:selaaValtakirjapohjat><searchString>" + SEARCH_STRING + "</searchString><limit>" + LIMIT + "</limit></soa:selaaValtakirjapohjat></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetChildrenOfUser = function(userId) {

        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUsersChildren><userUid>" + userId + "</userUid></soa:getUsersChildren></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserUidByUsername = function(username) {

        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByKunpoName><kunpoUsername>" + username + "</kunpoUsername></soa:getUserUidByKunpoName></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserInfo = function(id) {

        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + id + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserUidByLooraname = function(username) {

        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByLooraName><looraUsername>" + username + "</looraUsername></soa:getUserUidByLooraName></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});

function getTaskSubscribe() {
    Intalio.Internal.Utilities.SERVER.subscribe(Intalio.Internal.Utilities.GET_TASK_SUCCESS, prepareForm);
};

function prepareForm() {
    // alert("prepareForm");
    // var username = Intalio.Internal.Utilities.getUser();

    // form1.getJSXByName("User_Sender").setValue(Intalio.Internal.Utilities.getUser()).repaint();

    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\") + 1));
    
    try {
        uidData = Arcusys.Internal.Communication.GetUserUidByUsername(username);
        uid = uidData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
        Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(uid);
        userRealName = getUserRealName(uid);
        Valtakirja_Form.getJSXByName("Tiedot_LahettajaDisplay").setValue(userRealName).repaint();
        //Valtakirja_Form.getJSXByName("Tiedot_LahettajaDisplay").setEnabled(jsx3.gui.Form.STATEDISABLED).repaint();
    } catch(e) {
        alert(e);
    }

    try {

        // Add form preload functions here.
        var templateNamesData = Arcusys.Internal.Communication.GetTemplateNames();
        //Arcusys.Internal.Communication.GerLDAPUser();

        if(templateNamesData != null) {
            mapTemplateNamesToField(templateNamesData);
        }
    } catch (e) {
        alert(e);
    }

    try {

        // Add form preload functions here.
        // alert(Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").getValue());
        var childrenData = Arcusys.Internal.Communication.GetChildrenOfUser(Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").getValue());
        // alert(childrenData);
        //Arcusys.Internal.Communication.GerLDAPUser();

        if(childrenData != null) {
            mapChildrenNamesToField(childrenData);
            createXMLDocumentForCache(childrenData, "propsResults_xml");
        }
    } catch (e) {
        alert(e);
    }

}

function getUserRealName(uid) {
    var userData, firstname, lastname;
    userData = Arcusys.Internal.Communication.GetUserInfo(uid);
    if(userData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'") && userData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'")) {
        firstname = userData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
        lastname = userData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
        return firstname + " " + lastname;
    } else {
        return null;
    }
}

function listChildsParents(childId) {

    // alert(Valtakirja_Form.getCache().getDocument("propsResults_xml"));
    var childData = Valtakirja_Form.getCache().getDocument("propsResults_xml").selectSingleNode("//child[uid='" + childId + "']", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");
    //alert(childData);
    createXMLDocumentForCache(childData, "propsResultsChild_xml");
    // alert(childData);
    descendants = Valtakirja_Form.getCache().getDocument("propsResultsChild_xml").selectNodeIterator("//parents", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");
    //alert(descendants);

    //  var descendants = childDataFile.selectNodeIterator("//parents", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");
    // alert(descendants);

    var personId, personDescription;
    var xmlForSelectBox = "<data>";

    while(descendants.hasNext()) {
        childNode = descendants.next();
        // alert(childNode);
        // alert(childNode);
        // requestTemplateId = childNode.getAttributeNode("return");
        personName = childNode.getFirstChild().getValue();
        // alert(personName);
        // requestTemplateId = childNode.selectSingleNode("//requestTemplateId").getValue();
        // alert(templateId);
        personId = childNode.getLastChild().getValue();
        // alert(personId);
        //alert(templateName);
        // subject = childNode.selectSingleNode("//subject").getValue();
        //alert(templateDescription);
        xmlForSelectBox = xmlForSelectBox + "<record jsxid=\"" + personId + "\" jsxtext=\"" + personName + "\"/>";

        // alert(requestTemplateId + subject);
        personId = "";
        personName = "";
        childNode = null;
    }
    xmlForSelectBox = xmlForSelectBox + "</data>";

    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").setXMLString(xmlForSelectBox);
    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").resetXmlCacheData();
    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").repaint();

    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").setDefaultText("- Valitse -").repaint();
    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").setValue(null).repaint();
}

function createXMLDocumentForCache(documentData, documentName) {
    Valtakirja_Form.getCache().getDocument(documentName).loadXML(documentData);

    // alert(Valtakirja_Form.getCache().getDocument("propsResults_xml").loadXML(documentData));
    // alert(Valtakirja_Form.getCache().getDocument("propsResults_xml"));

}

function parseXML(xmlData, rootName, childlist) {
    var i, j, attributes, node, childNode, childChildNode, childs;
    i = 0;
    attributes = [];
    childs = xmlData.selectNodeIterator("/\/" + rootName);

    while(childs.hasNext()) {

        attributes[i] = [];
        node = childs.next();
        if(node == null) {
            break;
        }
        for( j = 0; j < (childlist.length + 2); j++) {
            childNode = node.getFirstChild();
            while(childNode != null) {
                if(childNode.getNodeName() == childlist[j]) {
                    attributes[i][j] = childNode.getValue();
                    break;
                }
                childNode = childNode.getNextSibling();
            }
        }
        i++;
    }

    return valuesToArray(attributes);
}

/**
 * Compresesses multidimensional array to sigle dimensional
 * Users information comma seperated. One user/node.
 */
function valuesToArray(attributes) {
    var tempArray, i, j, line;
    tempArray = [];

    for( i = 0; i < attributes.length; i++) {
        line = "";
        for( j = 0; j < attributes[i].length; j++) {
            line = line + attributes[i][j];
            if(j < (attributes[i].length - 1 )) {
                line = line + ",";

            }

        }
        tempArray[i] = line;

    }
    return tempArray;
}

function mapChildrenNamesToField(data) {
    var i = 0, childData = [], childAttributes = [];

    var attributes = getDataString(data.selectNodeIterator("//child", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'"));

    var xmlForSelectBox = "<data>";

    for (i = 0; i < attributes.length; i++) {
        xmlForSelectBox = xmlForSelectBox + "<record jsxid=\"" + attributes[i].uid + "\" jsxtext=\"" + attributes[i].firstname + " " + attributes[i].lastname + "\"/>";
    }
    xmlForSelectBox = xmlForSelectBox + "</data>";

    Valtakirja_Form.getJSXByName("Tiedot_Henkilo").setXMLString(xmlForSelectBox);
    Valtakirja_Form.getJSXByName("Tiedot_Henkilo").resetXmlCacheData();
    Valtakirja_Form.getJSXByName("Tiedot_Henkilo").repaint();

}

function getDataString(nodeIterator) {
    var attributes = [], i = 0, node, childNode, nodeName, depth = 0;

    while(nodeIterator.hasNext()) {
        node = nodeIterator.next();
        attributes[i] = [];
        childNode = node.getFirstChild();
        while(childNode) {
            if(childNode.getFirstChild()) {
                childNode = childNode.getFirstChild();
                depth = depth + 1;
            }
            nodeName = childNode.getNodeName();
            if(depth > 0) {
                nodeName = childNode.getParent().getNodeName() + "_" + nodeName;
            }

            if(attributes[i][nodeName]) {
                attributes[i][nodeName] += ",";
            } else {
                attributes[i][nodeName] = "";
            }
            attributes[i][nodeName] += childNode.getValue();

            while(!childNode.getNextSibling() && depth > 0) {
                childNode = childNode.getParent();
                depth = depth - 1;
            }
            childNode = childNode.getNextSibling();
        }
        i = i + 1;
    }

    return attributes;
}

function mapTemplateNamesToField(data) {
    var xmlForSelectBox, templates, i;
    xmlForSelectBox = "<data>";
    templates = returnArray(data, "valtakirjapohjat");

    for( i = 0; i < templates.length; i++) {
        xmlForSelectBox += "<record jsxid=\"" + templates[i]["templateId"] + "\" jsxtext=\"" + templates[i]["templateName"] + "\" jsxdesc=\"" + templates[i]["description"] + "\" jsxvalid=\"" + templates[i]["validTillMandatory"] + "\" jsxconsent=\"" + templates[i]["consentsOnly"] + "\" jsxguardian=\"" + templates[i]["toSecondGuardianOnly"] + "\"\/>";
    }
    xmlForSelectBox += "</data>";

    Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").setXMLString(xmlForSelectBox);
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").resetXmlCacheData();
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").repaint();
}

function returnArray(data, nodeName) {
    var nodeIterator, nodeArray = [], i = 0;
    nodeIterator = data.selectNodeIterator("//" + nodeName, "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");

    while(nodeIterator.hasNext()) {
        node = nodeIterator.next();
        if(node.getFirstChild()) {
            childNode = node.getFirstChild();
            nodeArray[i] = [childNode.getNodeName()];
            while(childNode) {
                if(childNode.getValue()) {
                    nodeArray[i][childNode.getNodeName()] = childNode.getValue();
                }
                childNode = childNode.getNextSibling();
            }
            i++;
        }
    }

    return nodeArray;
}

function changeMandateTemplate() {
    var templateID = Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getValue();
    var templateName = Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getText();
    var templateDesc = Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getXML().getFirstChild().selectSingleNode("//record[@jsxid='" + templateID + "']").getAttribute("jsxdesc");

    if(Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getXML().getFirstChild().selectSingleNode("//record[@jsxid='" + templateID + "']").getAttribute("jsxvalid") == "true") {
        Valtakirja_Form.getJSXByName("Tiedot_Voimassa").setRequired(1);
    } else {
        Valtakirja_Form.getJSXByName("Tiedot_Voimassa").setRequired(0);
    }

    Valtakirja_Form.getJSXByName("Tiedot_Voimassa").getParent().repaint();

    Valtakirja_Form.getJSXByName("labelValtakirjaKuvaus").setText(templateDesc).repaint();

    Valtakirja_Form.getJSXByName("Valtakirjapohja_Id").setValue(templateID);
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Nimi").setValue(templateName);
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Kuvaus").setValue(templateDesc);
}

// USE: checkDateNotBefore(newDATE, getTodayDateFinnish());
function checkDateNotBefore(dateValue, dateNotBefore) {
    // alert(dateValue);

    //dateValue = dateValue.toString();
    // alert(dateValue.getDate() + " " + dateValue.getMonth() + " " + dateValue.getyear());

    var dayValue = dateValue.getDate();
    var monthValue = dateValue.getMonth() + 1;
    var yearValue = dateValue.getFullYear();
    // var dayValue = dateValue.substring(0, 2);
    // var monthValue = dateValue.substring(3, 5);
    // var yearValue = dateValue.substring(6, 10);
    //  alert(dayValue + " " + monthValue + " " + yearValue);

    var dayNotBefore = dateNotBefore.substring(0, 2);
    var monthNotBefore = dateNotBefore.substring(3, 5);
    var yearNotBefore = dateNotBefore.substring(6, 10);
    //alert(dayNotBefore + " " + monthNotBefore + " " + yearNotBefore);

    dateObjectValue = new Date(yearValue, monthValue - 1, dayValue);
    dateObjectNotBefore = new Date(yearNotBefore, monthNotBefore - 1, dayNotBefore);

    // alert(dateObjectValue.toString() + " " + dateObjectNotBefore.toString());

    if(dateObjectValue < dateObjectNotBefore) {
        alert("P" + unescape("%E4") + "iv" + unescape("%E4") + "m" + unescape("%E4%E4") + "r" + unescape("%E4") + " ei voi olla ennen t" + unescape("%E4") + "t" + unescape("%E4") + " p" + unescape("%E4") + "iv" + unescape("%E4%E4"));
        return false;
    }

    return true;
}

function getTodayDateFinnish() {
    rawDate = new Date()// Create a Date Object set to the last modified date
    year = rawDate.getFullYear()// Get full year (as opposed to last two digits only)
    month = rawDate.getMonth() + 1// Get month and correct it (getMonth() returns 0 to 11)
    day = rawDate.getDate()// Get date within month
    if(year < 1970)
        year = year + 100;
    // millennium bug
    yearString = new String(year)// Convert year, month and date to strings
    monthString = new String(month)
    dayString = new String(day)
    if(monthString.length == 1)
        monthString = "0" + monthString;
    // Add leading zeros to month and date if required
    if(dayString.length == 1)
        dayString = "0" + dayString;
    dateString = dayString + "." + monthString + "." + yearString;
    return dateString;
}
