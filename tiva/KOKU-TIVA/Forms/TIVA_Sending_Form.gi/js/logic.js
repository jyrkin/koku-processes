/* place JavaScript code here */

// Prestart --------------------------------------------------------------------------------------------------------------------------------------

function intalioPreStart() {
    var error;

    clearDataCache("Vastaanottajat-nomap");
    mapSelectedRecipientsToMatrix();
    error = checkSuostumukset();
    if (error != "") {
        return error;
    }
    return null;
}

/* checks for error before sending form to processing
*/
function checkSuostumukset() {
    var error;

    if (TIVAForm.getJSXByName("block").getFirstChild() == null) {
        error = "Lomakkeelle ei ole valittu suostumuspohjaa!";
    }
    if (checkRecipients() == false) {
        error = "Suostumukselta puuttuvat vastaanottajat";
    }
    else {
        error = "";
    }
    return error;
}

function checkRecipients() {
    if (TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild() == null) {
        return false;
    }
    else {
        return true;
    }
}


// General functions -----------------------------------------------------------------------------------------------------------------------------

function formatDataCache(cache, matrix) {
    if (TIVAForm.getCache().getDocument(cache).getFirstChild() == null) {
        TIVAForm.getJSXByName(matrix).commitAutoRowSession();
        return true;
    }
    else {
        return false;
    }
}

function clearDataCache(cacheName, matrixName) {
    while (TIVAForm.getCache().getDocument(cacheName).getFirstChild() != null)    {
        TIVAForm.getCache().getDocument(cacheName).removeChild(TIVAForm.getCache().getDocument(cacheName).getFirstChild());
    }
    if (matrixName) {
        TIVAForm.getJSXByName(matrixName).repaintData();
    }
}

function swapConsentGivers(selection) {
    if (selection == 1) {
        TIVAForm.getJSXByName("Suostumus_Extend1").setValue("Child");
        TIVAForm.getJSXByName("receipient2-field").setDisplay("none", true);
    }
    else if (selection == 2) {
        TIVAForm.getJSXByName("Suostumus_Extend1").setValue("AnyParent");
        TIVAForm.getJSXByName("receipient2-field").setDisplay("block", true);
    }
    else if (selection == 3) {
        TIVAForm.getJSXByName("Suostumus_Extend1").setValue("BothParents");
        TIVAForm.getJSXByName("receipient2-field").setDisplay("block", true);
    }
}

function setTargetPerson() {
    TIVAForm.getJSXByName("Suostumus_Kohdehenkilo").setValue(TIVAForm.getJSXByName("Viesti_Kohdehenkilo").getText());
}

function mapChoicesToMatrix(id,description,infotext) {
    var node, hasEmptyChild;

    hasEmptyChild = formatDataCache("Toimenpiteet-nomap", "Toimenpiteet");

    node = TIVAForm.getCache().getDocument("Toimenpiteet-nomap").getFirstChild().cloneNode();

    node.setAttribute("jsxid",id);
    node.setAttribute("Toimenpiteet_ToimenpideId",id);
    node.setAttribute("Toimenpiteet_Kuvaus",description);
    if (infotext)    {
        node.setAttribute("Toimenpiteet_Tarkentava_Teksti",infotext);
    }

    TIVAForm.getCache().getDocument("Toimenpiteet-nomap").insertBefore(node);

    if (hasEmptyChild==true) {
        TIVAForm.getCache().getDocument("Toimenpiteet-nomap").removeChild(TIVAForm.getCache().getDocument("Toimenpiteet-nomap").getFirstChild());
    }
}

function removeChoice(node, id) {
    TIVAForm.getJSXByName("block").removeChild(node);
    TIVAForm.getCache().getDocument("Toimenpiteet-nomap").removeChild(TIVAForm.getCache().getDocument("Toimenpiteet-nomap").selectSingleNode("//record[@Toimenpiteet_ToimenpideId='" + id + "']"));
    TIVAForm.getJSXByName("block").setHeight(TIVAForm.getJSXByName("block").getHeight() - 30,true).repaint();
}

// Inserting a template --------------------------------------------------------------------------------------------------------------------------

function addChoice(id,description,infotext,prefill) {
    var section, label, choiceId, info;
    
    section = TIVAForm.getJSXByName("block").load("components/choice.xml",true);
    label = section.getFirstChild().getFirstChild().getChild("choiceLabel");
    choiceId = section.getChild("choiceId");
    info = section.getDescendantOfName("choice_tarkentavaTeksti");
    
    TIVAForm.getJSXByName("block").setHeight(TIVAForm.getJSXByName("block").getHeight() + 30,true).repaint();

    if (prefill) {
        section.getDescendantOfName("remChoice").setDisplay("none",true);
    }
   
    if (infotext) {
        info.setValue(infotext);
    }
    else {
        section.getDescendantOfName("tooltipImg").setDisplay("none",true);
    }
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    label.setText(description,true);
    choiceId.setValue(id);
   
    mapChoicesToMatrix(id,description,infotext);
}

