// Prestart --------------------------------------------------------------------------------------------------------------------------------------
 
function setTooltipSpanWidth() {
    $("span[label=tooltipImg]").css('width', '30');
}

function intalioPreStart() {
    var error = checkTicks();
    throughTextfields();
    if (TIVAForm.getJSXByName("Suostumus_Hylkaa").getChecked()) {
        if (!confirmation("Haluatko varmasti hyl\u00E4t\u00E4 suostumuksen?")) {
            parent.scrollTo(0, 0); // scroll the parent window up
            return "Lomaketta ei tallennettu";
        } else {
            TIVAForm.getJSXByName("Suostumus_Status").setValue("Evatty");
        }
    } else {
        mapFieldsToMatrix();
    }
    if (error != null) {
        parent.scrollTo(0, 0); // scroll the parent window up
        return ("Valitse tai hylk\u00E4\u00E4 suostumus");
    } else {
        return null;
    }
}

function formatDataCache(cache, matrix) {
    if (TIVAForm.getCache().getDocument(cache).getFirstChild() == null) {
       commitCustomAutoRowSession(matrix, cache);
        return true;
    }
    else {
        return false;
    }
}

function commitCustomAutoRowSession(matrix, cache) {
    var nodes, xmlStr;

    nodes = TIVAForm.getJSXByName(matrix).getChildren();
    xmlStr = "<data jsxid=\"jsxroot\"><record jsxid=\"\"";

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && nodes[i].getPath() != "jsxid") {
            xmlStr += " " + nodes[i].getPath() + "=\"\"";
        }
    }
    xmlStr += "/></data>";
    TIVAForm.getCache().getDocument(cache).loadXML(xmlStr);
}

// Removes HTML-tags.
function escapeHTML(value) {
                if (value !== null && value !== undefined && isNaN(value) && value.replace()) {
                        return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                } else {
                        return value;
                }
}

// Goes through textfields in order to check XSS-vulnerabilities.
function throughTextfields() {
    var temp, value, descendants = [];
    descendants = TIVAForm.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");
    
    for( i = 0; i < descendants.length; i++) {
        value = TIVAForm.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        TIVAForm.getJSXByName(descendants[i].getName()).setValue(temp);
        TIVAForm.getJSXByName(descendants[i].getName()).repaint();
    }
}


function checkTicks() {
    var flag, reject = TIVAForm.getJSXByName("Suostumus_Hylkaa").getChecked(), nodes = TIVAForm.getJSXByName("suostumukset_block").getDescendantsOfType("jsx3.gui.CheckBox");
    if (reject) {
        flag = true;
    } else {
        flag = false;
        for (i = 0; i < nodes.length; i++) {
            if (nodes[i].getChecked()) {
                flag = true;
                break;
            }
        }
    }
    if (flag) {
        TIVAForm.getJSXByName("checkTicks").setRequired(0);
    } else {
        TIVAForm.getJSXByName("checkTicks").setRequired(1);
    }
}

function confirmation(question){
    if (confirm(question)) {
        return true;
    } else {
        return false;
    }
}

function cancelConsent(check) {
    if (check) {
        if (TIVAForm.getJSXByName("Suostumus_Status").getValue() != "Vastattu") {
            uncheckAll(TIVAForm.getJSXByName("suostumukset_block"));
        }
    }
}

// General functions -----------------------------------------------------------------------------------------------------------------------------

function formatDataCache(cache, matrix) {
    if (TIVAForm.getCache().getDocument(cache).getFirstChild() == null) {
        // TIVAForm.getJSXByName(matrix).commitAutoRowSession();
        commitCustomAutoRowSession(matrix, cache);
        return true;
    } else {
        return false;
    }
}

function uncheckTheOthers(target, checked) {
    var i, descendants = target.getDescendantsOfType("jsx3.gui.CheckBox");

    for (i = 0; i < descendants.length; i++)   {
        if (descendants[i] != checked) {
            descendants[i].setChecked(0);
        }
    }
}

function uncheckAll(target) {
    var i, descendants;
    descendants = target.getDescendantsOfType("jsx3.gui.CheckBox");
    for (i = 0; i < descendants.length; i++) {
        descendants[i].setChecked(0, true);
    }
}

function disableAll(target) {
    var i, descendants;
    
    descendants = target.getDescendantsOfType("jsx3.gui.CheckBox");
    for (i = 0; i < descendants.length; i++) {
        descendants[i].setEnabled(0, true);
    }
}

function setCurrentDate(targetName)    {
    var currentDate = new Date();
    TIVAForm.getJSXByName("Suostumus_Pvm").setValue(currentDate);
}

