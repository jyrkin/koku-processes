// Prestart --------------------------------------------------------------------------------------------------------------------------------------

function intalioPreStart() {
    clearDataCache("Vastaanottajat-nomap");
    mapSelectedRecipientsToMatrix();
    if (TIVA3Form.getCache().getDocument("Vastaanottajat-nomap").getFirstChild().getAttribute("Vastaanottajat_Vastaanottaja2") != "") {
        TIVA3Form.getJSXByName("Kayttaja_UseampiVastaanottaja").setChecked(1);
    }
}

// General functions -----------------------------------------------------------------------------------------------------------------------------

function isValidDate(node, pastOrFuture) {
    var checkDate, checkDate1, checkDate2, checkDate3, today;

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
    if (checkDate < today && pastOrFuture == 1) {
        alert('Virheellinen p\u00E4iv\u00E4m\u00E4\u00E4r\u00E4. P\u00E4iv\u00E4m\u00E4\u00E4r\u00E4n t\u00E4ytyy olla t\u00E4t\u00E4 hetke\u00E4 my\u00F6hemm\u00E4lt\u00E4 ajanjaksolta!');
        node.setValue("");
    } else if (checkDate > today && pastOrFuture == 0) {
        alert('Virheellinen p\u00E4iv\u00E4m\u00E4\u00E4r\u00E4. P\u00E4iv\u00E4m\u00E4\u00E4r\u00E4n t\u00E4ytyy olla t\u00E4t\u00E4 hetke\u00E4 aikaisemmalta ajanjaksolta!');
        node.setValue("");
    }
}

function clearDataCache(cacheName) {
    while (TIVA3Form.getCache().getDocument(cacheName).getFirstChild() != null) {
        TIVA3Form.getCache().getDocument(cacheName).removeChild(TIVA3Form.getCache().getDocument(cacheName).getFirstChild());
    }
}

function formatDataCache(cache, matrix) {
    if (TIVA3Form.getCache().getDocument(cache).getFirstChild() == null) {
        TIVA3Form.getJSXByName(matrix).commitAutoRowSession();
        return true;
    } else {
        return false;
    }
}

function enabledOnValue(target, value, validValue) {
    if (value == validValue) {
        target.setEnabled(1, true);
    } else {
        target.setValue("");
        target.setEnabled(0, true);
    }
}

function setRequirements(node, value) {
    node.setRequirement(value, true);
}

function uncheckAll(target, check) {
    var i, descendants;

    descendants = target.getDescendantsOfType("jsx3.gui.CheckBox");
    if (!check) {
        for (i = 0; i < descendants.length; i++) {
            descendants[i].setEnabled(1, true);
        }
    } else {
        for (i = 0; i < descendants.length; i++) {
            descendants[i].setChecked(0);
            descendants[i].setEnabled(0, true);
        }
    }
}

function uncheckTheOthers(target, checked) {
    var i, descendants;

    descendants = target.getDescendantsOfType("jsx3.gui.CheckBox");
    for (i = 0; i < descendants.length; i++) {
        if (descendants[i] != checked) {
            descendants[i].setChecked(0);
        }
    }
}

// Functionality ---------------------------------------------------------------------------------------------------------------------------------

function swapConsentGivers(selection) {
    if (selection == 2) {
        TIVA3Form.getJSXByName("suostuja").getAncestorOfName("pane").setDisplay("block", true);
    } else {
        TIVA3Form.getJSXByName("suostuja").getAncestorOfName("pane").setDisplay("none", true);
    }
}

function formatConsentFields() {
    if (TIVA3Form.getCache().getDocument("receipientsToShow-nomap").getFirstChild().getAttribute("receipient2")) {
        activateVoimassaoloaikaFields(1);
    } else {
        activateVoimassaoloaikaFields(0);
    }
}

