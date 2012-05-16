var kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
    if(kokuServiceEndpoints == null) {
        kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
    }
    return kokuServiceEndpoints.services[serviceName];
}

function intalioPreStart() {
    mapSelectedValuesToMatrix();
    setRoles();
}

 function formatDataCache(cache, matrix) {
    if (TivaTietopyyntoForm.getCache().getDocument(cache).getFirstChild() == null) {
       commitCustomAutoRowSession(matrix, cache);
        return true;
    }
    else {
        return false;
    }
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
    descendants = TivaTietopyyntoForm.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");

    for( i = 0; i < descendants.length; i++) {
        value = TivaTietopyyntoForm.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        TivaTietopyyntoForm.getJSXByName(descendants[i].getName()).setValue(temp);
        TivaTietopyyntoForm.getJSXByName(descendants[i].getName()).repaint();
    }
}

function commitCustomAutoRowSession(matrix, cache) {
    var nodes, xmlStr;

    nodes = TivaTietopyyntoForm.getJSXByName(matrix).getChildren();
    xmlStr = "<data jsxid=\"jsxroot\"><record jsxid=\"\"";

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && nodes[i].getPath() != "jsxid") {
            xmlStr += " " + nodes[i].getPath() + "=\"\"";
        }
    }
    xmlStr += "/></data>";
    TivaTietopyyntoForm.getCache().getDocument(cache).loadXML(xmlStr);
}


function setRoles() {

    var roleUsers;
    var roleUid;
    var temp;
    temp = TivaTietopyyntoForm.getJSXByName("Perustiedot_Extend02").getValue();

    if(temp) {
        roleUid = TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja_UID").getValue();
        roleData = getRoleUsers(roleUid, "username");
        TivaTietopyyntoForm.getJSXByName("Perustiedot_Extend01").setValue(roleData[0]);
        TivaTietopyyntoForm.getJSXByName("Perustiedot_Extend03").setValue(roleData[1]);
        TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja_UID").setValue("");
    }

}

function getRoleUsers(roleUid, nodeName) {
    var xmlData, list, userData, users = [];

    users[0] = "";
    users[1] = "";
    xmlData = Arcusys.Internal.Communication.GetRoleUsers(roleUid);
    userNames = xmlData.selectNodeIterator("//username", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");

    while(userNames.hasNext()) {
        node = userNames.next();

        users[0] += "koku/" + node.getValue();
        userIdData = Arcusys.Internal.Communication.GetSenderUid(node.getValue());

        users[1] += userIdData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();

        if(userNames.hasNext()) {
            users[0] += ",";
            users[1] += ",";
        }

    }

    return users;

}

function getDomainName() {

    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];

    return domain_name;

}

function getUrl() {
    var domain = getDomainName();
    if(domain.search("file") != -1) {
        domain = "http://62.61.65.15:8380"
    }
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

function mapSelectedValuesToMatrix() {

    var rootnode = TivaTietopyyntoForm.getCache().getDocument("Kategoriat-nomap");
    var selected = new Array;

    traverse(rootnode, selected);

    if(selected.length != 0) {
        var node, i = 0;
        var hasEmptyChild = false;

        hasEmptyChild = formatDataCache("Havainnointitiedot-nomap", "Havainnointitiedot");

        for( i = 0; i < selected.length; i++) {
            node = TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").getFirstChild().cloneNode();

            //node.setAttribute("jsxid",i);
            if((selected[i].getAttribute("jsxselected") != null) && (selected[i].getAttribute("jsxopen") == null)) {
                node.setAttribute("Havannointitiedot_Valitut", selected[i].getAttribute("jsxid"));
                TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").insertBefore(node);
            } else if((selected[i].getAttribute("jsxselected") == null) && (selected[i].getAttribute("jsxopen") != null)) {
                node.setAttribute("Havannointitiedot_Avattu", selected[i].getAttribute("jsxid"));
                TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").insertBefore(node);
            } else {
                node.setAttribute("Havannointitiedot_Valitut", selected[i].getAttribute("jsxid"));
                node.setAttribute("Havannointitiedot_Avattu", selected[i].getAttribute("jsxid"));
                TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").insertBefore(node);
            }

            //TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").insertBefore(node);

        }

        if(hasEmptyChild == true) {
            TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").removeChild(TivaTietopyyntoForm.getCache().getDocument("Havannointitiedot-nomap").getFirstChild());
        }
    }

}

function getIntalioUser() {
    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("/") + 1));
    return username;
}

