/* place JavaScript code here */
function getUrl() {
    //var url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";
    //var url = "http://62.61.65.16:8380/palvelut-portlet/ajaxforms//WsProxyServlet2";

    
    var domain = getDomainName();
    var port = getPortNumber();
    
    var url = "http://" + domain + ":" + port + "/palvelut-portlet/ajaxforms/WsProxyServlet2";
    return url;
    
}


function getDomainName() {

    var url = window.location.href;
   // alert(url);
    var url_parts = url.split("/");
   // alert(url_parts);
    var domain_name_parts = url_parts[2].split(":");
   // alert(domain_name_parts);
    var domain_name = domain_name_parts[0];
    
    return domain_name;

}


function getPortNumber() {
    
    var url = window.location.href;
    
    var url_parts = url.split("/");
    
    var domain_name_parts = url_parts[2].split(":");
    
    var port_number = domain_name_parts[1];
    
    return port_number;

}


function prepareForm() {

    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("/") + 1));

    KayttajaviestintaForm.getJSXByName("Message_FromUser").setValue(username);
    KayttajaviestintaForm.getJSXByName("Message_FromUser").setEnabled(jsx3.gui.Form.STATEDISABLED).repaint();
}

function getTaskSubscribe() {
    Intalio.Internal.Utilities.SERVER.subscribe(
    Intalio.Internal.Utilities.GET_TASK_SUCCESS, prepareForm);
};

function mapSelectedRecipientsToMatrix() {

    var node, hasEmptyChild, jsxid, childIterator, group, uid, groupUid, childNode, xmlData, list, userData, i;

    hasEmptyChild = false;
    jsxid = 0;

    childIterator = KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getChildIterator();

    if (KayttajaviestintaForm.getCache().getDocument("receipients-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("matrix1").commitAutoRowSession();
        hasEmptyChild = true;
    }
    while (childIterator.hasNext()) {

        childNode = childIterator.next();

        group = childNode.getAttribute("group");

        if (group != 0) {

            groupUid = childNode.getAttribute("uid");

            xmlData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);

            list = ["uid"];
            userData = parseXML(xmlData, "user", list);

            for (i = 0; i < userData.length; i++) {
                uid = userData[i];

                node = KayttajaviestintaForm.getCache().getDocument("receipients-nomap").getFirstChild().cloneNode();
                node.setAttribute("jsxid", jsxid);
                node.setAttribute("receipient", uid);
                KayttajaviestintaForm.getCache().getDocument("receipients-nomap").insertBefore(node);
                jsxid++;

            }
        } else {
            uid = childNode.getAttribute("uid");
            node = KayttajaviestintaForm.getCache().getDocument("receipients-nomap").getFirstChild().cloneNode();

            node.setAttribute("jsxid", jsxid);
            node.setAttribute("receipient", uid);
            KayttajaviestintaForm.getCache().getDocument("receipients-nomap").insertBefore(node);
            jsxid++;

        }

    }

    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("receipients-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("receipients-nomap").getFirstChild());
    }
}


function intalioPreStart() {

    mapSelectedRecipientsToMatrix();

}

function switchSearchMode(mode) {

    if (mode == "groups") {
        KayttajaviestintaForm.getJSXByName("Haku_Kayttajat").setDisplay("none").repaint();
        KayttajaviestintaForm.getJSXByName("Haku_Ryhmat").setDisplay("block").repaint();

        KayttajaviestintaForm.getJSXByName("HaeKayttajia_Checkbox1").setChecked(0).repaint();
        KayttajaviestintaForm.getJSXByName("HaeRyhmia_Checkbox1").setChecked(1).repaint();
        KayttajaviestintaForm.getJSXByName("HaeKayttajia_Checkbox2").setChecked(0).repaint();
        KayttajaviestintaForm.getJSXByName("HaeRyhmia_Checkbox2").setChecked(1).repaint();

    }

    if (mode == "users") {
        KayttajaviestintaForm.getJSXByName("Haku_Kayttajat").setDisplay("block").repaint();
        KayttajaviestintaForm.getJSXByName("Haku_Ryhmat").setDisplay("none").repaint();

        KayttajaviestintaForm.getJSXByName("HaeKayttajia_Checkbox1").setChecked(1).repaint();
        KayttajaviestintaForm.getJSXByName("HaeRyhmia_Checkbox1").setChecked(0).repaint();
        KayttajaviestintaForm.getJSXByName("HaeKayttajia_Checkbox2").setChecked(1).repaint();
        KayttajaviestintaForm.getJSXByName("HaeRyhmia_Checkbox2").setChecked(0).repaint();
    }

}