function mapFormDataToFields(objXML) {
    // Get basic information from xml document
    var i, pohjaId, otsikko, saateteksti, laatija, attributes;
    
    pohjaId = objXML.selectSingleNode("//suostumuspohjaId", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    otsikko = objXML.selectSingleNode("//otsikko", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    saateteksti = objXML.selectSingleNode("//saateteksti", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    laatijaUid = objXML.selectSingleNode("//laatija", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    laatijaData = Arcusys.Internal.Communication.getUserInfo(laatijaUid);
    
    
    attributes = getAttributes(objXML);
    
    for (i=0;i<attributes.length;i++) {
        addChoice(attributes[i][0],attributes[i][1],attributes[i][2],true);
    }

    // Map values to the form fields
    TIVAForm.getJSXByName("Suostumus_SuostumusId").setValue(pohjaId);
    TIVAForm.getJSXByName("Pohja_Otsikko").setValue(otsikko);
    TIVAForm.getJSXByName("Pohja_Kuvaus").setValue(saateteksti);
    TIVAForm.getJSXByName("Suostumus").setTitleText(otsikko,true);
    TIVAForm.getJSXByName("Suostumus_Kuvaus").setText(saateteksti,true);
    if (laatijaUid){
        TIVAForm.getJSXByName("Pohja_Laatija").setValue(laatijaUid);
        TIVAForm.getJSXByName("laatija_label").setText("<b>Laatija: </b>" + laatijaData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue() + " " + laatijaData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue(), true);
    }
}

function getTemplate(id)    {
    var formData;

    while (TIVAForm.getJSXByName("block").getFirstChild() != null) {
        TIVAForm.getJSXByName("block").removeChild(TIVAForm.getJSXByName("block").getFirstChild());
        TIVAForm.getJSXByName("block").setHeight(TIVAForm.getJSXByName("block").getHeight() - 30, true);
    }

    clearDataCache("Toimenpiteet-nomap");

    TIVAForm.getJSXByName("Pohja_PohjaId").setValue(id);
   
    formData = Arcusys.Internal.Communication.GetFormData(id);           
    
    if(formData != null) {
        mapFormDataToFields(formData);
    }
}

function getAttributes(objXML) {
    var i=0, j=0, attributes = [], toimenpiteet = objXML.selectNodeIterator("//toimenpiteet");

    while(toimenpiteet.hasNext()) {
        node = toimenpiteet.next();
        if (!node.getFirstChild()) {
            break;
        }
        attributes[i] = [];
        childNode = node.getFirstChild();
        while(childNode != null) {
            attributes[i][j] = childNode.getValue();
            childNode = childNode.getNextSibling();
            j++;
        }
        j=0;
        i++;
    }
    return attributes;
}

// Preload ---------------------------------------------------------------------------------------------------------------------------------------

function preload()    {
    var username;

    getTemplates("");
    username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("/")+1));
    TIVAForm.getJSXByName("Kayttaja_Lahettaja").setValue(username).repaint();
}

function getTemplates() {
    var formData = Arcusys.Internal.Communication.getTemplatesData("");
    insertTemplates(formData);
}

function insertTemplates(objXML) {
    var id, topic;
    
    id = objXML.selectNodes("//suostumuspohjaId", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
    topic = objXML.selectNodes("//otsikko", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
    mapFieldsToMatrix(id, topic);
}

function mapFieldsToMatrix(id, topic) {
    var node, i=0, hasEmptyChild;

    hasEmptyChild = formatDataCache("Pohjat-nomap", "Pohjat");
    
    while (id.get(i)) { 
        node = TIVAForm.getCache().getDocument("Pohjat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid",id.get(i).getValue());
        node.setAttribute("jsxtext",topic.get(i).getValue());

        TIVAForm.getCache().getDocument("Pohjat-nomap").insertBefore(node);
        i++;
    }

    if (hasEmptyChild==true) {
        TIVAForm.getCache().getDocument("Pohjat-nomap").removeChild(TIVAForm.getCache().getDocument("Pohjat-nomap").getFirstChild());
    }
}

// Functions related to recipients mapping -------------------------------------------------------------------------------------------------------

function mapRecipients(recipients) {
    var node, i, hasEmptyChild;

    clearDataCache("Vastaanottajat-nomap");

    hasEmptyChild = formatDataCache("Vastaanottajat-nomap", "Vastaanottajat");
    
    for (i=0;i<recipients.length;i++)    {
        node = TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid",i);
        node.setAttribute("Vastaanottajat_Vastaanottaja",recipients[i]);
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").insertBefore(node);
    }
    if (hasEmptyChild==true) {
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").removeChild(TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild());
    } 
}

function mapSelectedRecipientsToMatrix() {
    var node, childNode, hasEmptyChild, counter, group, i, j, groups, recipient1, recipient2, targetPerson, childIterator, person, personInfo;

    counter = 1;

    childIterator = TIVAForm.getCache().getDocument("receipientsToShow-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("Vastaanottajat-nomap", "Vastaanottajat");

    while (childIterator.hasNext()) {
        childNode = childIterator.next();

        recipient1 = childNode.getAttribute("receipient1Uid");
        recipient2 = childNode.getAttribute("receipient2Uid");
        targetPerson = childNode.getAttribute("targetPerson");
        node = TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", counter);
        node.setAttribute("Vastaanottajat_Vastaanottaja1", recipient1);
        node.setAttribute("Vastaanottajat_Vastaanottaja2", recipient2);
        node.setAttribute("Vastaanottajat_Kohdehenkilo", targetPerson);
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").insertBefore(node);
        counter++;
    }

    if (hasEmptyChild==true) {
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").removeChild(TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild());
    }
}

function searchNames(searchString) {
    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list, parent1, parent2, paren1Data, parent2Data, parent1Info, parent2Info;
    entryFound = false;

    if (searchString == "") {
        alert("Syota hakusana");
        return;
    }

    searchString = searchString.toLowerCase();

    xmlData = Arcusys.Internal.Communication.GetChildren(searchString);
    list = ["firstname", "lastname", "uid"];
    userData = parseXML(xmlData, "child", list);
    if (userData != "") {
        entryFound = true;
    }
    
    if (entryFound) {
    
        clearDataCache("HaetutLapset-nomap", "searchChildMatrix");
        hasEmptyChild = formatDataCache("HaetutLapset-nomap", "searchChildMatrix");
    
        parents = xmlData.selectNodes("//parents", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");

        parent1 = parents.get(0);
        parent2 = parents.get(1);

        parent1List = ["firstname", "lastname", "uid"];
        parent2List = ["firstname", "lastname", "uid"];

        parent1Data = parseXML(parent1, "parents", parent1List);
        parent2Data = parseXML(parent2, "parents", parent2List);
    

        personInfo = userData[0].split(',');
        parent1Info = parent1Data[0].split(',');
        parent2Info = parent2Data[1].split(',');

    
        node = TIVAForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", 0);
        node.setAttribute("etunimi", personInfo[0]);
        node.setAttribute("sukunimi", personInfo[1]);
        node.setAttribute("uid", personInfo[2]);
        node.setAttribute("vanhempi1", parent1Info[0] + " " + parent1Info[1]);
        node.setAttribute("vanhempi2", parent2Info[0] + " " + parent1Info[1]);
        node.setAttribute("vanhempi1Uid", parent1Info[2]);
        node.setAttribute("vanhempi2Uid", parent2Info[2]);

        TIVAForm.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);

        if (hasEmptyChild == true) {
            TIVAForm.getCache().getDocument("HaetutLapset-nomap").removeChild(TIVAForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild());
        }
    }
    
    else {
        alert ("Valitettavasti antamallasi hakusanalla ei loytynyt tuloksia");
    }
    
    TIVAForm.getJSXByName("searchChildMatrix").repaintData();

}

function addToRecipients(selection) {
    if (!selection) {
        alert("Suostujat-kentt\u00E4 on tyhj\u00E4. Vastaanottajia ei haettu.");
        return;
    }
    
    clearDataCache("receipientsToShow-nomap", "dummyMatrix");
    var counter, node, i, hasEmptyChild, chosen, childIterator, uid, firstname, lastname, childNode;

    counter = TIVAForm.getJSXByName("recipientCounter").getValue();
    i = 0;

    childIterator = TIVAForm.getCache().getDocument("HaetutLapset-nomap").getChildIterator();
    
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    while (childIterator.hasNext()) {

        childNode = childIterator.next();

        chosen = childNode.getAttribute("valittu");

        if ((chosen != null) && (chosen != 0)) {

            node = TIVAForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

            uid = childNode.getAttribute("uid");
            firstname = childNode.getAttribute("etunimi");
            lastname = childNode.getAttribute("sukunimi");
            vanhempi1 = childNode.getAttribute("vanhempi1");
            vanhempi2 = childNode.getAttribute("vanhempi2");
            vanhempi1Uid = childNode.getAttribute("vanhempi1Uid");
            vanhempi2Uid = childNode.getAttribute("vanhempi2Uid");
            targetPerson = firstname + " " + lastname;

            node.setAttribute("jsxid", counter);
            if (selection == 1) {
                node.setAttribute("receipient1", firstname + " " + lastname);
                node.setAttribute("receipient1Uid", uid);
            }
            else {
                node.setAttribute("receipient1", vanhempi1);
                node.setAttribute("receipient1Uid", vanhempi1Uid);
                node.setAttribute("receipient2", vanhempi2);
                node.setAttribute("receipient2Uid", vanhempi2Uid);
            }
            node.setAttribute("targetPerson", uid);
            node.setAttribute("uid", uid);
            node.setAttribute("group", 0);
            TIVAForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;

        }

    }
    if (hasEmptyChild == true) {
        TIVAForm.getCache().getDocument("receipientsToShow-nomap").removeChild(TIVAForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    TIVAForm.getJSXByName("dummyMatrix").repaintData();
    TIVAForm.getJSXByName("recipientCounter").setValue(counter);

}

function parseXML(xmlData, rootName, childlist) {
    var i, j, attributes, node, childNode, childChildNode, childs;
    i = 0;

    attributes = [];

    childs = xmlData.selectNodeIterator("/\/" + rootName);

    while (childs.hasNext()) {

        attributes[i] = [];
        node = childs.next();
        if (node == null) {
            break;
        }
        for (j = 0; j < (childlist.length+2); j++) {
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

// Web Service Calls -----------------------------------------------------------------------------------------------------------------------------

/* GetFormData(id)
** Requests for consent object
** param: id = id of the consent object (formId)
** returns consent object
*/
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetFormData= function(id) {
        var tout, pohjaId, msg, endpoint, url, req, objXML;
            
        tout = 1000;   
        pohjaId = id;
        
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getConsentTemplateById><pohjaId>" + pohjaId + "</pohjaId></soa:getConsentTemplateById></soapenv:Body></soapenv:Envelope>";
        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();

        msg = "message=" + encodeURIComponent(msg)+ "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();

        req.open('POST', url, false);      
    
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        }
        else {
            return objXML;
        }
    };
});

/* Requests for consent template objects
** param: str - filters templates by name
** returns: template objects
*/
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.getTemplatesData= function(str) {
        var tout, msg, endpoint, url, req, objXML
        
        tout = 1000;   
        
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:selaaSuostumuspohjat><searchString>" + str + "</searchString><limit>100</limit></soa:selaaSuostumuspohjat></soapenv:Body></soapenv:Envelope>";
        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();

        msg = "message=" + encodeURIComponent(msg)+ "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();

        req.open('POST', url, false);      
        
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        }
        else {
            return objXML;
        }
    };
});

/* Requests for user info
** param: id - user id of the user
** returns: user data object
*/
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.getUserInfo = function(id) {
        var tout, msg, endpoint, url, req, objXML, limit;

        tout = 1000;
        limit = 100;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + id + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";

        url = getUrl();

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

/* Requests child
** param: searchString - Social account number of the child
** retruns: child data object
*/
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetChildren = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;

        tout = 1000;
        limit = 100;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchChildren><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchChildren></soapenv:Body></soapenv:Envelope>";

        url = getUrl();

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

// Extra functions -------------------------------------------------------------------------------------------------------------------------------

function getDomainName() {
    var url, url_parts, domain_name_parts, domain_name;

    url = window.location.href;
    url_parts = url.split("/");
    domain_name_parts = url_parts[2].split(":");
    domain_name = domain_name_parts[0];

    return domain_name;
}

function getPortNumber() {
    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name_parts = url_parts[2].split(":");
    var port_number = domain_name_parts[1];
    return port_number;
}


function getUrl() {
    var url = "http://" + getDomainName() + ":" + getPortNumber();
    url = url + "/palvelut-portlet/ajaxforms/WsProxyServlet2";
    //url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";
    return url;
}

jsx3.lang.Package.definePackage(
  "Intalio.Internal.CustomErrors",
  function(error) {

    error.getError=function(name){
        var errortext = TIVAForm.getJSXByName(name).getTip();
        errortext = "Puuttuvat tiedot: " + errortext;
        return errortext;
    };
  }
);

function showDialog (dialogId, text, textTitle, title) {
    var dialog = $jq("#"+dialogId), cssDisplay = dialog.css('display');
        
    if (cssDisplay === 'none') {
        dialog.dialog({title: title});
        dialog.dialog( "option", "width", 400 );
        dialog.dialog( "option", "height", 300 );
        dialog.dialog( "option", "position", ['middle','middle'] );
        dialog.parent().css('display', 'block');
        dialog.dialog();
    }
    else {
         dialog.dialog({ show: null });
    }

    dialog.html("<p style=\"text-align:left;\"><b>" + textTitle + "</b></p><p style=\"margin:0 0 0 0;\">" + text + "</p>");
}