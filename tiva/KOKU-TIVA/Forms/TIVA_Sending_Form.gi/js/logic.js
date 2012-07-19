// Prestart --------------------------------------------------------------------------------------------------------------------------------------

function intalioPreStart() {
    var error;

    TIVAForm.getJSXByName("KKS_lomakeId").setValue(TIVAForm.getJSXByName("KKS_lomake").getValue());
    clearDataCache("Vastaanottajat-nomap");
    mapSelectedRecipientsToMatrix();
    error = checkSuostumukset();
    if(error != "") {
        parent.scrollTo(0, 0); // scroll the parent window up
        return error;
    }
    throughTextfields();
    return null;
}

function getKKSTemplate(templateID){
var nodeiterator, orgnodes, fields, i, splittedId, splittedName, temp;
kkscode = TIVAForm.getJSXByName("KKS_koodi").getValue();
childid = TIVAForm.getJSXByName("KKS_childuid").getValue();
formData = Arcusys.Internal.Communication.GetKKSformInstances(kkscode, childid);
nodeIterator = formData.selectNodeIterator("//return", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
orgnodes = getDataString(nodeIterator);

for (i=0; i<orgnodes.length; i++){
    if((orgnodes[i]["instanceId"]) == templateID){
        temp = orgnodes[i]["fields_fieldId"];
        splittedId = temp.split(",");
        
        temp = orgnodes[i]["fields_fieldName"];
        splittedName = temp.split(",");
        mapAttributesToDropdown(splittedId, splittedName, "Attribuutit");
        return;
        }     
}
}

// Could be combined with the other mapping function.
function mapAttributesToDropdown(sourceArray1, sourceArray2, dropBox){
var returnXML, i, j;
returnXML= "<data>";
j = sourceArray1.length-1;

for (i = 0; i <= j; i++) {
    // Creates xml string for the dropdown box to show the different kks -forms.
    returnXML = returnXML + "<record jsxid=\"" + sourceArray1[i] + "\" jsxtext=\"" + sourceArray2[i] + "\"/>";
    }    
    returnXML = returnXML + "</data>";

  TIVAForm.getJSXByName(dropBox).setDefaultText("-Valitse-").repaint();
  TIVAForm.getJSXByName(dropBox).setXMLString(returnXML);
  TIVAForm.getJSXByName(dropBox).resetXmlCacheData();
  TIVAForm.getJSXByName(dropBox).repaint();
  
  return returnXML;
  
}

function addToMatrix(addition, additionId, matrix, cache, attribute, sourcecache){
var childIterator, childNode, node, hasEmptyChild, val;
  val =  TIVAForm.getCache().getDocument(sourcecache).selectSingleNode("//record[@jsxid='" + addition + "']/@jsxtext").getValue();

 /*
  TIVAForm.getJSXByName(matrix).commitAutoRowSession();
  childIterator = TIVAForm.getCache().getDocument(cache).getChildIterator();
   while (childIterator.hasNext())
    childNode = childIterator.next();       
    childNode.setAttribute(attribute, val);
    childNode.setAttribute(additionId, addition);
  
  TIVAForm.getJSXByName("KKS_kentat").repaint();
  
  if(hasEmptyChild) {
        TIVAForm.getCache().getDocument(cache).removeChild(TIVAForm.getCache().getDocument(cache).getFirstChild());
  } 
  */

    var node, hasEmptyChild;
    hasEmptyChild = formatDataCache(cache, matrix);
    node = TIVAForm.getCache().getDocument(cache).getFirstChild().cloneNode();

    node.setAttribute("jsxid", addition);
    node.setAttribute(additionId, addition);
    node.setAttribute(attribute, val);

    TIVAForm.getCache().getDocument(cache).insertBefore(node);

    if(hasEmptyChild) {
        TIVAForm.getCache().getDocument(cache).removeChild(TIVAForm.getCache().getDocument(cache).getFirstChild());
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
    if(value !== null && value !== undefined && isNaN(value) && value.replace()) {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

/* checks for error before sending form to processing
 */
function checkSuostumukset() {

    if(TIVAForm.getCache().getDocument("Toimenpiteet-nomap").getFirstChild() == null) {
        return "Lomakkeelle ei ole valittu suostumuspohjaa!";
    }

    if(TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild() == null) {
        return "Suostumukselta puuttuvat vastaanottajat";
    }
    return "";
}

// General functions -----------------------------------------------------------------------------------------------------------------------------

function formatDataCache(cache, matrix) {
    if(TIVAForm.getCache().getDocument(cache).getFirstChild() == null) {
    commitCustomAutoRowSession(matrix, cache);
        return true;
    } else {
        return false;
    }
}

function clearDataCache(cacheName, matrixName) {
    while(TIVAForm.getCache().getDocument(cacheName).getFirstChild() != null) {
        TIVAForm.getCache().getDocument(cacheName).removeChild(TIVAForm.getCache().getDocument(cacheName).getFirstChild());
    }
    if(matrixName) {
        TIVAForm.getJSXByName(matrixName).repaintData();
    }
}

function swapConsentGivers(selection) {
    if(selection == 1) {
        TIVAForm.getJSXByName("Suostumus_Extend1").setValue("Child");
    } else if(selection == 2) {
        TIVAForm.getJSXByName("Suostumus_Extend1").setValue("AnyParent");
    } else if(selection == 3) {
        TIVAForm.getJSXByName("Suostumus_Extend1").setValue("BothParents");
    }
}

function setTargetPerson() {
    TIVAForm.getJSXByName("Suostumus_Kohdehenkilo").setValue(TIVAForm.getJSXByName("Viesti_Kohdehenkilo").getText());
}

function mapChoicesToMatrix(id, description, infotext) {
    var node, hasEmptyChild;
    hasEmptyChild = formatDataCache("Toimenpiteet-nomap", "Toimenpiteet");
    node = TIVAForm.getCache().getDocument("Toimenpiteet-nomap").getFirstChild().cloneNode();

    node.setAttribute("jsxid", id);
    node.setAttribute("Toimenpiteet_ToimenpideId", id);
    node.setAttribute("Toimenpiteet_Kuvaus", description);
    if(infotext) {
        node.setAttribute("Toimenpiteet_Tarkentava_Teksti", infotext);
    }

    TIVAForm.getCache().getDocument("Toimenpiteet-nomap").insertBefore(node);

    if(hasEmptyChild) {
        TIVAForm.getCache().getDocument("Toimenpiteet-nomap").removeChild(TIVAForm.getCache().getDocument("Toimenpiteet-nomap").getFirstChild());
    }
}

function removeChoice(node, id) {
    TIVAForm.getJSXByName("block").removeChild(node);
    TIVAForm.getCache().getDocument("Toimenpiteet-nomap").removeChild(TIVAForm.getCache().getDocument("Toimenpiteet-nomap").selectSingleNode("//record[@Toimenpiteet_ToimenpideId='" + id + "']"));
    TIVAForm.getJSXByName("block").setHeight(TIVAForm.getJSXByName("block").getHeight() - 30, true).repaint();
}

function getData(nodeIterator) {
    var attributes = [], i = 0, nodes, node;

    while(nodeIterator.hasNext()) {
        node = nodeIterator.next();
        attributes[i] = [];
        childNode = node.getFirstChild();
        while(childNode) {
            attributes[i][childNode.getNodeName()] = childNode.getValue();
            childNode = childNode.getNextSibling();
        }
        i++;
    }

    return attributes;
}

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

// Inserting a template --------------------------------------------------------------------------------------------------------------------------

function addChoice(id, description, infotext, prefill) {
    var section, label, choiceId, info;
    section = TIVAForm.getJSXByName("block").load("components/choice.xml", true);
    label = section.getFirstChild().getFirstChild().getChild("choiceLabel");
    choiceId = section.getChild("choiceId");
    info = section.getDescendantOfName("choice_tarkentavaTeksti");

    TIVAForm.getJSXByName("block").setHeight(TIVAForm.getJSXByName("block").getHeight() + 30, true).repaint();

    if(prefill) {
        // section.getDescendantOfName("remChoice").setDisplay("none", true);
    }
    // section.getDescendantOfName("remChoice").setDisplay("block", true);
    if(infotext) {
        info.setValue(infotext);
        section.getDescendantOfName("tooltipImg").setDisplay("inline !important", true);
    } else {
        section.getDescendantOfName("tooltipImg").setDisplay("block", true);
    }
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    label.setText(description, true);
    choiceId.setValue(id);

    mapChoicesToMatrix(id, description, infotext);
}

function mapFormDataToFields(objXML) {
    // Get basic information from xml document
    var i, pohjaId, otsikko, saateteksti, laatijaUid, laatijaData, attributes;
    pohjaId = objXML.selectSingleNode("//suostumuspohjaId", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    otsikko = objXML.selectSingleNode("//otsikko", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    saateteksti = objXML.selectSingleNode("//saateteksti", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    laatijaUid = objXML.selectSingleNode("//laatija", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    KKSkoodi = objXML.selectSingleNode("//code", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
    laatijaData = Arcusys.Internal.Communication.getUserInfo(laatijaUid);
    otsikko = removeQuotes(otsikko);
    saateteksti = removeQuotes(saateteksti);
    attributes = getAttributes(objXML);

    for( i = 0; i < attributes.length; i++) {
        addChoice(attributes[i][0], attributes[i][1], attributes[i][2], true);
    }

    // Map values to the form fields
    TIVAForm.getJSXByName("KKS_koodi").setValue(KKSkoodi);


    if (KKSkoodi != null) {

        prefillKKS(KKSkoodi);
        }
    TIVAForm.getJSXByName("Suostumus_SuostumusId").setValue(pohjaId);
    TIVAForm.getJSXByName("Pohja_Otsikko").setValue(otsikko);
    TIVAForm.getJSXByName("Pohja_Kuvaus").setValue(saateteksti);
    TIVAForm.getJSXByName("Suostumus").setTitleText(otsikko, true);
    TIVAForm.getJSXByName("Suostumus_Kuvaus").setText(saateteksti, true);
    if(laatijaUid) {
        TIVAForm.getJSXByName("Pohja_Laatija").setValue(laatijaUid);
        TIVAForm.getJSXByName("laatija_label").setText("<b>Laatija: </b>" + laatijaData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue() + " " + laatijaData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue(), true);
    }
}

function prefillKKS(kkscode){
var formData, testi, nodeIterator, formData, childid, childnode, xmlstring = "", test, userid, kksformvalues, organizations;
var fieldID, fieldInstance;
xmlstring = "<data>"
userid = TIVAForm.getJSXByName("Kayttaja_Lahettaja").getValue();
childid = TIVAForm.getJSXByName("KKS_childuid").getValue();
formData = Arcusys.Internal.Communication.GetKKSformInstances(kkscode, childid);
nodeIterator = formData.selectNodeIterator("//return", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");

kksformvalues = getDataString(nodeIterator);
mapToDropdown(kksformvalues, "instanceId", "instanceName", "KKS_lomake");

organizations = Arcusys.Internal.Communication.getUserOrg(userid);
nodeIterator = organizations.selectNodeIterator("//organization", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
kksformvalues = getDataString(nodeIterator);
mapToDropdown(kksformvalues, "organizationId", "organizationName", "Organisaatio");
}


function mapToDropdown(sourceArray, idValue, idText, dropBox){
var returnXML, i, j;
returnXML= "<data>";
j = sourceArray.length-1;

for (i = 0; i <= j; i++) {
    // Creates xml string for the dropdown box to show the different kks -forms.
    returnXML = returnXML + "<record jsxid=\"" + sourceArray[i][idValue] + "\" jsxtext=\"" + sourceArray[i][idText] + "\"/>";
    }    
    returnXML = returnXML + "</data>";

  TIVAForm.getJSXByName(dropBox).setDefaultText("-Valitse-").repaint();
  TIVAForm.getJSXByName(dropBox).setXMLString(returnXML);
  TIVAForm.getJSXByName(dropBox).resetXmlCacheData();
  TIVAForm.getJSXByName(dropBox).repaint();
  
  return returnXML;
  
}


function getTemplate(id) {
    var formData;


    while(TIVAForm.getJSXByName("block").getFirstChild() != null) {
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
    var i = 0, j = 0, attributes = [], toimenpiteet = objXML.selectNodeIterator("//toimenpiteet"), node, childNode;

    while(toimenpiteet.hasNext()) {
        node = toimenpiteet.next();
        if(!node.getFirstChild()) {
            break;
        }
        attributes[i] = [];
        childNode = node.getFirstChild();
        while(childNode != null) {
            attributes[i][j] = childNode.getValue();
            childNode = childNode.getNextSibling();
            j++;
        }
        j = 0;
        i++;
    }
    return attributes;
}




// Preload ---------------------------------------------------------------------------------------------------------------------------------------

function preload() {
    var username;

    getTemplates("");
    username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\") + 1));
    uidData = Arcusys.Internal.Communication.GetUserUidByLooraname(username);
    uid = uidData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
    userRealName = getUserRealName(uid);
    TIVAForm.getJSXByName("Kayttaja_NakyvaLahettaja").setValue(userRealName).repaint();
    TIVAForm.getJSXByName("Kayttaja_Lahettaja").setValue(uid).repaint();
}

function getUserRealName(uid) {
    var userData, firstname, lastname;
    userData = Arcusys.Internal.Communication.getUserInfo(uid);
    if (userData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'") && userData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'")) {
        firstname = userData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
        lastname = userData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
        return firstname + " " + lastname;
    } else {
        return null;
    }
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
    var node, i = 0, hasEmptyChild;
    hasEmptyChild = formatDataCache("Pohjat-nomap", "Pohjat");

    while(id.get(i)) {
        node = TIVAForm.getCache().getDocument("Pohjat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", id.get(i).getValue());
        node.setAttribute("jsxtext", topic.get(i).getValue());

        TIVAForm.getCache().getDocument("Pohjat-nomap").insertBefore(node);
        i++;
    }

    if(hasEmptyChild) {
        TIVAForm.getCache().getDocument("Pohjat-nomap").removeChild(TIVAForm.getCache().getDocument("Pohjat-nomap").getFirstChild());
    }
}

// Functions related to recipients mapping -------------------------------------------------------------------------------------------------------

function mapRecipients(recipients) {
    var node, i, hasEmptyChild;

    clearDataCache("Vastaanottajat-nomap");
    hasEmptyChild = formatDataCache("Vastaanottajat-nomap", "Vastaanottajat");

    for( i = 0; i < recipients.length; i++) {
        node = TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", i);
        node.setAttribute("Vastaanottajat_Vastaanottaja", recipients[i]);
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").insertBefore(node);
    }
    if(hasEmptyChild) {
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").removeChild(TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild());
    }
}

function mapSelectedRecipientsToMatrix() {
    var node, childNode, hasEmptyChild, counter, recipients, targetPerson, childIterator;

    clearDataCache("Vastaanottajat-nomap");
    counter = 1;
    childIterator = TIVAForm.getCache().getDocument("receipientsToShow-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("Vastaanottajat-nomap", "Vastaanottajat");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        recipients = childNode.getAttribute("recipientsUid").split(',');
        targetPerson = childNode.getAttribute("uid");
        for( i = 0; i < recipients.length; i++) {
            if(recipients[i]) {
                node = TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild().cloneNode();
                node.setAttribute("jsxid", counter);
                node.setAttribute("Vastaanottajat_Vastaanottaja", recipients[i]);
                node.setAttribute("Vastaanottajat_Kohdehenkilo", targetPerson);
                TIVAForm.getCache().getDocument("Vastaanottajat-nomap").insertBefore(node);
                counter++;
            }
        }
    }

    if(hasEmptyChild) {
        TIVAForm.getCache().getDocument("Vastaanottajat-nomap").removeChild(TIVAForm.getCache().getDocument("Vastaanottajat-nomap").getFirstChild());
    }
}

function searchNames(searchString) {
    var node, hasAnotherParent = false, hasEmptyChild, entryFound, userData, xmlData, personInfo, list, parents, parentData, parentInfo, parentList, vanhempi, vanhempiUid;
    entryFound = false;

    if(searchString == "") {
        alert("Sy\u00F6t\u00E4 hakusana");
        return;
    }
    searchString = searchString.toLowerCase();
    childData = Arcusys.Internal.Communication.GetChildren(searchString);

/*
    status = childData.selectSingleNode("//status", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    if(status == "error") {
        error = childData.selectSingleNode("//message", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        if(error.search("Creation of the user by UID '' - should be used for test purposes only") != -1) {
            alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
        } else {
            alert("Vastaanottajan hakemisessa tapahtui virhe! Virheviesti: " + error);
        }
    } else {
*/
        if(childData.selectSingleNode("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'") && childData.selectSingleNode("//parents", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
            entryFound = true;
        }

        if(entryFound) {
            TIVAForm.getJSXByName("KKS_kentat").setDisplay("block").repaint();

            clearDataCache("HaetutLapset-nomap", "searchChildMatrix");
            hasEmptyChild = formatDataCache("HaetutLapset-nomap", "searchChildMatrix");
            nodeIterator = childData.selectNodes("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
            childArray = getDataString(nodeIterator);

            for( i = 0; i < childArray.length; i++) {
                if(childArray[i]["parents_uid"]) {
                    node = TIVAForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild().cloneNode();
                    node.setAttribute("jsxid", 0);
                    node.setAttribute("valittu", 1);
                    node.setAttribute("etunimi", childArray[i]["firstname"]);
                    node.setAttribute("sukunimi", childArray[i]["lastname"]);
                    node.setAttribute("uid", childArray[i]["uid"]);
                    TIVAForm.getJSXByName("KKS_childuid").setValue(childArray[i]["uid"]);
                    node.setAttribute("vanhempi", childArray[i]["parents_displayName"]);
                    node.setAttribute("vanhempiUid", childArray[i]["parents_uid"]);
                    TIVAForm.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);
                }
            }

            TIVAForm.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);
            // replaceNode(node, TivaTietopyyntoForm.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild());
            if(hasEmptyChild == true) {
                TIVAForm.getCache().getDocument("HaetutLapset-nomap").removeChild(TIVAForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild());
            }

            TIVAForm.getJSXByName("searchChildMatrix").repaintData();

        } else {
            alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
        }
    }


function addToRecipients(selection) {
    if(!selection) {
        alert("Suostujat-kentt\u00E4 on tyhj\u00E4. Vastaanottajia ei haettu.");
        return;
    }

    var counter, node, hasEmptyChild, chosen, childIterator, uid, targetPerson, firstname, lastname, vanhempi1, vanhempi2, vanhempi1Uid, vanhempi2Uid, childNode;

    clearDataCache("receipientsToShow-nomap");
    counter = TIVAForm.getJSXByName("recipientCounter").getValue();
    childIterator = TIVAForm.getCache().getDocument("HaetutLapset-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        chosen = childNode.getAttribute("valittu");

        if((chosen != null) && (chosen != 0)) {
            node = TIVAForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();
            uid = childNode.getAttribute("uid");
            firstname = childNode.getAttribute("etunimi");
            lastname = childNode.getAttribute("sukunimi");
            vanhemmat = childNode.getAttribute("vanhempi");
            vanhemmatUid = childNode.getAttribute("vanhempiUid");
            targetPerson = firstname + " " + lastname;

            node.setAttribute("jsxid", counter);
            if(selection == 1) {
                node.setAttribute("recipients", firstname + " " + lastname);
                node.setAttribute("recipientsUid", uid);
            } else {
                node.setAttribute("recipients", vanhemmat);
                node.setAttribute("recipientsUid", vanhemmatUid);
            }
            node.setAttribute("targetPerson", targetPerson);
            node.setAttribute("uid", uid);
            node.setAttribute("group", 0);
            TIVAForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;
        }
    }
    if(hasEmptyChild == true) {
        TIVAForm.getCache().getDocument("receipientsToShow-nomap").removeChild(TIVAForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    TIVAForm.getJSXByName("dummyMatrix").repaintData();
    TIVAForm.getJSXByName("recipientCounter").setValue(counter);
}

function parseXML(xmlData, rootName, childlist) {
    var i = 0, j, attributes, node, childNode, childs;
    attributes = [];
    childs = xmlData.selectNodeIterator("/\/" + rootName);

    while(childs.hasNext()) {
        attributes[i] = [];
        node = childs.next();
        if(node == null) {
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
 * Compresesses multidimensional array to sigle dimensional
 * Users information comma seperated. One user/node.
 */
function valuesToArray(attributes) {
    var tempArray = [], i, j, line;

    for( i = 0; i < attributes.length; i++) {
        line = "";
        for( j = 0; j < attributes[i].length; j++) {
            line = line + attributes[i][j];
            if(j < (attributes[i].length - 1)) {
                line = line + ",";
            }
        }
        tempArray[i] = line;
    }
    return tempArray;
}




// Web Service Calls -----------------------------------------------------------------------------------------------------------------------------

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetKKSformInstances = function(kksValue, child) {
        var tout, pohjaId, msg, endpoint, url, req, objXML, targetperson, kks;
        tout = 1000;
        kks = kksValue;
        targetperson = child;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getKksFormInstances><kksCode>" + kks + "</kksCode><targetPersonUid>" + targetperson + "</targetPersonUid></soa:getKksFormInstances></soapenv:Body></soapenv:Envelope>";
        endpoint = getEndpoint("KokuSuostumusProcessingService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();
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


/* GetFormData(id)
 ** Requests for consent object
 ** param: id = id of the consent object (formId)
 ** returns consent object
 */
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetFormData = function(id) {
        var tout, pohjaId, msg, endpoint, url, req, objXML;
        tout = 1000;
        pohjaId = id;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getConsentTemplateById><pohjaId>" + pohjaId + "</pohjaId></soa:getConsentTemplateById></soapenv:Body></soapenv:Envelope>";
        endpoint = getEndpoint("KokuSuostumusProcessingService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();
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
/* Requests for consent template objects
 ** param: str - filters templates by name
 ** returns: template objects
 */
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.getTemplatesData = function(str) {
        var tout, msg, endpoint, url, req, objXML;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:selaaSuostumuspohjat><searchString>" + str + "</searchString><limit>100</limit></soa:selaaSuostumuspohjat></soapenv:Body></soapenv:Envelope>";
        endpoint = getEndpoint("KokuSuostumusProcessingService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuSuostumusProcessingServiceImpl";
        url = getUrl();
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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserUidByLooraname = function(username) {

        var tout = 1000;
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByLooraName><looraUsername>" + username + "</looraUsername></soa:getUserUidByLooraName></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();

        endpoint = getEndpoint("UsersAndGroupsService");
        // var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        var req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        var objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess\xE4");
        } else {
            return objXML;

        }
    };
});

// gets the organizations
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.getUserOrg = function(id) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserOrganizations><userUid>" + id + "</userUid></soa:getUserOrganizations></soapenv:Body></soapenv:Envelope>";
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
// Extra functions -------------------------------------------------------------------------------------------------------------------------------

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

kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
    if(kokuServiceEndpoints == null) {
        kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
    }

    return kokuServiceEndpoints.services[serviceName];
}

jsx3.lang.Package.definePackage("Intalio.Internal.CustomErrors", function(error) {
    error.getError = function(name) {
        var errortext = TIVAForm.getJSXByName(name).getTip();
        errortext = "Puuttuvat tiedot: " + errortext;
        parent.scrollTo(0, 0); // scroll the parent window up
        return errortext;
    };
});
function showDialog(dialogId, text, textTitle, title) {
    var dialog = $jq("#" + dialogId), cssDisplay = dialog.css('display');

    if(cssDisplay === 'none') {
        dialog.dialog({
            title : title
        });
        dialog.dialog("option", "width", 400);
        dialog.dialog("option", "height", 300);
        dialog.dialog("option", "position", ['middle', 'middle']);
        dialog.parent().css('display', 'block');
        dialog.dialog();
    } else {
        dialog.dialog({
            show : null
        });
    }

    dialog.html("<p style=\"text-align:left;\"><b>" + textTitle + "</b></p><p style=\"margin:0 0 0 0;\">" + text + "</p>");
}

function removeQuotes(str) {
    str = str.replace(/['"]/g, '');

    return str;
}