function searchGroup(searchString) {

    var entryFound, node, i, hasEmptyChild, splits, list, xmlData, groupData;

    if (searchString == "") {
        alert("Syota hakusana");
        return;
    }

    searchString = searchString.toLowerCase();
    entryFound = false;

    if (KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild() != null) {
        KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").removeChildren();
        KayttajaviestintaForm.getJSXByName("searchGroupMatrix").repaintData();

    }

    hasEmptyChild = false;

    xmlData = Arcusys.Internal.Communication.GetGroups(searchString);

    list = ["groupName", "groupUid"];
    groupData = parseXML(xmlData, "group", list);

    if (KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("searchGroupMatrix").commitAutoRowSession();
        hasEmptyChild = true;

    }

    for (i = 0; i < groupData.length; i++) {

        splits = groupData[i].split(",");

        entryFound = true;

        node = KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", i);
        node.setAttribute("nimi", splits[0]);
        node.setAttribute("uid", splits[1]);

        KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").insertBefore(node);

    }

    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild());
    }
    KayttajaviestintaForm.getJSXByName("searchGroupMatrix").repaintData();

    if (entryFound == false) {
        alert ("Valitettavasti antamallasi hakusanalla ei loytynyt tuloksia");
    }
}

function listGroupUsers() {

    var node, i, hasEmptyChild, childIterator, childNode, selected, groupUid, personInfo, xmlData, list, userData;

    if (KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild() != null) {
        KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").removeChildren();
        KayttajaviestintaForm.getJSXByName("listGroupUsersMatrix").repaintData();
    }

    hasEmptyChild = false;

    if (KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("listGroupUsersMatrix").commitAutoRowSession();
        hasEmptyChild = true;

    }

    childIterator = KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getChildIterator();

    while (childIterator.hasNext()) {
        //node = KayttajaviestintaForm.getCache().getDocument("receipients-nomap").getFirstChild().cloneNode();

        childNode = childIterator.next();
        selected = childNode.getAttribute("valittu");

        if ((selected != 0) && (selected != null)) {
            groupUid = childNode.getAttribute("uid");

            xmlData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);

            list = ["firstname", "lastname", "phoneNumber", "email"];
            userData = parseXML(xmlData, "user", list);

            for (i = 0; i < userData.length; i++) {
                personInfo = userData[i].split(',');

                node = KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild().cloneNode();

                node.setAttribute("jsxid", i);
                node.setAttribute("etunimi", personInfo[0]);
                node.setAttribute("sukunimi", personInfo[1]);
                node.setAttribute("puhelin", personInfo[2]);
                node.setAttribute("sahkoposti", personInfo[3]);
                node.setAttribute("valittu", 0);
                KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").insertBefore(node);

            }
        }

    }

    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild());
    }
    KayttajaviestintaForm.getJSXByName("listGroupUsersMatrix").repaintData();

}

function searchNames(searchString) {
    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = false;
    hasEmptyChild = false;

    if (searchString == "") {
        alert("Syota hakusana");
        return;
    }

    searchString = searchString.toLowerCase();
    if (KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild() != null) {
        KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChildren();
        KayttajaviestintaForm.getJSXByName("searchMatrix").repaintData();

    }

    if (KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("searchMatrix").commitAutoRowSession();
        hasEmptyChild = true;

    }

    xmlData = Arcusys.Internal.Communication.GetUsers(searchString);

    list = ["firstname", "lastname", "phoneNumber", "email", "uid"];
    userData = parseXML(xmlData, "user", list);

    for (i = 0; i < userData.length; i++) {

        personInfo = userData[i].split(',');

        entryFound = true;
        node = KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", i);
        node.setAttribute("etunimi", personInfo[0]);
        node.setAttribute("sukunimi", personInfo[1]);
        node.setAttribute("puhelin", personInfo[2]);
        node.setAttribute("sahkoposti", personInfo[3]);
        node.setAttribute("uid", personInfo[4]);

        KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").insertBefore(node);

    }

    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild());
    }

    KayttajaviestintaForm.getJSXByName("searchMatrix").repaintData();
    if (entryFound == false) {
        alert ("Valitettavasti antamallasi hakusanalla ei loytynyt tuloksia");
    }

}

function addToRecipients() {
    var counter, node, i, hasEmptyChild, chosen, childIterator, uid, firstname, lastname, childNode;

    counter = KayttajaviestintaForm.getJSXByName("recipientCounter").getValue();
    i = 0;
    hasEmptyChild = false;

    childIterator = KayttajaviestintaForm.getCache().getDocument("HaetutVastaanottajat-nomap").getChildIterator();
    if (KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("dummyMatrix").commitAutoRowSession();
        hasEmptyChild = true;
    }

    while (childIterator.hasNext()) {

        childNode = childIterator.next();

        chosen = childNode.getAttribute("valittu");

        if ((chosen != null) && (chosen != 0)) {

            node = KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

            uid = childNode.getAttribute("uid");
            firstname = childNode.getAttribute("etunimi");
            lastname = childNode.getAttribute("sukunimi");

            node.setAttribute("jsxid", counter);
            node.setAttribute("receipient", firstname + " " + lastname);
            node.setAttribute("uid", uid);
            node.setAttribute("group", 0);
            KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;

        }

    }
    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    KayttajaviestintaForm.getJSXByName("dummyMatrix").repaintData();
    KayttajaviestintaForm.getJSXByName("recipientCounter").setValue(counter);

}

