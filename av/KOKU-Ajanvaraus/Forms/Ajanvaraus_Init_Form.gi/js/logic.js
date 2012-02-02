// Prestart --------------------------------------------------------------------------------------------------------------------------------------

function intalioPreStart() {
    var error, child, parent1, parent2;

    clearDataCache("Recipients-nomap");
    mapSelectedRecipientsToMatrix();

    if(!AjanvarausForm.getCache().getDocument("Recipients-nomap").getFirstChild()) {
        return "Lomakkeessa t\u00E4ytyy olla v\u00E4hint\u00E4\u00E4n yksi vastaanottaja!";
    } else if(!AjanvarausForm.getCache().getDocument("slots-nomap").getFirstChild()) {
        return "Lomakkeessa t\u00E4ytyy olla v\u00E4hint\u00E4\u00E4n yksi tapaaminen!";
    }

    return null;
}

function isValidHour(node) {
    var hours, minutes
    hours = parseInt(node.getValue().substr(0, 2), 10);
    minutes = parseInt(node.getValue().substr(3, 2), 10);

    if(node.getValue().length != 5 || node.getValue().substr(2, 1) != ":") {
        alert("Ajan t\u00E4ytyy olla muotoa hh:mm");
        return false;
    } else if(hours < 0 || hours > 23) {
        alert("Tuntien t\u00E4ytyy olla v\u00E4lilt\u00E4 00 - 23");
        return false;
    } else if(minutes < 0 || minutes > 59) {
        alert("Minuuttien t\u00E4ytyy olla v\u00E4lilt\u00E4 00 - 59");
    } else {
        return true;
    }
}

/* single appointment should be able to be delivered
 function checkAppointment() {
 var nullError, error, numOfRecipients, numOfSlots;

 error = "Lomakkeessa t\u00E4ytyy olla v\u00E4hint\u00E4\u00E4n yksi ajankohta jokaista vastaanottajaa kohden!";
 if (AjanvarausForm.getCache().getDocument("Recipients-nomap").getFirstChild().getAttribute("Recipients_Recipient2")) {
 numOfRecipients = 2;
 }
 else {
 numOfRecipients = 1;
 }

 numOfSlots = AjanvarausForm.getJSXByName("calendarEntryBlock").getChildren().length;
 if (numOfSlots < numOfRecipients) {
 return error;
 }

 return "";
 }
 */

function confirmation(question) {
    if(confirm(question)) {
        return true;
    } else {
        return false;
    }
}

// General functions ----------------------------------------------------------------------------------------------------------------------------

function formatDataCache(cache, matrix) {
    if(AjanvarausForm.getCache().getDocument(cache).getFirstChild() == null) {
        AjanvarausForm.getJSXByName(matrix).commitAutoRowSession();
        return true;
    } else {
        return false;
    }
}

function clearDataCache(cacheName, matrixName) {
    while(AjanvarausForm.getCache().getDocument(cacheName).getFirstChild() != null) {
        AjanvarausForm.getCache().getDocument(cacheName).removeChild(AjanvarausForm.getCache().getDocument(cacheName).getFirstChild());
    }
    if(matrixName) {
        AjanvarausForm.getJSXByName(matrixName).repaintData();
    }
}

function isValidDate(node) {
    var checkDate1, checkDate2, checkDate3, checkDate, today;
    checkDate = newDate();
    checkDate1 = node.getValue().substr(0, 2);
    checkDate2 = node.getValue().substr(3, 2);
    checkDate3 = node.getValue().substr(6, 4);
    checkDate2 = parseInt(checkDate2 - 1, 10);
    if(checkDate2.length == 1) {
        checkDate2 = "0" + checkDate2;
    }
    checkDate.setFullYear(checkDate3, checkDate2, checkDate1);
    today = new Date();
    if(checkDate < today) {
        alert('Virheellinen p\u00E4iv\u00E4m\u00E4\u00E4r\u00E4. P\u00E4iv\u00E4m\u00E4\u00E4r\u00E4n t\u00E4ytyy olla t\u00E4t\u00E4 hetke\u00E4 my\u00F6hemm\u00E4lt\u00E4 ajanjaksolta!');
        node.setValue("").repaint();
    }
}

function getUserNameByUid(uid) {
    data = Arcusys.Internal.Communication.getUserInfo(uid);
    firstname = data.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    lastname = data.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    return firstname + " " + lastname;
}

function enableAll(pane, flag) {
    var descendants = [];
    descendants = AjanvarausForm.getJSXByName("week").getDescendantsOfType("jsx3.gui.CheckBox");

    for( i = 0; i < descendants.length; i++) {
        descendants[i].setEnabled(flag, true);
    }
}

function getFinDay(day) {
    var finDay;

    if(day != 0) {
        finDay = day - 1
    } else {
        finDay = 6;
    }

    return finDay;
}

/* takes two-dimensional array, fetches values of given index from the array and creates a string
 * of the values wrapped with tags.
 * param1: array containing fetched values
 * param2: index of the array (String)
 * param3: wrapper value (String)
 *
 */

function convertArrayToNodesString(array, index, wrapper) {
    var nodes = "";

    for( i = 0; i < array.length; i++) {
        nodes += "<" + wrapper + ">" + array[i][index] + "</" + wrapper + ">";
    }

    return nodes;
}

/* iterates through nodes and returns array in form array[i][name of the node]
 * param: node iterator of iterated nodes
 * result example array[0]['displayName'] = 'kalle.kuntalainen'
 */

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