/**
 * Operations to load before form is shown to user
 */
function preload() {
    var username = getIntalioUser();
    uidData = Arcusys.Internal.Communication.GetSenderUid(username);
    uid = uidData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
    userRealName = getUserRealName(uid);
    TivaTietopyyntoForm.getJSXByName("Perustiedot_Lahettaja_UID").setValue(uid);
    TivaTietopyyntoForm.getJSXByName("Perustiedot_Lahettaja").setValue(userRealName);
    preloadCategories();

}

function getUserRealName(uid) {
    var userData, firstname, lastname;
    userData = Arcusys.Internal.Communication.getUserInfo(uid);
    if(userData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'") && userData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'")) {
        firstname = userData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
        lastname = userData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
        return firstname + " " + lastname;
    } else {
        return null;
    }
}

/**
 * Function gets checkbox status and changes field visibility in answer section.
 * param: checked - checkbox status (true/false)
 *
 */
function showFreeTextArea(checked) {

    if(checked == true) {
        TivaTietopyyntoForm.getJSXByName("vastausLayout (--)").setRows("20%,20%,3%,5%,7%,3%,5%,5%,19%,3%,5%,5%", true);
        TivaTietopyyntoForm.getJSXByName("vastausPanel").setHeight("700", true);
        TivaTietopyyntoForm.getJSXByName("paneFreeText").setDisplay("block").repaint();
    } else {
        TivaTietopyyntoForm.getJSXByName("vastausLayout (--)").setRows("24.5%,24.5%,4%,6%,7%,4%,6%,6%,2%,4%,6%,6%", true);
        TivaTietopyyntoForm.getJSXByName("vastausPanel").setHeight("600", true);
        TivaTietopyyntoForm.getJSXByName("paneFreeText").setDisplay("none").repaint();

    }
}

/**
 * Function goes through the whole observation selections tree.
 * param: parentNode - At the beginning it is the root node.
 * param: selected - empty collection where to store selected values.
 *
 */
function traverse(parentNode, selected) {
    var node;
    for( node = parentNode.getFirstChild(); node != null; node = node.getNextSibling()) {
        //alert(node.getAttribute("jsxid"));
        var select = node.getAttribute("jsxselected");
        var open = node.getAttribute("jsxopen");
        //node has "selected" attribute --> node will pushed at the end of array.
        if((select != null) || (open != null)) {
            selected.push(node);

        }
        traverse(node, selected);

    }

}

jsx3.lang.Package.definePackage("Intalio.Internal.CustomErrors", function(error) {

    error.getError = function(name) {
        var errortext = TivaTietopyyntoForm.getJSXByName(name).getTip();
        errortext = "Puuttuvat tiedot: " + errortext;
        return errortext;
    };
});
function makeSearch(searchString) {
    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = false;
    hasEmptyChild = false;

    if(searchString == "") {
        alert("Sy" + unescape("%F6") + "t" + unescape("%E4") + " hakusana");

    }
    //searchString = searchString.toLowerCase();

    if(searchNames(searchString) == false) {
        if(searchRoles(searchString) == false) {
            alert("Valitettavasti antamallasi hakusanalla ei l" + unescape("%F6") + "ytynyt tuloksia");
        }
    }
}