function addGroupsToRecipients() {
    var counter, node, hasEmptyChild, valittu, childIterator, groupUid, childNode, groupname;
    counter = KayttajaviestintaForm.getJSXByName("recipientCounter").getValue();
    hasEmptyChild = false;

    childIterator = KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getChildIterator();
    if (KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("dummyMatrix").commitAutoRowSession();
        hasEmptyChild = true;
    }

    while (childIterator.hasNext()) {
        childNode = childIterator.next();

        valittu = childNode.getAttribute("valittu");
        groupUid = childNode.getAttribute("uid");

        if ((valittu != null) && (valittu != 0)) {

            node = KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

            groupname = childNode.getAttribute("nimi");
            node.setAttribute("jsxid", counter);
            node.setAttribute("receipient", groupname);
            node.setAttribute("uid", groupUid);
            node.setAttribute("group", 1);
            KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;

        }

    }
    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }

    KayttajaviestintaForm.getJSXByName("dummyMatrix").repaintData();
    KayttajaviestintaForm.getJSXByName("recipientCounter").setValue(counter);

}


function listGroupUsers() {

    var node, i, hasEmptyChild, childIterator, childNode, selected, groupUid, personInfo, xmlData, list, userData;

    if (KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild() != null) {
        KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").removeChildren();
        KayttajaviestintaForm.getJSXByName("listGroupUsersMatrix").repaintData();
    }

    hasEmptyChild = false;

    if (KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild() == null) {
        KayttajaviestintaForm.getJSXByName("listGroupUsersMatrix").commitAutoRowSession();
        hasEmptyChild = true;

    }

    childIterator = KayttajaviestintaForm.getCache().getDocument("HaetutRyhmat-nomap").getChildIterator();

    while (childIterator.hasNext()) {
        //node = KayttajaviestintaForm.getCache().getDocument("receipients-nomap").getFirstChild().cloneNode();

        childNode = childIterator.next();
        selected = childNode.getAttribute("valittu");

        if ((selected != 0) && (selected != null)) {
            groupUid = childNode.getAttribute("uid");

            xmlData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);

            list = ["firstname", "lastname", "phoneNumber", "email"];
            userData = parseXML(xmlData, "user", list);

            for (i = 0; i < userData.length; i++) {
                personInfo = userData[i].split(',');

                node = KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild().cloneNode();

                node.setAttribute("jsxid", i);
                node.setAttribute("etunimi", personInfo[0]);
                node.setAttribute("sukunimi", personInfo[1]);
                node.setAttribute("puhelin", personInfo[2]);
                node.setAttribute("sahkoposti", personInfo[3]);
                node.setAttribute("valittu", 0);
                KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").insertBefore(node);

            }
        }

    }

    if (hasEmptyChild == true) {
        KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").removeChild(KayttajaviestintaForm.getCache().getDocument("GroupUserList-nomap").getFirstChild());
    }
    KayttajaviestintaForm.getJSXByName("listGroupUsersMatrix").repaintData();

}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUsers = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;

        tout = 1000;
        limit = 100;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchUsers><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchUsers></soapenv:Body></soapenv:Envelope>";

        url = getUrl();

        // ARCUSYS INTRA PROXY
        //url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";

        // IXONOS DEMO PROXY
        //url = "http://62.61.65.16:8380/palvelut-portlet/ajaxforms//WsProxyServlet2";

        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetGroups = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;

        tout = 1000;
        limit = 100;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchGroups><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchGroups></soapenv:Body></soapenv:Envelope>";

        url = getUrl();

        // ARCUSYS INTRA PROXY
        //url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";

        // IXONOS DEMO PROXY
        //url = "http://62.61.65.16:8380/palvelut-portlet/ajaxforms//WsProxyServlet2";

        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetGroupUsers = function(groupUid) {

        var tout, msg, endpoint, url, req, objXML;

        tout = 1000;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUsersByGroupUid><groupUid>" + groupUid + "</groupUid></soa:getUsersByGroupUid></soapenv:Body></soapenv:Envelope>";

        url = getUrl();

        // ARCUSYS INTRA PROXY
        //url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";

        // IXONOS DEMO PROXY
        //url = "http://62.61.65.16:8380/palvelut-portlet/ajaxforms//WsProxyServlet2";

        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }

    };
});

/**
 * Parses given xml data.
 * param: xmlData - XML data to parse.
 * param: rootName - Root field name
 * param: childlist - Names of root nodes childrens.
 *
 * return Array of users
 *
 */
function parseXML(xmlData, rootName, childlist) {

    var i, j, attributes, node, childNode, childs;
    i = 0;

    attributes = [];

    childs = xmlData.selectNodeIterator("/\/" + rootName);

    while (childs.hasNext()) {

        attributes[i] = [];
        node = childs.next();
        if (node == null) {
            break;
        }

        for (j = 0; j < childlist.length; j++) {
            childNode = node.getFirstChild();
            while (childNode != null) {

                if (childNode.getNodeName() == childlist[j]) {
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

    for (i = 0; i < attributes.length; i++) {
        line = "";
        for (j = 0; j < attributes[i].length; j++) {
            line = line + attributes[i][j];
            if (j < (attributes[i].length - 1 )) {
                line = line + ",";

            }

        }
        tempArray[i] = line;

    }
    return tempArray;
}