function isValidDate(node) {
    var checkDate, checkDate1, checkDate2, checkDate3, currentValue;

    currentValue = TIVAForm.getJSXByName("tempDate").getValue();
    checkDate1 = node.getValue().substr(0, 2);
    checkDate2 = node.getValue().substr(3, 2);
    checkDate3 = node.getValue().substr(6, 4);
    checkDate = new Date();
    checkDate2 = parseInt(checkDate2 - 1, 10);
    if (checkDate2.length == 1) {
        checkDate2 = "0" + checkDate2;
    }
    checkDate.setFullYear(checkDate3, checkDate2, checkDate1);
    today = new Date();
    if (checkDate < today) {
        alert('Virheellinen p\u00E4iv\u00E4m\u00E4\u00E4r\u00E4. P\u00E4iv\u00E4m\u00E4\u00E4r\u00E4n t\u00E4ytyy olla t\u00E4t\u00E4 hetke\u00E4 my\u00F6hemm\u00E4lt\u00E4 ajanjaksolta!');
        node.setValue(currentValue);
    } else {
        TIVAForm.getJSXByName("tempDate").setValue(node.getValue());
    }
}

function setHeightAccordTextHeight(pane, s, limit, rowH) {
    pane.setHeight(Math.round(pane.getHeight() + (rowH * (s.length / limit))), true);
}

// Consent actions -------------------------------------------------------------------------------------------------------------------------------

function mapFieldsToMatrix() {
    var i, id, vastaus, checks = 0, hasEmptyChild, vastaukset, node;
    vastaukset = TIVAForm.getJSXByName("suostumukset_block").getChildren();

    hasEmptyChild = formatDataCache("Vastaukset-nomap", "Vastaukset");

    for (i = 0; i < vastaukset.length; i++) {
        vastaus = vastaukset[i].getDescendantOfName("vastaus").getValue();
        id = vastaukset[i].getDescendantOfName("choiceId").getValue();

        if (vastaus == 1) {
            checks++;
        }

        node = TIVAForm.getCache().getDocument("Vastaukset-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", id);
        node.setAttribute("Vastaukset_VastausId", id);
        node.setAttribute("Vastaukset_Vastaus", vastaukset[i].getDescendantOfName("vastaus").getChecked());
        TIVAForm.getCache().getDocument("Vastaukset-nomap").insertBefore(node);
    }
    if (hasEmptyChild) {
        TIVAForm.getCache().getDocument("Vastaukset-nomap").removeChild(TIVAForm.getCache().getDocument("Vastaukset-nomap").getFirstChild());
    }
    if (checks < vastaukset.length) {
        TIVAForm.getJSXByName("Suostumus_Status").setValue("Osa suostumuksista puuttuu");
    } else {
        TIVAForm.getJSXByName("Suostumus_Status").setValue("Voimassa");
    }
}

function addChoice(id, description, infotext) {
    var section, label, choiceId, info;

    section = TIVAForm.getJSXByName("suostumukset_block").load("components/choice.xml",true);

    TIVAForm.getJSXByName("suostumukset_block").setHeight(TIVAForm.getJSXByName("suostumukset_block").getHeight() + 30, true);

    label = section.getDescendantOfName("choiceLabel");
    choiceId = section.getChild("choiceId");
    info = section.getDescendantOfName("choice_tarkentavaTeksti");

    if (infotext) {
        info.setValue(infotext);
        section.getDescendantOfName("tooltipImg").setDisplay("inline !important", true);
    } else {
        section.getDescendantOfName("tooltipImg").setDisplay("none", true);
    }
    setTooltipSpanWidth();

    label.setText(description, true);
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    choiceId.setValue(id);
}

// Preload ---------------------------------------------------------------------------------------------------------------------------------------

function preload() {
    var username, uidData, uid, id;

    username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\") + 1));
    uidData = Arcusys.Internal.Communication.getUserId(username);
    uid = uidData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    TIVAForm.getJSXByName("Kayttaja_Vastaanottaja").setValue(username).repaint();

    if (gup("FormID")) {
        id = gup("FormID");
        TIVAForm.getJSXByName("Suostumus_SuostumusId").setValue(id);

        try {
            formData = Arcusys.Internal.Communication.GetFormData(id, uid);

            if(formData != null) {
                mapFormDataToFields(formData);
            }
        }
        catch (e) {
            alert(e);
        }
    }
    
    if (TIVAForm.getJSXByName("Suostumus_Status").getValue() == "Vastattu") {
        TIVAForm.getJSXByName("checkTicks").setRequired(0);
        TIVAForm.getJSXByName("rejectLabel").setText("Mit\u00E4t\u00F6i suostumus", true);
        TIVAForm.getJSXByName("tempDate").setValue(TIVAForm.getJSXByName("Suostumus_Maara_Aika").getValue());
    }
}