function searchRoles(searchString) {

    var node, hasEmptyChild, entryFound, rolesData, i, xmlData, roleInfo, list;
    entryFound = false;
    hasEmptyChild = false;

    if(searchString == "") {
        return false;
    }

    if(TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild() != null) {
        TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChildren();
        TivaTietopyyntoForm.getJSXByName("searchMatrix").repaintData();

    }

hasEmptyChild = formatDataCache("HaetutVastaanottajat-nomap", "searchMatrix");

    xmlData = Arcusys.Internal.Communication.GetRoles(searchString);
    
/*
    status = xmlData.selectSingleNode("//status", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();

    if(status == "error") {
        error = xmlData.selectSingleNode("//message", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        alert("Vastaanottajan hakemisessa tapahtui virhe! Virheviesti: " + error);
    } else {        
*/
   
        list = ["roleName", "roleUid"];
        rolesData = parseXML(xmlData, "role", list);

        if(rolesData != null || rolesData != "") {

            if(rolesData.length > 1) {
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Valittu-column").setDisplay("block").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Roolinimi-column").setDisplay("block").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Etunimi-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Sukunimi-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Puhelin-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Sahkoposti-column").setDisplay("none").repaint();

            } else {
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Valittu-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Roolinimi-column").setDisplay("block").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Etunimi-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Sukunimi-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Puhelin-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Sahkoposti-column").setDisplay("none").repaint();
            }

        }

        for( i = 0; i < rolesData.length; i++) {
            roleInfo = rolesData[i].split(',');
            entryFound = true;
            node = TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild().cloneNode();

            node.setAttribute("jsxid", i);

            if(rolesData.length == 1) {
                node.setAttribute("valittu", 1);
            }

            node.setAttribute("roolinimi", roleInfo[0]);
            node.setAttribute("uid", roleInfo[1]);
            node.setAttribute("rooli", 1);

            TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").insertBefore(node);

        }

        if(hasEmptyChild == true) {
            TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChild(TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild());
        }

        TivaTietopyyntoForm.getJSXByName("searchMatrix").repaintData();
        if(entryFound == false) {

            return false;
        }
    

}

function searchNames(searchString) {

    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = false;
    hasEmptyChild = false;

    if(searchString == "") {
        return false;
    }

    if(TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild() != null) {
        TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChildren();
        TivaTietopyyntoForm.getJSXByName("searchMatrix").repaintData();
    }

    hasEmptyChild = formatDataCache('HaetutVastaanottajat-nomap', 'searchMatrix');

    usersData = Arcusys.Internal.Communication.GetUsers(searchString);
    
  /*  
    status = usersData.selectSingleNode("//status", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    if(status == "error") {
        error = usersData.selectSingleNode("//message", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        if(error.search("Creation of the user by UID '' - should be used for test purposes only") != -1) {
            alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
        } else {
            alert("Vastaanottajan hakemisessa tapahtui virhe! Virheviesti: " + error);
        }
    } else {
    */

        if(usersData.selectSingleNode("//user", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
            entryFound = true;
        }

        if(entryFound) {
            list = ["firstname", "lastname", "phoneNumber", "email", "uid"];
            userData = parseXML(usersData, "user", list);

            if(userData != null) {

                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Roolinimi-column").setDisplay("none").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Valittu-column").setDisplay("none").repaint();

                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Etunimi-column").setDisplay("block").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Sukunimi-column").setDisplay("block").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Puhelin-column").setDisplay("block").repaint();
                TivaTietopyyntoForm.getJSXByName("Kayttajahaku_Sahkoposti-column").setDisplay("block").repaint();

            }

            for( i = 0; i < userData.length; i++) {
                personInfo = userData[i].split(',');
                node = TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild().cloneNode();

                node.setAttribute("rooli", 0);
                node.setAttribute("valittu", 1);

                node.setAttribute("jsxid", i);
                if(personInfo[0] == "undefined")
                    node.setAttribute("etunimi", "");
                else
                    node.setAttribute("etunimi", personInfo[0]);
                if(personInfo[1] == "undefined")
                    node.setAttribute("sukunimi", "");
                else
                    node.setAttribute("sukunimi", personInfo[1]);
                if(personInfo[2] == "undefined")
                    node.setAttribute("puhelin", "");
                else
                    node.setAttribute("puhelin", personInfo[2]);
                if(personInfo[3] == "undefined")
                    node.setAttribute("sahkoposti", "");
                else
                    node.setAttribute("sahkoposti", personInfo[3]);
                if((personInfo[4] == "undefined")) {
                    alert("Kayttajahaussa tapahtui virhe. Kohdehenkilon id puuttuu");
                    return false;   
                }

                node.setAttribute("uid", personInfo[4]);


                //TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChildren();
                
                var document = TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap");
                //var firstChild = document.getFirstChild();
                //if (firstChild != null) {
                    //replaceNode(node, TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild());
                //}
                
                document.insertBefore(node);
                //TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").insertBefore(node);

            }

            if(hasEmptyChild == true) {
                TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").removeChild(TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild());
            }
            
            
            TivaTietopyyntoForm.getJSXByName("searchMatrix").repaintData();
        } else {
            //alert("Valitettavasti antamallasi hakusanalla ei l" + unescape("%F6") + "ytynyt tuloksia");
            return false;
        }
    
}