// Slot modifying --------------------------------------------------------------------------------------------------------------------------------

function checkIfModifyOpen() {
    if(AjanvarausForm.getJSXByName("mod")) {
        var id = AjanvarausForm.getJSXByName("mod").getParent().getParent().getParent().getName();
        removeModSection(id);
        setValuesForModify(id, -1);
    }
}

function modifyThisSection(id) {
    var slot, modPane, attributes;

    checkIfModifyOpen();
    slot = AjanvarausForm.getJSXByName(id);
    modPane = slot.getDescendantOfName("modPane");
    attributes = getSlotAttributes(id);
    setValuesForModify(id, 1);
    section = modPane.load("components/modifyEntry.xml", true);

    section.getDescendantOfName("modDate").setValue(attributes[0]);
    section.getDescendantOfName("modStartTime").setValue(attributes[1]).repaint();
    section.getDescendantOfName("modEndTime").setValue(attributes[2]).repaint();
    section.getDescendantOfName("modLocation").setValue(attributes[3]).repaint();
    section.getDescendantOfName("modInfotext").setValue(attributes[4]).repaint();
}

function saveValues(id) {
    var nodes, appDate, appDate1, appDate2, appDate3, appDateCache, appDateEntry, startTime, endTime, locat;
    nodes = AjanvarausForm.getCache().getDocument("slots-nomap").selectSingleNode("//record[@slotNumber='" + id + "']");
    appDate = AjanvarausForm.getJSXByName("modDate").getValue();
    appDate1 = appDate.substr(0, 2);
    appDate2 = appDate.substr(3, 2);
    appDate3 = appDate.substr(6, 4);
    appDateCache = appDate3 + "-" + appDate2 + "-" + appDate1;
    appDateEntry = appDate1 + "." + appDate2 + "." + appDate3;
    startTime = AjanvarausForm.getJSXByName("modStartTime").getValue();
    endTime = AjanvarausForm.getJSXByName("modEndTime").getValue();
    locat = AjanvarausForm.getJSXByName("modLocation").getValue();
    infotext = AjanvarausForm.getJSXByName("modInfotext").getValue();

    nodes.setAttribute("appointmentDate", appDateCache);
    nodes.setAttribute("startTime", startTime + ":00");
    nodes.setAttribute("endTime", endTime + ":00");
    nodes.setAttribute("location", locat);
    nodes.setAttribute("comment", infotext);

    if(infotext != "") {
        AjanvarausForm.getJSXByName(id).getDescendantOfName("infotext").setValue(infotext);
        AjanvarausForm.getJSXByName(id).getDescendantOfName("tooltipImg").setDisplay("block", true);
    } else {
        AjanvarausForm.getJSXByName(id).getDescendantOfName("tooltipImg").setDisplay("none", true);
    }

    AjanvarausForm.getJSXByName(id).getDescendantOfName("entry").setText(appDateEntry + ", klo: " + startTime + " - " + endTime + ", " + locat, true);
}

function removeModSection(id) {
    AjanvarausForm.getJSXByName(id).getDescendantOfName("modPane").removeChild(AjanvarausForm.getJSXByName(id).getDescendantOfName("modPane").getFirstChild());
}

function setValuesForModify(id, multiplier) {
    if(multiplier > 0) {
        AjanvarausForm.getJSXByName(id).getDescendantOfName("layout (--)").setRows("10%,*").repaint();
    } else if(multiplier < 0) {
        AjanvarausForm.getJSXByName(id).getDescendantOfName("layout (--)").setRows("*").repaint();
    }
    AjanvarausForm.getJSXByName("calendarEntryBlock").setHeight(AjanvarausForm.getJSXByName("calendarEntryBlock").getHeight() + (280 * multiplier), true);
    AjanvarausForm.getJSXByName(id).setHeight(AjanvarausForm.getJSXByName(id).getHeight() + (280 * multiplier), true);
}

function getSlotAttributes(id) {
    var nodes, attributes, time, appDate, appDate1, appDate2, appDate2;
    nodes = AjanvarausForm.getCache().getDocument("slots-nomap").selectSingleNode("//record[@slotNumber='" + id + "']");
    attributes = [];
    appDate = nodes.getAttribute("appointmentDate");
    appDate1 = appDate.substr(0, 4);
    appDate2 = appDate.substr(5, 2);
    appDate3 = appDate.substr(8, 2);
    appDate = appDate3 + "-" + appDate2 + "-" + appDate1;

    attributes[0] = appDate;
    time = nodes.getAttribute("startTime");
    time = time.substr(0, 5);
    attributes[1] = time;
    time = nodes.getAttribute("endTime");
    time = time.substr(0, 5);
    attributes[2] = time;
    attributes[3] = nodes.getAttribute("location");
    attributes[4] = nodes.getAttribute("comment");

    return attributes;
}

function getSectionID() {
    var Id = AjanvarausForm.getJSXByName("calendarEntryId").getValue();
    AjanvarausForm.getJSXByName("calendarEntryId").setValue(parseInt(AjanvarausForm.getJSXByName("calendarEntryId").getValue(), 10) + 1);
    return Id;
}

// Adding appointment slot(s) --------------------------------------------------------------------------------------------------------------------

function getDaySelections() {
    var descendants, selections = [], i;
    descendants = AjanvarausForm.getJSXByName("week").getDescendantsOfType("jsx3.gui.CheckBox");

    for( i = 0; i < descendants.length; i++) {
        if(descendants[i].getChecked()) {
            selections[i] = true;
        } else {
            selections[i] = false;
        }
    }

    return selections;
}