function activateVoimassaoloaikaFields(check) {
    TIVA3Form.getJSXByName("Suostumus1_Suostumustapa").setValue("");
    TIVA3Form.getJSXByName("Suostumus1_Suostumusajankohta").setValue("");

    TIVA3Form.getJSXByName("Suostumus2_Suostumustapa").setValue("");
    TIVA3Form.getJSXByName("Suostumus2_Suostumusjankohta").setValue("");

    if (check) {
        TIVA3Form.getJSXByName("Suostumus2").setDisplay("block", true);
        TIVA3Form.getJSXByName("Suostumus2_Suostumustapa").setRequired(1, true).repaint();
        TIVA3Form.getJSXByName("Suostumus2_Suostumusjankohta").setRequired(1, true).repaint();
    } else {
        TIVA3Form.getJSXByName("Suostumus2").setDisplay("none", true);
        TIVA3Form.getJSXByName("Suostumus2_Suostumustapa").setRequired(0, true);
        TIVA3Form.getJSXByName("Suostumus2_Suostumusjankohta").setRequired(0, true);
    }
}

function setSuostujat() {
    var suostuja1, suostuja2, suostuja1Uid, suostuja2Uid, targetPerson;

    suostuja1 = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild().getAttribute("vanhempi1");
    suostuja1Uid = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild().getAttribute("vanhempi1Uid");
    suostuja2 = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild().getAttribute("vanhempi2");
    suostuja2Uid = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild().getAttribute("vanhempi2Uid");
    targetPerson = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild().getAttribute("uid");

    TIVA3Form.getJSXByName("suostuja").setXMLString("<data><record jsxid=\"" + suostuja1Uid + "\" jsxtext=\"" + suostuja1 + "\" targetPerson=\"" + targetPerson + "\"\/><record jsxid=\"" + suostuja2Uid + "\" jsxtext=\"" + suostuja2 + "\" targetPerson=\"" + targetPerson + "\"\/></data>").resetCacheData();
}

function clearRecipientsData() {
    TIVA3Form.getJSXByName("Kayttaja_Vastaanottaja2").setValue("");
    TIVA3Form.getJSXByName("Suostumus2_Suostumustapa").setValue("").repaint();
    TIVA3Form.getJSXByName("Suostumus2_Suostumusjankohta").setValue("").repaint();
}

function setTargetPerson() {
    TIVA3Form.getJSXByName("Suostumus_Kohdehenkilo").setValue(TIVA3Form.getJSXByName("Viesti_Kohdehenkilo").getText());
}