function searchChildrens(searchString) {
    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = false;

    if(searchString == "") {
        alert("Sy" + unescape("%F6") + "t" + unescape("%E4") + "hakusana");
        return;
    }
    searchString = searchString.toLowerCase();
    if(TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild() != null) {
        TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").removeChildren();
        TivaTietopyyntoForm.getJSXByName("searchChildMatrix").repaintData();

    }



    hasEmptyChild = formatDataCache('HaetutLapset-nomap', 'searchChildMatrix');
/*
    if(TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild() == null) {
        TivaTietopyyntoForm.getJSXByName("searchChildMatrix").commitAutoRowSession();
        hasEmptyChild = true;
    }
*/
    
    xmlData = Arcusys.Internal.Communication.GetChildrens(searchString);
    
    /*
    status = xmlData.selectSingleNode("//status", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    if(status == "error") {
        error = xmlData.selectSingleNode("//message", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        if(error.search("Creation of the user by UID '' - should be used for test purposes only") != -1) {
            alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
        } else {
            alert("Vastaanottajan hakemisessa tapahtui virhe! Virheviesti: " + error);
        }
    } else {
    */
        list = ["firstname", "lastname", "uid"];
        userData = parseXML(xmlData, "child", list);

        for( i = 0; i < userData.length; i++) {
            personInfo = userData[i].split(',');
            entryFound = true;
            node = TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild().cloneNode();

            node.setAttribute("jsxid", i);
            node.setAttribute("etunimi", personInfo[0]);
            node.setAttribute("sukunimi", personInfo[1]);
            node.setAttribute("uid", personInfo[2]);

            TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);

        }

        if(hasEmptyChild) {
            TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").removeChild(TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild());
        }

        TivaTietopyyntoForm.getJSXByName("searchChildMatrix").repaintData();
        if(entryFound == false) {
            alert("Valitettavasti antamallasi hakusanalla ei l" + unescape("%F6") + "ytynyt tuloksia");
        }
    

}

function addToRecipients() {
    var counter, node, i, hasEmptyChild, chosen, childIterator, uid, firstname, lastname, rolename, childNode;
    i = 0;
    hasEmptyChild = false;
    counter = 0;
    childIterator = TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getChildIterator();

    while(childIterator.hasNext()) {
        childNode = childIterator.next();

        if(childNode.getAttribute("valittu") == 1) {

            if(childNode.getAttribute("rooli") == 0) {

                if(counter < 1) {
                    uid = childNode.getAttribute("uid");
                    firstname = childNode.getAttribute("etunimi");
                    lastname = childNode.getAttribute("sukunimi");
                    TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja_UID").setValue(uid);
                    TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja").setValue(firstname + " " + lastname);
                    TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja").repaint();
                    TivaTietopyyntoForm.getJSXByName("Perustiedot_isRole").setChecked(true);
                    counter++;

                } else {
                    alert("Vastaavia kohdehenkiloita loytyi useampi kuin yksi. Vain yksi kohdehenkilo voidaan lisata");
                }
            } else {
                uid = childNode.getAttribute("uid");
                rolename = childNode.getAttribute("roolinimi");
                TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja_UID").setValue(uid);
                TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja").setValue(rolename);
                TivaTietopyyntoForm.getJSXByName("Perustiedot_Vastaanottaja").repaint();
                TivaTietopyyntoForm.getJSXByName("Perustiedot_Extend02").setValue(uid);
                counter++;
            }
        }

    }
    if(counter < 1) {
        alert("Vastaanottaja tulee hakea ennen lisaamista");
    }
}