function validateSingleSection() {
    if(!AjanvarausForm.getJSXByName("aloitusPvm").getDate()) {
        alert("Aloitusp\u00E4iv\u00E4m\u00E4\u00E4r\u00E4-kentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("aloitusAika").getValue()) {
        alert("Aloitusaikakentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("kesto").getValue()) {
        alert("Kestokentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("paikka").getValue()) {
        alert("Paikkakentt\u00E4 on tyhj\u00E4!");
        return false;
    } else {
        return true;
    }
}

function validateMultipleSection() {
    if(!AjanvarausForm.getJSXByName("aloitusPvm").getDate()) {
        alert("Aloitusp\u00E4iv\u00E4m\u00E4\u00E4r\u00E4-kentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("lopetusPvm").getDate()) {
        alert("Lopetusp\u00E4iv\u00E4m\u00E4\u00E4r\u00E4-kentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("aloitusAika").getValue()) {
        alert("Aloitusaikakentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("kesto").getValue()) {
        alert("Kestokentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("lopetusAika").getValue()) {
        alert("Lopetusaikakentt\u00E4 on tyhj\u00E4!");
        return false;
    } else if(!AjanvarausForm.getJSXByName("paikka").getValue()) {
        alert("Paikkakentt\u00E4 on tyhj\u00E4!");
        return false;
    } else {
        return true;
    }
}

function parseTimes(str) {
    if(str.length == 1) {
        str = "0" + str;
    }
    return str;
}

/*
 *  Adds an appointment slot or multiple slots
 */
function addAppointment() {
    if(isValidHour(AjanvarausForm.getJSXByName("aloitusAika"))) {
        if(AjanvarausForm.getJSXByName("singleSlot").getChecked()) {
            inputSingleSection();
        } else if(AjanvarausForm.getJSXByName("multiSlots").getChecked()) {
            if(isValidHour(AjanvarausForm.getJSXByName("lopetusAika"))) {
                inputMultiSections();
            }
        }
    }
}

/*
 * removes an appointment slot according  to id
 * param: id - the id of the slot to be removed
 */
function removeThisSection(id) {
    AjanvarausForm.getJSXByName("calendarEntryBlock").setHeight(parseInt(AjanvarausForm.getJSXByName("calendarEntryBlock").getHeight(), 10) - 25).repaint();
    AjanvarausForm.getJSXByName("calendarEntryBlock").removeChild(AjanvarausForm.getJSXByName(id));
    AjanvarausForm.getCache().getDocument("slots-nomap").removeChild(AjanvarausForm.getCache().getDocument("slots-nomap").selectSingleNode("//record[@slotNumber='" + id + "']"));
}

/**
 * remove all the appointment slots
 */
function clearAppointments() {
    while(AjanvarausForm.getJSXByName("calendarEntryBlock").getFirstChild() != null) {
        var id = AjanvarausForm.getJSXByName("calendarEntryBlock").getFirstChild().getName();
        removeThisSection(id);
    }
}

function singleSlotFunc() {
    AjanvarausForm.getJSXByName("lopetusPvm").getAncestorOfName("pane").setDisplay("none", true);
    AjanvarausForm.getJSXByName("lopetusAika").getAncestorOfName("pane").setDisplay("none", true);
    AjanvarausForm.getJSXByName("multiSlots").setChecked(0, true);
    AjanvarausForm.getJSXByName("lopetusPvm").setDate(null);
    AjanvarausForm.getJSXByName("lopetusAika").setValue("").repaint();
    enableAll("week", 0);

    if(!AjanvarausForm.getJSXByName("singleSlot").getChecked()) {
        AjanvarausForm.getJSXByName("singleSlot").setChecked(1, true);
    }
}

function multiSlotsFunc() {
    AjanvarausForm.getJSXByName("lopetusPvm").getAncestorOfName("pane").setDisplay("block", true);
    AjanvarausForm.getJSXByName("lopetusAika").getAncestorOfName("pane").setDisplay("block", true);
    AjanvarausForm.getJSXByName("singleSlot").setChecked(0, true);
    enableAll("week", 1);

    if(!AjanvarausForm.getJSXByName("multiSlots").getChecked()) {
        AjanvarausForm.getJSXByName("multiSlots").setChecked(1, true);
    }
}

function inputSection(entryDate, entryTime, entryDuration, entryLocation, entryInfotext) {
    var id, section, helperDate, endTimeHours, endTimeMinutes, entryYear, entryDay, entryMonth, entryHours, entryMinutes;
    id = getSectionID();
    section = AjanvarausForm.getJSXByName("calendarEntryBlock").load("components/calendarEntry.xml", true);

    AjanvarausForm.getJSXByName("calendarEntryBlock").setHeight(AjanvarausForm.getJSXByName("calendarEntryBlock").getHeight() + 25).repaint();
    section.setName(id);
    helperDate = new Date();
    helperDate.setHours(entryTime.getHours());
    helperDate.setMinutes(entryTime.getMinutes() + parseInt(entryDuration, 10));
    endTimeHours = helperDate.getHours().toString();
    endTimeMinutes = helperDate.getMinutes().toString();
    entryYear = entryDate.getFullYear();
    entryDay = entryDate.getDate().toString();
    entryMonth = (entryDate.getMonth() + 1).toString();
    entryHours = entryTime.getHours().toString();
    entryMinutes = entryTime.getMinutes().toString();
    entryDay = parseTimes(entryDay);
    entryMonth = parseTimes(entryMonth);
    entryHours = parseTimes(entryHours);
    entryMinutes = parseTimes(entryMinutes);
    endTimeHours = parseTimes(endTimeHours);
    endTimeMinutes = parseTimes(endTimeMinutes);

    AjanvarausForm.getJSXByName(id).getDescendantOfName("entry").setText(entryDay + "." + entryMonth + "." + entryYear + ", klo: " + entryHours + ":" + entryMinutes + " - " + endTimeHours + ":" + endTimeMinutes + ", " + entryLocation).repaint();
    if(entryInfotext) {
        AjanvarausForm.getJSXByName(id).getDescendantOfName("infotext").setValue(entryInfotext);
    } else {
        AjanvarausForm.getJSXByName(id).getDescendantOfName("tooltipImg").setDisplay("none", true);
    }
    mapFieldsToMatrix(id, entryDate, entryHours + ":" + entryMinutes, endTimeHours + ":" + endTimeMinutes, entryLocation, entryInfotext);
}

/*
 *  Adds a single appointment slot
 */
function inputSingleSection() {
    if(!validateSingleSection()) {
        return;
    }

    var startDate, helperStartTime, startTimeStr, startTimeHours, startTimeMinutes, duration, locat, infotext;
    startDate = AjanvarausForm.getJSXByName("aloitusPvm").getDate();
    helperStartTime = new Date();
    startTimeStr = AjanvarausForm.getJSXByName("aloitusAika").getValue();
    startTimeHours = startTimeStr.substr(0, 2);
    startTimeMinutes = startTimeStr.substr(3, 2);
    helperStartTime.setHours(startTimeHours);
    helperStartTime.setMinutes(startTimeMinutes);
    duration = AjanvarausForm.getJSXByName("kesto").getValue();
    locat = AjanvarausForm.getJSXByName("paikka").getValue();
    infotext = AjanvarausForm.getJSXByName("SlotsInfotext").getValue();
    inputSection(startDate, helperStartTime, duration, locat, infotext);
}

/*
 *  Adds multiple appointment slots
 */
function inputMultiSections() {
    var day, hour, startDate, endDate, helperStartTime, helperEndTime, startTimeStr, startTimeHours, startTimeMinutes, endTimeStr, endTimeHours, endTimeMinutes, locat, duration
    var counter, escapeGenerate;

    if(!validateMultipleSection()) {
        return;
    }
    counter = 0;
    escapeGenerate = false;
    startDate = AjanvarausForm.getJSXByName("aloitusPvm").getDate();
    endDate = AjanvarausForm.getJSXByName("lopetusPvm").getDate();
    selectedDays = getDaySelections();
    startTimeStr = AjanvarausForm.getJSXByName("aloitusAika").getValue();
    endTimeStr = AjanvarausForm.getJSXByName("lopetusAika").getValue();
    helperStartTime = new Date(1970, 1, 1, startTimeStr.substr(0, 2), startTimeStr.substr(3, 2), 0);
    helperEndTime = new Date(1970, 1, 1, endTimeStr.substr(0, 2), endTimeStr.substr(3, 2), 0);
    locat = AjanvarausForm.getJSXByName("paikka").getValue();
    infotext = AjanvarausForm.getJSXByName("SlotsInfotext").getValue();
    duration = parseInt(AjanvarausForm.getJSXByName("kesto").getValue(), 10);
    helperEndTime.setTime(helperEndTime.getTime() - fixEndTime(helperStartTime, helperEndTime, duration));

    for( day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
        if(escapeGenerate) {
            alert("Vain kolmekymment\u00E4 tapaamisaikaa voidaan laatia kerrallaan. Kaikkia tapaamisaikoja ei generoitu.");
            break;
        }
        for( hour = new Date(helperStartTime.getTime()); hour < helperEndTime; hour.setMinutes(hour.getMinutes() + duration)) {
            if(selectedDays[getFinDay(day.getDay())]) {
                inputSection(day, hour, duration, locat, infotext);
                counter++;
                if(counter >= 30) {
                    escapeGenerate = true;
                }
            }
        }
    }
}

function fixEndTime(start, end, duration) {
    var x, tempEnd;
    tempEnd = new Date(end.getTime() - start.getTime());
    x = parseInt(tempEnd.getTime()) / (1000 * 60) % duration;

    return x * 60 * 1000;
}

function mapFieldsToMatrix(id, entryDate, entryStartTime, entryEndTime, entryLocation, entryInfoText, prefill) {
    var node, hasEmptyChild, paiva, kuukausi, vuosi, pvm;
    hasEmptyChild = formatDataCache("slots-nomap", "slots");

    if(!prefill) {
        paiva = entryDate.getDate().toString();
        kuukausi = (entryDate.getMonth() + 1).toString();
        vuosi = entryDate.getFullYear().toString();
        if(paiva.length == 1) {
            paiva = "0" + paiva;
        }
        if(kuukausi.length == 1) {
            kuukausi = "0" + kuukausi;
        }
        pvm = vuosi + "-" + kuukausi + "-" + paiva;
    } else {
        pvm = entryDate;
    }
    node = AjanvarausForm.getCache().getDocument("slots-nomap").getFirstChild().cloneNode();

    node.setAttribute("jsxid", id);
    node.setAttribute("appointmentDate", pvm);
    node.setAttribute("startTime", entryStartTime + ":00");
    node.setAttribute("endTime", entryEndTime + ":00");
    node.setAttribute("location", entryLocation);
    node.setAttribute("comment", entryInfoText);
    node.setAttribute("slotNumber", id);
    AjanvarausForm.getCache().getDocument("slots-nomap").insertBefore(node);

    if(hasEmptyChild == true) {
        AjanvarausForm.getCache().getDocument("slots-nomap").removeChild(AjanvarausForm.getCache().getDocument("slots-nomap").getFirstChild());
    }
}

// Preload ---------------------------------------------------------------------------------------------------------------------------------------

/**
 * Maps form data (from db through webservice call) to form fields
 * param: objXML - form data in XML document
 */
/* parses recipients from xml and returns a list of recipients */
function getRecipients(formData, list) {
    var i = 0, j = 0, node, childNode, recipients = [], recipNodes, firstRow = true;
    recipNodes = formData.selectNodeIterator("//receipients");

    while(recipNodes.hasNext()) {
        node = recipNodes.next();
        if(node.getFirstChild()) {
            recipients[i] = [];
            recipients[i][j] = "";
            childNode = node.getFirstChild();
            while(childNode) {
                if(childNode.getNodeName() == list[0]) {
                    if(!firstRow) {
                        recipients[i][0] += ",";
                    }
                    recipients[i][0] += childNode.getValue();
                    firstRow = false;
                } else if(childNode.getNodeName() == list[1]) {
                    recipients[i][1] = childNode.getValue();
                }
                childNode = childNode.getNextSibling();
                j++;
            }
            firstRow = true;
            j = 0;
            i++;
        }
    }

    return recipients;
}

/* parses appointment slot attributes from xml and returns a list of attributes */
function getAttributes(formData) {
    var i = 0, j = 0, attributes = [], slots, node, childNode;
    slots = formData.selectNodeIterator("//slots");

    while(slots.hasNext()) {
        node = slots.next();
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

/* maps recipients to Recipients-matrix */
function mapRecipients(objXML) {
    var recipients, recipientsArray, hasEmptyChild, i, node, list;
    list = ["receipients", "targetPerson"];
    recipients = getRecipients(objXML, list);
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");
    recipientsNames = "";
    recipientsUid = "";

    for( i = 0; i < recipients.length; i++) {
        recipientsArray = recipients[i][0].split(",");
        for( j = 0; j < recipientsArray.length; j++) {
            if(j != 0) {
                recipientsNames += ", ";
            }
            recipientsNames += getUserNameByUid(recipientsArray[j]);
        }
        node = AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();
        node.setAttribute("recipients", recipientsNames);
        node.setAttribute("recipientsUid", recipients[i][0]);
        node.setAttribute("uid", recipients[i][1]);
        node.setAttribute("group", 0);
        AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
        recipientsNames = "";
    }
    if(hasEmptyChild) {
        AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").removeChild(AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    AjanvarausForm.getJSXByName("dummyMatrix").repaintData();
}

/* prefills appointment slots to the form */
function mapAttributes(objXML) {
    var i, section, attributes, pvm, pvm1, pvm2, pvm3;
    attributes = getAttributes(objXML);
    for( i = 0; i < attributes.length; i++) {
        AjanvarausForm.getJSXByName("calendarEntryBlock").setHeight(AjanvarausForm.getJSXByName("calendarEntryBlock").getHeight() + 25).repaint();
        section = AjanvarausForm.getJSXByName("calendarEntryBlock").load("components/calendarEntry.xml", true);
        section.setName(attributes[i][0]).repaint();
        AjanvarausForm.getJSXByName("calendarEntryId").setValue(attributes[i][0]);
        pvm = attributes[i][1];
        pvm = pvm.replace("Z", "");
        pvm1 = pvm.substr(8, 2);
        pvm2 = pvm.substr(5, 2);
        pvm3 = pvm.substr(0, 4);
        pvm = pvm1 + "." + pvm2 + "." + pvm3;

        if(attributes[i][0] >= AjanvarausForm.getJSXByName("calendarEntryId").getValue()) {
            AjanvarausForm.getJSXByName("calendarEntryId").setValue(parseInt(attributes[i][0], 10) + 1);
        }

        section.getDescendantOfName("entry").setText(pvm + ", klo: " + attributes[i][2].substr(0, 5) + " - " + attributes[i][3].substr(0, 5) + ", " + attributes[i][4]).repaint();
        if(attributes[i][5] != "") {
            section.getDescendantOfName("infotext").setValue(attributes[i][5]);
        } else {
            section.getDescendantOfName("tooltipImg").setDisplay("none", true);
        }
        mapFieldsToMatrix(attributes[i][0], attributes[i][1], attributes[i][2].substr(0, 5), attributes[i][3].substr(0, 5), attributes[i][4], attributes[i][5], true);

    }
}

function mapFormDataToFields(objXML) {
    var sender, subject, description, targetPerson;

    // Get basic information from xml document
    subject = objXML.selectSingleNode("//subject", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    description = objXML.selectSingleNode("//description", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    targetPerson = objXML.selectSingleNode("//targetPerson", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();

    mapAttributes(objXML);

    mapRecipients(objXML);

    // Map values to the form fields
    AjanvarausForm.getJSXByName("Header_Text").setValue(subject).repaint();
    AjanvarausForm.getJSXByName("Header_Description").setValue(description).repaint();
    AjanvarausForm.getJSXByName("Lomake_Status").setValue("Created");
}

/**
 * Functions that has to run before form starts.
 */
function Preload() {
    var username, formData, id;
    username = Intalio.Internal.Utilities.getUser();
    username = username.substring(username.indexOf("/") + 1);
    AjanvarausForm.getJSXByName("User_Sender").setValue(username).repaint();
    AjanvarausForm.getJSXByName("block").setHeight(0, true);
    if(gup("FormID")) {
        id = gup("FormID");
        AjanvarausForm.getJSXByName("Lomake_ID").setValue(id);
        setModeModify();

        try {

            // Add form preload functions here.
            formData = Arcusys.Internal.Communication.GetFormData(id);

            if(formData != null) {
                mapFormDataToFields(formData);
            }
        } catch (e) {
            alert(e);
        }
    }
}

/*
 *  Sets the form in modify mode. Hiding fields that should not be used
 */
function setModeModify() {
    AjanvarausForm.getJSXByName("Haku_Lapset").setDisplay("none", true);
    AjanvarausForm.getJSXByName("dummyMatrix").getChild("deleteButtonColumn").setDisplay("none", true);
    AjanvarausForm.getJSXByName("showOrHideSearch").setDisplay("none", true);
}

// Functions related to recipients mapping -------------------------------------------------------------------------------------------------------

function switchSearchMode(mode) {

    if(mode == "groups") {
        AjanvarausForm.getJSXByName("Haku_Lapset").setDisplay("none", true);
        AjanvarausForm.getJSXByName("Haku_Ryhmat").setDisplay("block", true);

        AjanvarausForm.getJSXByName("HaeKayttajia_Checkbox1").setChecked(0, true);
        AjanvarausForm.getJSXByName("HaeRyhmia_Checkbox1").setChecked(1, true);
        AjanvarausForm.getJSXByName("HaeKayttajia_Checkbox2").setChecked(0, true);
        AjanvarausForm.getJSXByName("HaeRyhmia_Checkbox2").setChecked(1, true);

    }

    if(mode == "users") {
        AjanvarausForm.getJSXByName("Haku_Lapset").setDisplay("block", true);
        AjanvarausForm.getJSXByName("Haku_Ryhmat").setDisplay("none", true);

        AjanvarausForm.getJSXByName("HaeKayttajia_Checkbox1").setChecked(1, true);
        AjanvarausForm.getJSXByName("HaeRyhmia_Checkbox1").setChecked(0, true);
        AjanvarausForm.getJSXByName("HaeKayttajia_Checkbox2").setChecked(1, true);
        AjanvarausForm.getJSXByName("HaeRyhmia_Checkbox2").setChecked(0, true);
    }

}

/**
 * inserts selected users to real matrix that values can be later used in Intalio process.
 *
 */
function mapSelectedRecipientsToMatrix() {
    var nodes, node, childNode, hasEmptyChild, recipients, targetPerson, childIterator, nodeIterator, i;
    var group, groupUid, groupData, userData, childData, childArray;

    clearDataCache("Recipients-nomap");
    childIterator = AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("Recipients-nomap", "Recipients");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        group = childNode.getAttribute("group");

        if(group != 0) {
            groupUid = childNode.getAttribute("recipientsUid");

            try {
                groupData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);
                userData = getData(groupData.selectNodeIterator("//user", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'"));
                nodes = convertArrayToNodesString(userData, "uid", "childUid");
                childData = Arcusys.Internal.Communication.getChildInfo(nodes);
                nodeIterator = childData.selectNodes("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
                childArray = getDataString(nodeIterator);

                for( i = 0; i < childArray.length; i++) {
                    if(childArray[i]["parents_uid"]) {
                        node = AjanvarausForm.getCache().getDocument("Recipients-nomap").getFirstChild().cloneNode();
                        node.setAttribute("Recipients_TargetPerson", childArray[i]["uid"]);
                        node.setAttribute("Recipients_Recipient", childArray[i]["parents_uid"]);
                        AjanvarausForm.getCache().getDocument("Recipients-nomap").insertBefore(node);
                    }
                }
            } catch(e) {
                alert(e);
            }
        } else {
            recipients = childNode.getAttribute("recipientsUid");
            targetPerson = childNode.getAttribute("uid");
            node = AjanvarausForm.getCache().getDocument("Recipients-nomap").getFirstChild().cloneNode();
            node.setAttribute("Recipients_Recipient", recipients);
            node.setAttribute("Recipients_TargetPerson", targetPerson);
            AjanvarausForm.getCache().getDocument("Recipients-nomap").insertBefore(node);

        }
    }

    if(hasEmptyChild) {
        AjanvarausForm.getCache().getDocument("Recipients-nomap").removeChild(AjanvarausForm.getCache().getDocument("Recipients-nomap").getFirstChild());
    }

    deleteDupes();
}

function deleteDupes() {
    var childIterator, childNode, sibling, temp, targetUid, currentUid;
    childIterator = AjanvarausForm.getCache().getDocument("Recipients-nomap").getChildIterator();

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        targetUid = childNode.getAttribute("Recipients_TargetPerson");

        if(childNode.getNextSibling() != null) {
            sibling = childNode.getNextSibling();
        }

        while(sibling != null) {
            currentUid = sibling.getAttribute("Recipients_TargetPerson");

            if(currentUid == targetUid) {
                temp = sibling;
                sibling = sibling.getNextSibling();
                AjanvarausForm.getCache().getDocument("Recipients-nomap").removeChild(temp);

            } else {
                sibling = sibling.getNextSibling();
            }

        }
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
    status = childData.selectSingleNode("//status", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    if(status == "error") {
        error = childData.selectSingleNode("//message", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        if(error.search("Creation of the user by UID '' - should be used for test purposes only") != -1) {
            alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
        } else {
            alert("Vastaanottajan hakemisessa tapahtui virhe! Virheviesti: " + error);
        }
    } else {

        if(childData.selectSingleNode("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'") && childData.selectSingleNode("//parents", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
            entryFound = true;
        }

        if(entryFound) {

            clearDataCache("HaetutLapset-nomap", "searchChildMatrix");
            hasEmptyChild = formatDataCache("HaetutLapset-nomap", "searchChildMatrix");
            nodeIterator = childData.selectNodes("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
            childArray = getDataString(nodeIterator);

            for( i = 0; i < childArray.length; i++) {
                if(childArray[i]["parents_uid"]) {
                    node = AjanvarausForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild().cloneNode();
                    node.setAttribute("jsxid", 0);
                    node.setAttribute("etunimi", childArray[i]["firstname"]);
                    node.setAttribute("sukunimi", childArray[i]["lastname"]);
                    node.setAttribute("uid", childArray[i]["uid"]);
                    node.setAttribute("vanhempi", childArray[i]["parents_displayName"]);
                    node.setAttribute("vanhempiUid", childArray[i]["parents_uid"]);
                    AjanvarausForm.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);
                }
            }

            AjanvarausForm.getCache().getDocument("HaetutLapset-nomap").insertBefore(node);

            if(hasEmptyChild == true) {
                AjanvarausForm.getCache().getDocument("HaetutLapset-nomap").removeChild(AjanvarausForm.getCache().getDocument("HaetutLapset-nomap").getFirstChild());
            }
        } else {
            alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
        }

        AjanvarausForm.getJSXByName("searchChildMatrix").repaintData();

    }
}

function searchGroup(searchString) {

    var entryFound, node, i, hasEmptyChild, splits, list, xmlData, groupData;

    if(searchString == "") {
        alert("Syota hakusana");
        return;
    }
    searchString = searchString.toLowerCase();
    entryFound = false;

    if(AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild() != null) {
        AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").removeChildren();
        AjanvarausForm.getJSXByName("searchGroupMatrix").repaintData();

    }
    hasEmptyChild = false;
    xmlData = Arcusys.Internal.Communication.GetGroups(searchString);
    groupData = getData(xmlData.selectNodeIterator("//group", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'"));
    status = xmlData.selectSingleNode("//status", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();

    if(status == "error") {
        error = xmlData.selectSingleNode("//message", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
        alert("Ryhm\u00E4n hakemisessa tapahtui virhe! Virheviesti: " + error);
    } else {

        if(AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild() == null) {
            AjanvarausForm.getJSXByName("searchGroupMatrix").commitAutoRowSession();
            hasEmptyChild = true;
        }

        for( i = 0; i < groupData.length; i++) {
            entryFound = true;
            node = AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild().cloneNode();

            node.setAttribute("jsxid", i);
            node.setAttribute("nimi", groupData[i]["groupName"]);
            node.setAttribute("uid", groupData[i]["groupUid"]);

            AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").insertBefore(node);

        }

        if(hasEmptyChild == true) {
            AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").removeChild(AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild());
        }
        AjanvarausForm.getJSXByName("searchGroupMatrix").repaintData();

        if(entryFound == false) {
            alert("Valitettavasti antamallasi hakusanalla ei l\xF6ytynyt tuloksia");
        }
    }
}

function listGroupUsers() {

    var node, i, hasEmptyChild, childIterator, childNode, selected, groupUid, personInfo, xmlData, list, userData;

    if(AjanvarausForm.getCache().getDocument("GroupUserList-nomap").getFirstChild() != null) {
        AjanvarausForm.getCache().getDocument("GroupUserList-nomap").removeChildren();
        AjanvarausForm.getJSXByName("listGroupUsersMatrix").repaintData();
    }
    hasEmptyChild = false;

    if(AjanvarausForm.getCache().getDocument("GroupUserList-nomap").getFirstChild() == null) {
        AjanvarausForm.getJSXByName("listGroupUsersMatrix").commitAutoRowSession();
        hasEmptyChild = true;

    }
    childIterator = AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").getChildIterator();

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        selected = childNode.getAttribute("valittu");

        if((selected != 0) && (selected != null)) {
            groupUid = childNode.getAttribute("uid");
            xmlData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);
            userData = getData(xmlData.selectNodeIterator("//user", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'"));

            for( i = 0; i < userData.length; i++) {
                node = AjanvarausForm.getCache().getDocument("GroupUserList-nomap").getFirstChild().cloneNode();

                node.setAttribute("jsxid", i);
                node.setAttribute("etunimi", userData[i]["firstname"]);
                node.setAttribute("sukunimi", userData[i]["lastname"]);
                node.setAttribute("puhelin", userData[i]["phoneNumber"]);
                node.setAttribute("sahkoposti", userData[i]["email"]);
                node.setAttribute("valittu", 0);
                AjanvarausForm.getCache().getDocument("GroupUserList-nomap").insertBefore(node);

            }
        }

    }

    if(hasEmptyChild == true) {
        AjanvarausForm.getCache().getDocument("GroupUserList-nomap").removeChild(AjanvarausForm.getCache().getDocument("GroupUserList-nomap").getFirstChild());
    }
    AjanvarausForm.getJSXByName("listGroupUsersMatrix").repaintData();

}

function addToRecipients() {
    var counter, node, hasEmptyChild, chosen, childIterator, uid, targetPerson, firstname, lastname, vanhempi1, vanhempi2, vanhempi1Uid, vanhempi2Uid, childNode;
    counter = AjanvarausForm.getJSXByName("recipientCounter").getValue();
    childIterator = AjanvarausForm.getCache().getDocument("HaetutLapset-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        chosen = childNode.getAttribute("valittu");

        if((chosen != null) && (chosen != 0)) {
            node = AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();
            uid = childNode.getAttribute("uid");
            firstname = childNode.getAttribute("etunimi");
            lastname = childNode.getAttribute("sukunimi");
            vanhemmat = childNode.getAttribute("vanhempi");
            vanhemmatUid = childNode.getAttribute("vanhempiUid");
            targetPerson = firstname + " " + lastname;

            node.setAttribute("jsxid", counter);
            node.setAttribute("recipients", vanhemmat);
            node.setAttribute("recipientsUid", vanhemmatUid);

            node.setAttribute("targetPerson", targetPerson);
            node.setAttribute("uid", uid);
            node.setAttribute("group", 0);
            AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;
        }
    }
    if(hasEmptyChild == true) {
        AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").removeChild(AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    AjanvarausForm.getJSXByName("dummyMatrix").repaintData();
    AjanvarausForm.getJSXByName("recipientCounter").setValue(counter);
}

function addGroupsToRecipients() {
    var counter, node, hasEmptyChild, valittu, childIterator, groupUid, childNode, groupname;
    counter = AjanvarausForm.getJSXByName("recipientCounter").getValue();
    hasEmptyChild = false;
    childIterator = AjanvarausForm.getCache().getDocument("HaetutRyhmat-nomap").getChildIterator();
    if(AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild() == null) {
        AjanvarausForm.getJSXByName("dummyMatrix").commitAutoRowSession();
        hasEmptyChild = true;
    }

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        valittu = childNode.getAttribute("valittu");
        groupUid = childNode.getAttribute("uid");

        if((valittu != null) && (valittu != 0)) {
            node = AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();
            groupname = childNode.getAttribute("nimi");
            node.setAttribute("jsxid", counter);
            node.setAttribute("recipients", groupname);
            node.setAttribute("recipientsUid", groupUid);
            node.setAttribute("group", 1);
            AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;

        }

    }
    if(hasEmptyChild == true) {
        AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").removeChild(AjanvarausForm.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }

    AjanvarausForm.getJSXByName("dummyMatrix").repaintData();
    AjanvarausForm.getJSXByName("recipientCounter").setValue(counter);

}

// Web Service calls -----------------------------------------------------------------------------------------------------------------------------

// Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetFormData = function(id) {
        var tout, appointmentId, msg, endpoint, url, req, objXML;
        tout = 1000;
        appointmentId = id;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.av.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getAppointment><appointmentId>" + appointmentId + "</appointmentId></soa:getAppointment></soapenv:Body></soapenv:Envelope>";
        endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-av-model-0.1-SNAPSHOT/KokuAppointmentProcessingServiceImpl";
        url = getUrl();
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
    arc.GetChildren = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchChildren><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchChildren></soapenv:Body></soapenv:Envelope>";
        url = getUrl();
        endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
    arc.getUserInfo = function(id) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + id + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";
        url = getUrl();
        endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
    arc.getChildInfo = function(nodes) {
        var tout, msg, endpoint, url, req, objXML;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getChildInfo>" + nodes + "</soa:getChildInfo></soapenv:Body></soapenv:Envelope>";
        url = getUrl();
        endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
    arc.GetGroups = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchGroups><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchGroups></soapenv:Body></soapenv:Envelope>";
        url = getUrl()
        endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess\xE4");
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
        endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(msg, tout);
        objXML = req.getResponseXML();

        if(objXML == null) {
            alert("Virhe palvelinyhteydess\xE4");
        } else {
            return objXML;

        }

    };
});
// Extra Functions -------------------------------------------------------------------------------------------------------------------------------

//Getting the domain name and port if available
function getUrl() {
    var domain = getDomainName();
    if(domain.search("file") != -1) {
        domain = "http://62.61.65.15:8380"
    }
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

function getDomainName() {
    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];
    return domain_name;
}

function getEndpoint() {
    var endpoint;

    endpoint = "http://trelx51lb:8080";
    //endpoint = "http://localhost:8180";

    return endpoint;
}

function showDialog(dialogId, text, textTitle, title) {
    var dialog, cssDisplay;
    dialog = $("#" + dialogId);
    cssDisplay = dialog.css('display');
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

function gup(name) {
    var regexS, regex, results;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regexS = "[\\?&]" + name + "=([^&#]*)";
    regex = new RegExp(regexS);
    results = regex.exec(window.location.href);
    if(results == null) {
        return false;
    } else {
        return results[1];

    }
}

jsx3.lang.Package.definePackage("Intalio.Internal.CustomErrors", function(error) {
    error.getError = function(name) {
        var errortext = AjanvarausForm.getJSXByName(name).getTip();
        errortext = "Puuttuvat tiedot: " + errortext;
        return errortext;
    };
});