function mapFormDataToFields(objXML) {
    var i, pohjaId, otsikko, saateteksti, laatija, actionReplies, vastattu, attributes, vastaanottaja, maaraaika, maaraaika1, maaraaika2, maaraaika3, aikaraja, aikaraja1, aikaraja2, aikaraja3, kommentti, targetPersonUid;
    var vastattu, vakioMaaraaika;
    // Get basic information from xml document

    pohjaId = objXML.selectSingleNode("//suostumuspohjaId", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    otsikko = objXML.selectSingleNode("//otsikko", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    saateteksti = objXML.selectSingleNode("//saateteksti", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    actionReplies = objXML.selectNodeIterator("//actionReplies", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
    targetPersonUid = objXML.selectSingleNode("//targetPersonUid", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    targetPersonData = Arcusys.Internal.Communication.getUserInfo(targetPersonUid);
    targetPerson = targetPersonData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue() + " " + targetPersonData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    if (objXML.selectSingleNode("//alreadyReplied", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
        vastattu = objXML.selectSingleNode("//alreadyReplied", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    } else {
        vastattu = 0;
    }
    attributes = getAttributes(objXML);
    if (objXML.selectSingleNode("//endDateMandatory", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
        vakioMaaraaika = objXML.selectSingleNode("//endDateMandatory", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    } else {
        vakioMaaraika = 0;
    }
    
    if (objXML.selectSingleNode("//maaraaika", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
        maaraaika = objXML.selectSingleNode("//maaraaika", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        maaraaika = maaraaika.replace("Z", "");
        maaraaika1 = maaraaika.substr(8, 2);
        maaraaika2 = maaraaika.substr(5, 2);
        maaraaika3 = maaraaika.substr(0, 4);
        maaraaika = maaraaika1 + "-" + maaraaika2 + "-" + maaraaika3;
        TIVAForm.getJSXByName("Suostumus_Maara_Aika").setValue(maaraaika).repaint();
    }

    if (objXML.selectSingleNode("//replyTillDate", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
        aikaraja = objXML.selectSingleNode("//replyTillDate", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        aikaraja = aikaraja.replace("Z", "");
        aikaraja1 = aikaraja.substr(8, 2);
        aikaraja2 = aikaraja.substr(5, 2);
        aikaraja3 = aikaraja.substr(0, 4);
        aikaraja = aikaraja1 + "-" + aikaraja2 + "-" + aikaraja3;
        TIVAForm.getJSXByName("Suostumus_Aikaraja").setValue(aikaraja).repaint();
    }

    if (objXML.selectSingleNode("//kommentti", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
        kommentti = objXML.selectSingleNode("//kommentti", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        TIVAForm.getJSXByName("Suostumus_Kommentti").setValue(kommentti).repaint();
    }

    for (i = 0; i < attributes.length; i++) {
        addChoice(attributes[i][0], attributes[i][1], attributes[i][2]);
        if (attributes[i][0] > TIVAForm.getJSXByName("id").getValue()) {
            TIVAForm.getJSXByName("id").setValue(parseInt(TIVAForm.getJSXByName("id").getValue()) + 1);
        }
    }
    
    setPermittedSlots(actionReplies);
    
    // Map values to the form fields
    if (vakioMaaraaika == "true") {
        TIVAForm.getJSXByName("Suostumus_Maara_Aika").setEnabled(0, true);
    }

    if (vastattu == "true") {
        TIVAForm.getJSXByName("Suostumus_Status").setValue("Vastattu");
        disableAll(TIVAForm.getJSXByName("suostumukset_block"));
    }

    TIVAForm.getJSXByName("Pohja_PohjaId").setValue(pohjaId);
    TIVAForm.getJSXByName("Suostumus").setTitleText(otsikko, true);
    TIVAForm.getJSXByName("Suostumus_Kuvaus").setText(saateteksti, true);
    setHeightAccordTextHeight(TIVAForm.getJSXByName("Suostumus_Kuvaus").getParent(), TIVAForm.getJSXByName("Suostumus_Kuvaus").getText(), 100, 12);
    TIVAForm.getJSXByName("targetPersonLabel").setText("<b>Lapsen nimi: </b>" + targetPerson, true);

//adds the new KKS -information
    getKKSdata(objXML);
}

// Gets the KKS -fields and 
function getKKSdata(objXML){

var nodeIterator, fieldnodes, i, kkscode, kksinfostring;
kksinfostring="";

try{
kkscode = objXML.selectSingleNode("//code", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
} catch (e) {return null}

if (kkscode != null){
        TIVAForm.getJSXByName("KKS_code").getParent().getParent().setDisplay("block").repaint();
        TIVAForm.getJSXByName("KKS_code").setValue(kkscode);
}

// Field values are fetched consequentally, could be moved to it's own function in the future.
nodeIterator = objXML.selectNodeIterator("//fields", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
fieldnodes = getDataString(nodeIterator);

if (fieldnodes.length != 0){
kksinfostring = "Suostumusta koskevat attribuutit:\n";
for (i=0; i<fieldnodes.length; i++)
kksinfostring = kksinfostring + fieldnodes[i]["fieldName"] + "\n";
}

nodeIterator = objXML.selectNodeIterator("//kksGivenTo", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
fieldnodes = getDataString(nodeIterator);
if (fieldnodes.length != 0){
kksinfostring = kksinfostring + "\nSuostumusta koskevat organisaatiot:\n"; 
for (i=0; i<fieldnodes.length; i++)
kksinfostring = kksinfostring + fieldnodes[i]["organizationName"] + "\n";
}

if (kksinfostring.length >= 2){
TIVAForm.getJSXByName("KKSarvot").setDisplay("block").repaint();
TIVAForm.getJSXByName("KKSinfo").setText(kksinfostring).repaint();
TIVAForm.getJSXByName("testingAdditionaldata").setValue(kksinfostring);
}

} //getKKSdata

function setPermittedSlots(actionReplies) {
    var nodes, permitted, slotNumber, slot, check, block;

    block = TIVAForm.getJSXByName("suostumukset_block");
    slot = block.getFirstChild();

    while (actionReplies.hasNext()) {
        nodes = actionReplies.next();
        permitted = nodes.getFirstChild().getNextSibling().getValue();
        if (slot) {
            check = slot.getDescendantOfName("vastaus");
            if (permitted == "true") {
                check.setChecked(1,true);
            }
            if (slot.getNextSibling()) {
                slot = slot.getNextSibling();
            }
        }
        
    }
}

function getAttributes(objXML) {
    var i = 0, j = 0, attributes = [], toimenpiteet, node;

    toimenpiteet = objXML.selectNodeIterator("//toimenpiteet");

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

// Web Service calls -----------------------------------------------------------------------------------------------------------------------------

//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.GetFormData = function (id, username) {
        var tout, suostumusId, msg, endpoint, url, req, objXML;

        tout = 1000;   
        suostumusId = id;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getSuostumusForReply><suostumusId>" + suostumusId + "</suostumusId><suostuja>" + username + "</suostuja></soa:getSuostumusForReply></soapenv:Body></soapenv:Envelope>";

        endpoint = getEndpoint("KokuSuostumusProcessingService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();
        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;
        }
    };
});

//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.getUserId = function (username) {
        var tout, suostumusId, msg, endpoint, url, req, objXML;

        tout = 1000;   

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByKunpoName><kunpoUsername>" + username + "</kunpoUsername></soa:getUserUidByKunpoName></soapenv:Body></soapenv:Envelope>";
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        url = getUrl();

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        req = new jsx3.net.Request();
        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;
        }
    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.getUserInfo = function (id) {
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

        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;
        }

    };
});

// Extra functions -------------------------------------------------------------------------------------------------------------------------------

function getDataString(nodeIterator) {
    var attributes = [], i = 0, nodes, node, childNode, nodeName, depth = 0;

    while(nodeIterator.hasNext()) {
        node = nodeIterator.next();
        attributes[i] = [];
        childNode = node.getFirstChild();
        while(childNode) {
            if(childNode.getFirstChild()) {
                childNode = childNode.getFirstChild();
                depth++;
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
                depth--;
            }
            childNode = childNode.getNextSibling();
        }
        i++;
    }

    return attributes;
}

function getDomainName() {

    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];
       
    return domain_name;

}


function getUrl() {
    
    var domain = getDomainName();
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
        if (kokuServiceEndpoints == null) {
                kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
        }
        
        return kokuServiceEndpoints.services[serviceName];
}

function gup(name) {
    var regexS, regex, restuls;

    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regexS = "[\\?&]" + name + "=([^&#]*)";
    regex = new RegExp(regexS);
    results = regex.exec(window.location.href);
    if (results == null) {
        return false;
    } else {
        return results[1];
    }
}

function showDialog (dialogId, text, textTitle, title) {
    var dialog, cddDisplay;

    dialog = $("#" + dialogId);
    
    cssDisplay = dialog.css('display');
    if (cssDisplay === 'none') {
        dialog.dialog({title: title});
        dialog.dialog("option", "width", 400);
        dialog.dialog("option", "height", 300);
        dialog.dialog("option", "position", ['middle', 'middle']);
        dialog.parent().css('display', 'block');
        dialog.dialog();
    } else {
        dialog.dialog({show: null})
    }
    dialog.html("<p style=\"text-align:left;\"><b>" + textTitle + "</b></p><p style=\"margin:0 0 0 0;\">" + text + "</p>");
}