function getUserName(id) {
    var objXML, firstName, lastName, name;

    objXML = Arcusys.Internal.Communication.getUserInfo(id);
    firstName = objXML.selectSingleNode("//firstname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    lastName = objXML.selectSingleNode("//lastname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    name = firstName + " " + lastName;
    return name;
}

// Templates -------------------------------------------------------------------------------------------------------------------------------------

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

function getTemplate(id) {
    var formData;

    while (TIVA3Form.getJSXByName("block").getFirstChild() != null) {
        TIVA3Form.getJSXByName("block").removeChild(TIVA3Form.getJSXByName("block").getFirstChild());
        TIVA3Form.getJSXByName("block").setHeight(TIVA3Form.getJSXByName("block").getHeight() - 30, true).repaint();
    }

    clearDataCache("Toimenpiteet-nomap");

    TIVA3Form.getJSXByName("Pohja_PohjaId").setValue(id);

    formData = Arcusys.Internal.Communication.GetFormData(id);

    if (formData != null) {
        mapFormDataToFields(formData);
    }
}

function mapFieldsToMatrix(id, topic) {
    var node, i = 0, hasEmptyChild;

    clearDataCache("Pohjat-nomap");

    hasEmptyChild = formatDataCache("Pohjat-nomap", "Pohjat");

    while (id.get(i)) {

        node = TIVA3Form.getCache().getDocument("Pohjat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", id.get(i).getValue());
        node.setAttribute("jsxtext", topic.get(i).getValue());
        TIVA3Form.getCache().getDocument("Pohjat-nomap").insertBefore(node);
        i++;
    }

    if (hasEmptyChild == true) {
        TIVA3Form.getCache().getDocument("Pohjat-nomap").removeChild(TIVA3Form.getCache().getDocument("Pohjat-nomap").getFirstChild());
    }
}

// Add Actions -----------------------------------------------------------------------------------------------------------------------------------

function mapChoicesToMatrix(id, description, infotext) {
    var node, answerNode, hasEmptyChild, answerHasEmptyChild;

    clearDataCache("Vastaukset-nomap");
    clearDataCache("Toimenpiteet-nomap");

    hasEmptyChild = formatDataCache("Toimenpiteet-nomap", "Toimenpiteet");
    answerHasEmptyChild = formatDataCache("Vastaukset-nomap", "Vastaukset");

    node = TIVA3Form.getCache().getDocument("Toimenpiteet-nomap").getFirstChild().cloneNode();
    answerNode = TIVA3Form.getCache().getDocument("Vastaukset-nomap").getFirstChild().cloneNode();

    node.setAttribute("jsxid", id);
    answerNode.setAttribute("jsxid", id);
    node.setAttribute("Toimenpiteet_ToimenpideId", id);
    answerNode.setAttribute("Vastaukset_VastausId", id);
    answerNode.setAttribute("Vastaukset_Vastaus", true);
    node.setAttribute("Toimenpiteet_Kuvaus", description);
    if (infotext) {
        node.setAttribute("Toimenpiteet_Tarkentava_Teksti", infotext);
    }
    TIVA3Form.getCache().getDocument("Toimenpiteet-nomap").insertBefore(node);
    TIVA3Form.getCache().getDocument("Vastaukset-nomap").insertBefore(answerNode);
    if (hasEmptyChild) {
        TIVA3Form.getCache().getDocument("Toimenpiteet-nomap").removeChild(TIVA3Form.getCache().getDocument("Toimenpiteet-nomap").getFirstChild());
    }
    if (answerHasEmptyChild) {
        TIVA3Form.getCache().getDocument("Vastaukset-nomap").removeChild(TIVA3Form.getCache().getDocument("Vastaukset-nomap").getFirstChild());
    }
}

function removeChoice(node, id) {
    TIVA3Form.getJSXByName("block").removeChild(node);
    TIVA3Form.getCache().getDocument("Toimenpiteet-nomap").removeChild(TIVA3Form.getCache().getDocument("Toimenpiteet-nomap").selectSingleNode("//record[@Toimenpiteet_ToimenpideId='" + id + "']"));
    TIVA3Form.getJSXByName("block").setHeight(TIVA3Form.getJSXByName("block").getHeight() - 30, true).repaint();
}

function addChoice(id, description, infotext, prefill) {
    var section, label, choiceId, info;

    section = TIVA3Form.getJSXByName("block").load("components/choice.xml", true);

    TIVA3Form.getJSXByName("block").setHeight(TIVA3Form.getJSXByName("block").getHeight() + 30, true).repaint();

    label = section.getFirstChild().getFirstChild().getChild("choiceLabel");
    choiceId = section.getChild("choiceId");
    info = section.getDescendantOfName("choice_tarkentavaTeksti");
    if (prefill) {
        section.getDescendantOfName("remChoice").setDisplay("none", true);
    }

    if (infotext) {
        info.setValue(infotext);
    } else {
        section.getDescendantOfName("tooltipImg").setDisplay("none", true);
    }
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    label.setText(description, true);
    choiceId.setValue(id);

    mapChoicesToMatrix(id, description, infotext);
}

// Preload ---------------------------------------------------------------------------------------------------------------------------------------

function preload() {
    var username;

    getTemplates("");
    username = Intalio.Internal.Utilities.getUser();
    username = username.substring(username.indexOf("/") + 1);
    TIVA3Form.getJSXByName("Kayttaja_Lahettaja").setValue(username).repaint();
}

function mapFormDataToFields(objXML) {
    // Get basic information from xml document
    var i, pohjaId, otsikko, saateteksti, laatijaUid, laatijaData, attributes;

    pohjaId = objXML.selectSingleNode("//suostumuspohjaId", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    otsikko = objXML.selectSingleNode("//otsikko", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    saateteksti = objXML.selectSingleNode("//saateteksti", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    laatijaUid = objXML.selectSingleNode("//laatija", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    laatijaData = Arcusys.Internal.Communication.getUserInfo(laatijaUid);
    attributes = getAttributes(objXML);

    for (i = 0; i < attributes.length; i++) {
        addChoice(attributes[i][0], attributes[i][1], attributes[i][2], true);
    }

    // Map values to the form fields
    TIVA3Form.getJSXByName("Suostumus_SuostumusId").setValue(pohjaId);
    TIVA3Form.getJSXByName("Suostumus").setTitleText(otsikko, true);
    TIVA3Form.getJSXByName("Suostumus_Kuvaus").setText(saateteksti, true);
    if (laatijaUid) {
        TIVA3Form.getJSXByName("Pohja_Laatija").setValue(laatijaUid).repaint();
        TIVA3Form.getJSXByName("laatija_label").setText("<b>Laatija: </b>" + laatijaData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue() + " " + laatijaData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue(), true);
    }
}

function getAttributes(objXML) {
    var i = 0, j = 0, attributes, toimenpiteet, node, childNode;

    attributes = [];
    toimenpiteet = objXML.selectNodeIterator("//toimenpiteet");
    while (toimenpiteet.hasNext()) {
        attributes[i] = [];
        node = toimenpiteet.next();
        childNode = node.getFirstChild();
        while (childNode != null) {
            attributes[i][j] = childNode.getValue();
            childNode = childNode.getNextSibling();
            j++;
        }
        j = 0;
        i++;
    }
    return attributes;
}

// Recipients functions --------------------------------------------------------------------------------------------------------------------------

function validateAddToRecipients(selection) {
    if (!selection) {
        alert("Suostujat-kentt\u00E4 on tyhj\u00E4. Vastaanottajia ei haettu.");
        return false;
    } else if (selection == 2 && !TIVA3Form.getJSXByName("suostuja").getValue()) {
        alert("Olet valinnut suostumustyypiksi toinen huoltajista, mutta suostuja-kentt\u00E4 on tyhj\u00E4");
        return false;
    } else {
        return true;
    }
}

function setSuostuja2FieldsRequirements(flag) {
    TIVA3Form.getJSXByName("Suostumus2_Suostumustapa").setEnabled(flag, true);
    TIVA3Form.getJSXByName("Suostumus2_Suostumusjankohta").setEnabled(flag, true);
}


/**
 * inserts selected users to real matrix that values can be later used in Intalio process.
 *
 */
function mapSelectedRecipientsToMatrix() {
    var node, childNode, hasEmptyChild, counter, recipient1, recipient2, targetPerson, childIterator;

    counter = 1;

    childIterator = TIVA3Form.getCache().getDocument("receipientsToShow-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("Vastaanottajat-nomap", "Vastaanottajat");

    while (childIterator.hasNext()) {
        childNode = childIterator.next();

        recipient1 = childNode.getAttribute("receipient1Uid");
        recipient2 = childNode.getAttribute("receipient2Uid");
        targetPerson = childNode.getAttribute("targetPerson");
        node = TIVA3Form.getCache().getDocument("Vastaanottajat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", counter);
        node.setAttribute("Vastaanottajat_Vastaanottaja1", recipient1);
        node.setAttribute("Vastaanottajat_Vastaanottaja2", recipient2);
        node.setAttribute("Vastaanottajat_Kohdehenkilo", targetPerson);
        TIVA3Form.getCache().getDocument("Vastaanottajat-nomap").insertBefore(node);
        counter++;
    }

    if (hasEmptyChild) {
        TIVA3Form.getCache().getDocument("Vastaanottajat-nomap").removeChild(TIVA3Form.getCache().getDocument("Vastaanottajat-nomap").getFirstChild());
    }
}

function searchNames(searchString) {
    var node, hasEmptyChild, entryFound, userData, xmlData, personInfo, list, parents, parent1, parent2, parent1Data, parent2Data, parent1List, parent2List, parent1Info, parent2Info;
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

        node = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", 0);
        node.setAttribute("etunimi", personInfo[0]);
        node.setAttribute("sukunimi", personInfo[1]);
        node.setAttribute("uid", personInfo[2]);
        node.setAttribute("vanhempi1", parent1Info[0] + " " + parent1Info[1]);
        node.setAttribute("vanhempi2", parent2Info[0] + " " + parent1Info[1]);
        node.setAttribute("vanhempi1Uid", parent1Info[2]);
        node.setAttribute("vanhempi2Uid", parent2Info[2]);

        TIVA3Form.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);

        if (hasEmptyChild == true) {
            TIVA3Form.getCache().getDocument("HaetutLapset-nomap").removeChild(TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getFirstChild());
        }
    } else {
        alert("Valitettavasti antamallasi hakusanalla ei loytynyt tuloksia");
    }

    setSuostujat();
    TIVA3Form.getJSXByName("searchChildMatrix").repaintData();
}

function addToRecipients() {
    var hasEmptyChild, selection;

    selection = TIVA3Form.getJSXByName("suostumuksenAntajat").getValue();

    if (validateAddToRecipients(selection) == false) {
        return;
    }

    clearDataCache("receipientsToShow-nomap");
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    if (selection == 2) {
        addToRecipientsSingle(TIVA3Form.getJSXByName("suostuja").getValue());
    } else {
        addToRecipientsMulti(selection);
    }

    if (hasEmptyChild == true) {
        TIVA3Form.getCache().getDocument("receipientsToShow-nomap").removeChild(TIVA3Form.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }

    TIVA3Form.getJSXByName("dummyMatrix").repaintData();
    formatConsentFields();

}

function addToRecipientsSingle(id) {
    var sourceNode, targetNode;

    sourceNode = TIVA3Form.getCache().getDocument("suostuja-nomap").selectSingleNode("//record[@jsxid='" + id + "']");
    targetNode = TIVA3Form.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

    targetNode.setAttribute("jsxid", "0");
    targetNode.setAttribute("receipient1", sourceNode.getAttribute("jsxtext"));
    targetNode.setAttribute("receipient1Uid", sourceNode.getAttribute("jsxid"));
    targetNode.setAttribute("targetPerson", sourceNode.getAttribute("targetPerson"));

    TIVA3Form.getCache().getDocument("receipientsToShow-nomap").insertBefore(targetNode);

    TIVA3Form.getJSXByName("Suostumus1").setTitleText(sourceNode.getAttribute("jsxid"), true);

    setSuostuja2FieldsRequirements(0);

}

function addToRecipientsMulti(selection) {
    var counter, node, childIterator, uid, firstname, lastname, childNode, vanhempi1, vanhempi2, vanhempi1Uid, vanhempi2Uid, targetPerson;

    counter = TIVA3Form.getJSXByName("recipientCounter").getValue();
    childIterator = TIVA3Form.getCache().getDocument("HaetutLapset-nomap").getChildIterator();

    while (childIterator.hasNext()) {

        childNode = childIterator.next();

        node = TIVA3Form.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

        uid = childNode.getAttribute("uid");
        firstname = childNode.getAttribute("etunimi");
        lastname = childNode.getAttribute("sukunimi");
        vanhempi1 = childNode.getAttribute("vanhempi1");
        vanhempi1Uid = childNode.getAttribute("vanhempi1Uid");
        vanhempi2 = childNode.getAttribute("vanhempi2");
        vanhempi2Uid = childNode.getAttribute("vanhempi2Uid");
        targetPerson = childNode.getAttribute("uid");

        node.setAttribute("jsxid", counter);
        if (selection == 1) {
            TIVA3Form.getJSXByName("Suostumus1").setTitleText(firstname + " " + lastname, true);
            node.setAttribute("receipient1", firstname + " " + lastname);
            node.setAttribute("receipient1Uid", uid);
            setSuostuja2FieldsRequirements(0);
        } else {
            node.setAttribute("receipient1", vanhempi1);
            node.setAttribute("receipient1Uid", vanhempi1Uid);
            node.setAttribute("receipient2", vanhempi2);
            node.setAttribute("receipient2Uid", vanhempi2Uid);
            TIVA3Form.getJSXByName("Suostumus1").setTitleText(vanhempi1, true);
            TIVA3Form.getJSXByName("Suostumus2").setTitleText(vanhempi2, true);
            setSuostuja2FieldsRequirements(1);
        }
        node.setAttribute("targetPerson", targetPerson);
        node.setAttribute("uid", uid);
        node.setAttribute("group", 0);
        TIVA3Form.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
        counter++;

    }
    TIVA3Form.getJSXByName("recipientCounter").setValue(counter);
}

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
        for (j = 0; j < (childlist.length); j++) {
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

function valuesToArray(attributes) {
    var tempArray = [], i, j, line;

    for (i = 0; i < attributes.length; i++) {
        line = "";
        for (j = 0; j < attributes[i].length; j++) {
            line = line + attributes[i][j];
            if (j < (attributes[i].length - 1)) {
                line = line + ",";
            }
        }
        tempArray[i] = line;
    }
    return tempArray;
}

// Web Service Calls -----------------------------------------------------------------------------------------------------------------------------

//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.GetFormData = function (id) {
        var tout, pohjaId, msg, endpoint, url, req, objXML;

        tout = 1000;
        pohjaId = id;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getConsentTemplateById><pohjaId>" + pohjaId + "</pohjaId></soa:getConsentTemplateById></soapenv:Body></soapenv:Envelope>";
        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();

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

//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.getTemplatesData = function (str) {
        var tout, msg, endpoint, url, req, objXML;

        tout = 1000;

        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:selaaSuostumuspohjat><searchString>" + str + "</searchString><limit>10</limit></soa:selaaSuostumuspohjat></soapenv:Body></soapenv:Envelope>";
        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();

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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.GetChildren = function (searchString) {
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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function (arc) {
    arc.getUserInfo = function (id) {
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
    var url, url_parts, domain_name_parts, port_number;

    url = window.location.href;
    url_parts = url.split("/");
    domain_name_parts = url_parts[2].split(":");
    port_number = domain_name_parts[1];
    return port_number;
}


function getUrl() {
    var url = "http://" + getDomainName() + ":" + getPortNumber();
    url = url + "/palvelut-portlet/ajaxforms/WsProxyServlet2";
    //url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";
    return url;
}

/**
 * Gets a parameter from form url.
 */
function gup(name) {
    var regexS, regex, results;

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

function showDialog(dialogId, text, textTitle, title) {
    var dialog, cssDisplay;

    dialog = $("#" + dialogId);

    cssDisplay = dialog.css('display');
    if (cssDisplay === 'none') {
        dialog.dialog({title: title});
        dialog.dialog("option", "width", 400);
        dialog.dialog("option", "height", 300);
        dialog.dialog("option", "position", ['middle', 'middle']);
        dialog.dialog();
    } else {
        dialog.dialog({show: null});
    }
    dialog.html("<p style=\"text-align:left;\"><b>" + textTitle + "</b></p><p style=\"margin:0 0 0 0;\">" + text + "</p>");
}