function addToTarget() {
    var counter, node, i, hasEmptyChild, chosen, childIterator, uid, firstname, lastname, childNode, label, parents;
    i = 0;
    hasEmptyChild = false;
    counter = 0;
    childIterator = TivaTietopyyntoForm.getCache().getDocument("HaetutLapset-nomap").getChildIterator();

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        chosen = childNode.getAttribute("valittu");

        if((chosen != null) && (chosen != 0)) {
            uid = childNode.getAttribute("uid");
            firstname = childNode.getAttribute("etunimi");
            lastname = childNode.getAttribute("sukunimi");
            TivaTietopyyntoForm.getJSXByName("Pyynto_Kohde_UID").setValue(uid);
            TivaTietopyyntoForm.getJSXByName("Pyynto_Kohde").setValue(firstname + " " + lastname);
            counter++;
            break;
        }

    }
    if(counter < 1) {
        alert("Yht" + unescape("%E4%E4") + "n kohdehenkil" + unescape("%F6%E4") + "ei ole valittuna");
        return;
    }
    xmlData = Arcusys.Internal.Communication.GetChildinfo(uid);
    list = ["firstname", "lastname"];
    userData = parseXML(xmlData, "parents", list);
    label = "<strong>J" + unescape("%E4") + "rjestelm" + unescape("%E4") + unescape("%E4") + "n merkatut huoltajat:</strong> ";

    for( i = 0; i < userData.length; i++) {
        parents = userData[i].split(",");
        label = label + parents[0] + " " + parents[1];
        if(i < (userData.length - 1)) {
            label = label + ", ";
        }
    }
    TivaTietopyyntoForm.getJSXByName("ParentsLabel").setText(label).repaint();
}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUsers = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelosdsadpe/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchEmployees><!--Optional:--><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchEmployees></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";
        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        //endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4") + " (GetUsers)");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetSenderUid = function(looraName) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByLooraName><looraUsername>" + looraName + "</looraUsername></soa:getUserUidByLooraName></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";
        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        //  endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4") + " (GetUsers)");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetChildrens = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchChildren><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchChildren></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";
        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4") + " (GetChildrens)");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetChildinfo = function(uid) {
        var tout, msg, endpoint, url, req, objXML;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getChildInfo><childUid>" + uid + "</childUid></soa:getChildInfo></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";
        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4") + " (GetChildinfo)");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetCategories = function(userUid) {
        var tout, msg, endpoint, url, req, objXML;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getTietoelementit><userUid>" + userUid + "</userUid></soa:getTietoelementit></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";

        url = getUrl();
        endpoint = getEndpoint("KokuTietopyyntoProcessingService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuTietopyyntoProcessingServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4") + " (GetCategories)");
        } else {

            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetRoles = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchRoles><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchRoles></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";

        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4"));
        } else {

            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetRoleUsers = function(roleUid) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUsernamesInRole><roleUid>" + roleUid + "</roleUid></soa:getUsernamesInRole></soapenv:Body></soapenv:Envelope>";

        //url = "http://62.61.65.15:8380/palvelut-portlet/ajaxforms/WsProxyServlet2";

        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess" + unescape("%E4"));
        } else {

            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.getUserInfo = function(id) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + id + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";
        url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();
        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }

    };
});
function preloadCategories() {

    var xmlData, xmlString, intalioUserUid, intalioUser;
    intalioUserUid = "";
    intalioUser = getIntalioUser();
    xmlData = Arcusys.Internal.Communication.GetSenderUid(intalioUser);

    //intalioUserUid = xmlData.selectSingleNode("//ns2:getUserUidByLooraNameResponse", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getFirstChild();
    intalioUserUid = xmlData.selectSingleNode("//userUid").getValue();
    xmlData = Arcusys.Internal.Communication.GetCategories(intalioUserUid);
    xmlData = xmlData.selectSingleNode("//ns2:getTietoelementitResponse", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getFirstChild();
    xmlData = xmlData.toString();
    xmlString = "<data jsxid=\"jsxroot\">" + xmlData + "</data>";

    TivaTietopyyntoForm.getJSXByName("matrix1").setXMLString(xmlString);
    TivaTietopyyntoForm.getJSXByName("matrix1").repaintData();

}

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

    while(childs.hasNext()) {

        attributes[i] = [];
        node = childs.next();
        if(node == null) {
            Arcusys.Internal.Communication.GetCategories();
            break;
        }

        for( j = 0; j < childlist.length; j++) {
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
 * Compresesses multidimensional array to single dimensional
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