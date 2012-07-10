/* place JavaScript code here */
function isNumeric(targetField) {
    var validChars = "0123456789";
    var isNumber = true;
    var char;
    var text2 = targetField.getValue();

    for( i = 0; i < text2.length && isNumber == true; i++) {
        char = text2.charAt(i);
        if(validChars.indexOf(char) == -1) {
            isNumber = false;
            alert("Syot\xE4 vain positiivisia kokonaislukuja!");
            targetField.setValue("").repaint();
        }
    }

}

function setEndDate(endDate, dateField) {
    form1.getJSXByName(dateField).setDate(endDate).repaint();
}

jsx3.lang.Package.definePackage("Intalio.Internal.CustomErrors", function(error) {

    error.getError = function(name) {
        var errortext = Valtakirja_Form.getJSXByName(name).getTip();
        errortext = "Virheelliset tiedot: " + errortext;
        return errortext;
    };
});
function bringButtonsBack() {
    var descendants, blocks, i;
    blocks = form1.getJSXByName("block").getChildren();
    //descendants = form1.getJSXByName("block").getDescendantsOfType("jsx3.gui.Button");

    for( i = 0; i < blocks.length; i++) {
        blocks[i].setHeight(blocks[i].getHeight() + 23, true);
        blocks[i].getDescendantOfName("deleteButton").getParent().setDisplay("block", true);
    }

}

function commitCustomAutoRowSession(matrix, cache) {
    var nodes, xmlStr;
    nodes = form1.getJSXByName(matrix).getChildren();
    xmlStr = "<data jsxid=\"jsxroot\"><record jsxid=\"\"";

    for(var i = 0; i < nodes.length; i++) {
        if(nodes[i] && nodes[i].getPath() != "jsxid") {
            xmlStr += " " + nodes[i].getPath() + "=\"\"";
        }
    }
    xmlStr += "/></data>";
    form1.getCache().getDocument(cache).loadXML(xmlStr);
}

function formatDataCache(cache, matrix) {
    if(form1.getCache().getDocument(cache).getFirstChild() == null) {
        commitCustomAutoRowSession(matrix, cache);
        return true;
    } else {
        return false;
    }
}

function clearDataCache(cacheName, matrixName) {
    while(form1.getCache().getDocument(cacheName).getFirstChild() != null) {
        form1.getCache().getDocument(cacheName).removeChild(form1.getCache().getDocument(cacheName).getFirstChild());
    }
    if(matrixName) {
        form1.getJSXByName(matrixName).repaintData();
    }
}

function setRoles() {

    var roleUsers;
    var roleUid;
    var temp;
    temp = form1.getJSXByName("Perustiedot_Extend02").getValue();

    if(temp != null) {
        form1.getJSXByName("User_Realm").setValue("Loora");
        roleUid = form1.getJSXByName("Perustiedot_Vastaanottaja_UID").getValue();
        roleUsers = getRoleUsers(roleUid);
        form1.getJSXByName("Perustiedot_Extend01").setValue(roleUsers);
    } else {
        form1.getJSXByName("User_Realm").setValue("Kunpo");
    }

    form1.getJSXByName("Perustiedot_Vastaanottaja_UID").setValue("");

}

function getRoleUsers(groupUid) {
    var xmlData, list, userData, users = "";
    users = "";
    xmlData = Arcusys.Internal.Communication.GetRoleUsers(groupUid);
    userNames = xmlData.selectNodeIterator("//username", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");

    while(userNames.hasNext()) {
        node = userNames.next();
        users += "koku\\" + node.getValue();

        if(userNames.hasNext())
            users += ",";

    }

    return users;

}

function makeSearch(searchString) {
    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = false;
    hasEmptyChild = false;

    if(searchString == "") {
        alert("Sy" + unescape("%F6") + "t" + unescape("%E4") + "hakusana");

    }
    searchString = searchString.toLowerCase();

    if(searchEmbloyeeNames(searchString) == false) {
        if(searchRoles(searchString) == false) {
            alert("Valitettavasti antamallasi hakusanalla ei l" + unescape("%F6") + "ytynyt tuloksia");
        }
    }
}

function searchRoles(searchString) {

    var node, hasEmptyChild, entryFound, rolesData, i, xmlData, roleInfo, list;
    entryFound = false;

    if(searchString == "") {
        return false;
    }

    if(form1.getCache().getDocument("HaetutRoolit-nomap").getFirstChild() != null) {
        form1.getCache().getDocument("HaetutRoolit-nomap").removeChildren();
        form1.getJSXByName("searchRoleMatrix").repaintData();

    }
    hasEmptyChild = formatDataCache("HaetutRoolit-nomap", "searchRoleMatrix");
    xmlData = Arcusys.Internal.Communication.GetRoles(searchString);
    list = ["roleName", "roleUid"];
    rolesData = parseXML(xmlData, "role", list);

    if(rolesData != null || rolesData != "") {

        if(rolesData.length > 1) {
            form1.getJSXByName("Roolihaku_Valittu-column").setDisplay("block").repaint();
            form1.getJSXByName("Roolihaku_Roolinimi-column").setDisplay("block").repaint();
            form1.getJSXByName("Roolihaku_Etunimi-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Sukunimi-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Puhelin-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Sahkoposti-column").setDisplay("none").repaint();

        } else {
            form1.getJSXByName("Roolihaku_Valittu-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Roolinimi-column").setDisplay("block").repaint();
            form1.getJSXByName("Roolihaku_Etunimi-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Sukunimi-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Puhelin-column").setDisplay("none").repaint();
            form1.getJSXByName("Roolihaku_Sahkoposti-column").setDisplay("none").repaint();
        }

        for( i = 0; i < rolesData.length; i++) {
            roleInfo = rolesData[i].split(',');
            entryFound = true;
            node = form1.getCache().getDocument("HaetutRoolit-nomap").getFirstChild().cloneNode();

            node.setAttribute("jsxid", i);

            if(rolesData.length == 1) {
                node.setAttribute("valittu", 1);
            }

            node.setAttribute("roolinimi", roleInfo[0]);
            node.setAttribute("uid", roleInfo[1]);
            node.setAttribute("rooli", 1);

            form1.getCache().getDocument("HaetutRoolit-nomap").insertBefore(node);

        }

        if(hasEmptyChild == true) {
            form1.getCache().getDocument("HaetutRoolit-nomap").removeChild(form1.getCache().getDocument("HaetutRoolit-nomap").getFirstChild());
        }

        form1.getJSXByName("searchMatrix").repaintData();

        if(entryFound == false) {

            return false;
        }
    }

}

function searchEmbloyeeNames(searchString) {

    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = true;

    if(searchString == "") {
        return false;
    }

    if(form1.getCache().getDocument("HaetutRoolit-nomap").getFirstChild() != null) {
        form1.getCache().getDocument("HaetutRoolit-nomap").removeChildren();
    }

    hasEmptyChild = formatDataCache("HaetutRoolit-nomap", "searchRoleMatrix");
    xmlData = Arcusys.Internal.Communication.GetEmbloyeeUsers(searchString);
    list = ["firstname", "lastname", "phoneNumber", "email", "uid"];
    userData = parseXML(xmlData, "user", list);

    if(userData[0] !== null && typeof userData[0] !== 'undefined') {

        form1.getJSXByName("Roolihaku_Roolinimi-column").setDisplay("none").repaint();
        form1.getJSXByName("Roolihaku_Valittu-column").setDisplay("none").repaint();

        form1.getJSXByName("Roolihaku_Etunimi-column").setDisplay("block").repaint();
        form1.getJSXByName("Roolihaku_Sukunimi-column").setDisplay("block").repaint();
        form1.getJSXByName("Roolihaku_Puhelin-column").setDisplay("block").repaint();
        form1.getJSXByName("Roolihaku_Sahkoposti-column").setDisplay("block").repaint();

        for( i = 0; i < userData.length; i++) {
            personInfo = userData[i].split(',');
            entryFound = true;
            node = form1.getCache().getDocument("HaetutRoolit-nomap").getFirstChild().cloneNode();

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
                alert("Kayttajahaussa tapahtui virhe. Lapsen id puuttuu");
                entryFound = false;
            }

            node.setAttribute("uid", personInfo[4]);

            form1.getCache().getDocument("HaetutRoolit-nomap").insertBefore(node);

        }

    } else {
        entryFound = false;
    }

    if(hasEmptyChild == true) {
        form1.getCache().getDocument("HaetutRoolit-nomap").removeChild(form1.getCache().getDocument("HaetutRoolit-nomap").getFirstChild());
    }

    form1.getJSXByName("searchRoleMatrix").repaintData();
    
    return entryFound;
}

kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
    if(kokuServiceEndpoints == null) {
        kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
    }

    return kokuServiceEndpoints.services[serviceName];
}

function modfiyForm() {
    var childNode, creator, subject;
    var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();

    form1.getJSXByName("Kentat").setDisplay("block", true);
    form1.getJSXByName("User_PaivitaOlemassaoleva").setChecked(1);
    subject = form1.getJSXByName("Header_Text").getValue();
    creator = form1.getJSXByName("User_Sender").getValue();

    var templateStatusData = Arcusys.Internal.Communication.DoesReuqestTemplateExist(creator, subject);
    var templateStatus = templateStatusData.selectSingleNode("//return", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();

    if(templateStatus == "ExistsActive") {
        form1.getJSXByName("User_PaivitaOlemassaoleva").setChecked(0).setEnabled(0, true);
    }

    form1.getJSXByName("Nakyvyys").setDisplay("block", true);

    bringButtonsBack();

}

function getRoles(uid) {
    var i = 0, j = 0, roleName, roleId;

    //var uid = "415ae6c9-406b-41df-b71e-887b5f0e4f3a";
    rolesData = Arcusys.Internal.Communication.GetUserRoles(uid);

    var roles = rolesData.selectNodeIterator("//role", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");
    var rolesArray = [];

    var checkRoles = rolesData.selectSingleNode("//role", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");

    if(checkRoles) {
        while(roles.hasNext()) {
            node = roles.next();
            if(node.getFirstChild()) {
                childNode = node.getFirstChild();
                rolesArray[i] = [];
                while(childNode) {
                    if(childNode.getValue()) {
                        rolesArray[i][j] = childNode.getValue();
                    }
                    childNode = childNode.getNextSibling();
                    j++;
                }
                i++;
                j = 0;
            }
        }

        var s = "<data>";

        for( i = 0; i < rolesArray.length; i++) {
            s += "<record jsxid=\"" + rolesArray[i][1] + "\" jsxtext=\"" + rolesArray[i][0] + "\"\/>";
        }
        s += "<record jsxid=\"\" jsxtext=\"Ei valintaa\"/>";
        s += "</data>";

        form1.getJSXByName("User_Roolit").setXMLString(s).resetCacheData();

        //form1.getJSXByName("Roolit").setDisplay("block", true);

    }

}

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
    arc.GetUserRoles = function(uid) {

        var tout, msg, endpoint, url, req, objXML;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserRoles><userUid>" + uid + "</userUid></soa:getUserRoles></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";

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
    arc.GetKunpoUsernameByUid = function(uid) {

        var tout = 1000;
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getKunpoNameByUserUid><userUid>" + uid + "</userUid></soa:getKunpoNameByUserUid></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        //  var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetLooraUsernameByUid = function(uid) {

        var tout = 1000;
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getLooraNameByUserUid><userUid>" + uid + "</userUid></soa:getLooraNameByUserUid></soapenv:Body></soapenv:Envelope>";

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
function checkTimeNotBefore(time, timeNot, errorMsg, type) {

    var timeValue = time.getValue();
    var timeNotBefore = timeNot.getValue();

    if(timeValue != "" && timeNotBefore != "") {

        var hourValue = timeValue.substring(0, 2);
        var hourNotBefore = timeNotBefore.substring(0, 2);

        if(hourValue > hourNotBefore) {
            alert(errorMsg);
            if(type == "aloitus") {
                time.setValue("");
            }
            if(type == "lopetus") {
                timeNot.setValue("");
            }
            return false;
        }
    }
    return true;
}

function checkDateNotBefore(dateValue, dateNotBefore, errorMsg) {

    if(dateValue != null && dateNotBefore != null) {
        var dayValue = dateValue.getDate();
        var monthValue = dateValue.getMonth() + 1;
        var yearValue = dateValue.getFullYear();

        var dayNotBefore = dateNotBefore.getDate();
        var monthNotBefore = dateNotBefore.getMonth() + 1;
        var yearNotBefore = dateNotBefore.getFullYear();
        dateObjectValue = new Date(yearValue, monthValue - 1, dayValue);
        dateObjectNotBefore = new Date(yearNotBefore, monthNotBefore - 1, dayNotBefore);

        if(dateObjectValue > dateObjectNotBefore) {
            alert(errorMsg);
            return false;
        }
    }
    return true;
}

function setChoicesForCalendar(timelevelComponent) {
    var parentPaneName = timelevelComponent.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getName();
    var value = timelevelComponent.getValue();
    if(value == "Tunti") {
        form1.getJSXByName(parentPaneName).getDescendantOfName("paneHours").setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
        form1.getJSXByName(parentPaneName).setHeight(form1.getJSXByName(parentPaneName).getHeight() + 50).repaint();
        //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 50).repaint();
    } else {
        if(form1.getJSXByName(parentPaneName).getDescendantOfName("paneHours").getDisplay() == jsx3.gui.Block.DISPLAYBLOCK) {
            form1.getJSXByName(parentPaneName).getDescendantOfName("paneHours").setDisplay(jsx3.gui.Block.DISPLAYNONE).repaint();
            form1.getJSXByName(parentPaneName).setHeight(form1.getJSXByName(parentPaneName).getHeight() - 50).repaint();
            //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 50).repaint();
        }
    }
}

function getNumberOfWeeksInYear(year) {
    var number = getWeek(year, 11, 31);
    if(number == 1) {
        number = 52;
    }
    return number;
}

function getWeeksBetween(startWeek, startYear, endWeek, endYear) {
    var weeksBetween = new Array();
    var weeksInCurrentYear = getNumberOfWeeksInYear(startYear);
    var flag = 1;
    var tempWeek = startWeek;
    var tempYear = startYear;
    var index = 0;

    while(flag != 0) {

        weeksBetween[index] = "Viikko " + tempWeek + ", " + tempYear;
        index = index + 1;

        if(tempWeek == endWeek && tempYear == endYear) {
            break;
        }

        if(tempWeek == weeksInCurrentYear) {
            tempWeek = 1;
            tempYear = tempYear + 1;
            weeksInCurrentYear = getNumberOfWeeksInYear(tempYear);
        } else {
            tempWeek = tempWeek + 1;
        }

    }

    return weeksBetween;
}

function getWeek(year, month, day) {
    //Find JulianDay

    month += 1;
    //use 1-12

    var a = Math.floor((14 - (month)) / 12);
    var y = year + 4800 - a;
    var m = (month) + (12 * a) - 3;
    var jd = day + Math.floor(((153 * m) + 2) / 5) + (365 * y) + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    // (gregorian calendar)

    //var jd = (day+1)+Math.Round(((153*m)+2)/5)+(365+y) +

    //                 Math.round(y/4)-32083;    // (julian calendar)

    //now calc weeknumber according to JD

    var d4 = (jd + 31741 - (jd % 7)) % 146097 % 36524 % 1461;
    var L = Math.floor(d4 / 1460);
    var d1 = ((d4 - L) % 365) + L;
    numberOfWeek = Math.floor(d1 / 7) + 1;
    return numberOfWeek;
}

function addWeeksToChoices(questionName) {
    var weeksBetween = new Array();
    var weekAttribute;
    var index = 0;

    var startDate = form1.getJSXByName(questionName).getDescendantOfName("aloitusPvm").getDate();
    var endDate = form1.getJSXByName(questionName).getDescendantOfName("lopetusPvm").getDate();

    var startYear = startDate.getFullYear();
    var startMonth = startDate.getMonth();
    var startDay = startDate.getDate();

    var endYear = endDate.getFullYear();
    var endMonth = endDate.getMonth();
    var endDay = endDate.getDate();

    var startWeek = getWeek(startYear, startMonth, startDay);
    var endWeek = getWeek(endYear, endMonth, endDay);

    var weeksBetween = getWeeksBetween(startWeek, startYear, endWeek, endYear);

    for(key in weeksBetween) {
        weekAttribute = weeksBetween[index];
        if(weekAttribute != null) {
            addCalendarChoiceToForm(questionName, weekAttribute);
            // mapMultipleChoiceToMatrix(form1.getJSXByName("multipleChoiceCounter").getValue(),questionName,weekAttribute,questionNumber);

            index = index + 1;
        }
    }
}

function addDaysToChoices(questionName) {
    var daysBetween = new Array();
    var dayAttribute, dayYear, dayMonth, dayDay;
    var day;
    var index = 0;
    var startDate = form1.getJSXByName(questionName).getDescendantOfName("aloitusPvm").getDate();
    var endDate = form1.getJSXByName(questionName).getDescendantOfName("lopetusPvm").getDate();

    for( day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
        dayYear = day.getFullYear();
        dayMonth = day.getMonth() + 1;
        dayDay = day.getDate();
        dayAttribute = dayDay + "." + dayMonth + "." + dayYear;

        addCalendarChoiceToForm(questionName, dayAttribute);

    }

}

function addHoursToChoices(questionName) {

    var daysBetween = new Array();
    var dayAttribute, dayYear, dayMonth, dayDay, hourAttribute;
    var day, hour;
    var index = 0;

    var startDate = form1.getJSXByName(questionName).getDescendantOfName("aloitusPvm").getDate();
    var endDate = form1.getJSXByName(questionName).getDescendantOfName("lopetusPvm").getDate();

    var startTime = form1.getJSXByName(questionName).getDescendantOfName("aloitusAika").getValue();
    var endTime = form1.getJSXByName(questionName).getDescendantOfName("lopetusAika").getValue();

    var helperStartTime = new Date();
    var helperEndTime = new Date();

    var startTimeHours = startTime.substr(0, 2);
    var startTimeMinutes = startTime.substr(3, 2);

    var endTimeHours = endTime.substr(0, 2);
    var endTimeMinutes = endTime.substr(3, 2);

    helperStartTime.setHours(startTimeHours);
    helperStartTime.setMinutes(startTimeMinutes);
    helperEndTime.setHours(endTimeHours);
    helperEndTime.setMinutes(endTimeMinutes);

    for( day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
        dayYear = day.getFullYear();
        dayMonth = day.getMonth() + 1;
        dayDay = day.getDate();
        dayAttribute = dayDay + "." + dayMonth + "." + dayYear;

        for( hour = helperStartTime; hour <= helperEndTime; hour.setHours(hour.getHours() + 1)) {
            hourAttribute = hour.getHours() + ":00";
            hourAttribute = dayAttribute + " " + hourAttribute;
            addCalendarChoiceToForm(questionName, hourAttribute);
        }

        helperStartTime.setHours(startTimeHours);
        helperStartTime.setMinutes(startTimeMinutes);
        helperEndTime.setHours(endTimeHours);
        helperEndTime.setMinutes(endTimeMinutes);
        hour = helperStartTime;

    }
}

function addCalendarChoiceToForm(tempID, choiceText) {

    var block = "choiceBlock" + tempID;
    var choiceTextField = "choiceTextField" + tempID;
    var id = form1.getJSXByName(tempID).getChild("tempID").getValue() + "_" + form1.getJSXByName(tempID).getChild("choiceCounter").getValue();

    var section = form1.getJSXByName(tempID).getDescendantOfName("choiceBlock" + tempID).load("components/choicesection.xml", true);

    form1.getJSXByName(tempID).getDescendantOfName("choiceBlock" + tempID).setHeight(form1.getJSXByName(tempID).getDescendantOfName("choiceBlock" + tempID).getHeight() + 30, true).repaint();
    form1.getJSXByName(tempID).setHeight(form1.getJSXByName(tempID).getHeight() + 30, true);
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 30).repaint();

    form1.getJSXByName("choicePane").setName("choicePane" + id).repaint();

    form1.getJSXByName("choicePane" + id).getDescendantOfName("checkLabel").setText(choiceText).repaint();
    mapMultipleChoiceToMatrix(form1.getJSXByName("multipleChoiceCounter").getValue(), tempID, choiceText, form1.getJSXByName(tempID).getChild("choiceCounter").getValue());
    form1.getJSXByName("choicePane" + id).getChild("choiceUniversalID").setValue(form1.getJSXByName("multipleChoiceCounter").getValue());
    form1.getJSXByName("multipleChoiceCounter").setValue(parseInt(form1.getJSXByName("multipleChoiceCounter").getValue()) + 1);
    form1.getJSXByName(tempID).getChild("choiceCounter").setValue(parseInt(form1.getJSXByName(tempID).getChild("choiceCounter").getValue()) + 1);
}

function addCalendarChoices(questionName) {

    var type = form1.getJSXByName(questionName).getDescendantOfName("aikataso").getValue();

    if(type == "Viikko") {
        addWeeksToChoices(questionName);
    }
    if(type == "Paiva") {
        addDaysToChoices(questionName);
    }
    if(type == "Tunti") {
        addHoursToChoices(questionName);
    }

}

//Getting the domain name and port if available
function getUrl() {
    var domain = getDomainName();
    if(domain.search("file") != -1) {
        domain = "http://62.61.65.15:8380";
    }
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

function getDomainName() {

    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];

    return domain_name;

}

function Preload() {
    try {
        var id = form1.getJSXByName("User_Sender").getValue();
        var formData = Arcusys.Internal.Communication.GetTemplateNames(id);

        if(formData != null) {
            mapTemplateNamesToField(formData);

        }
    } catch (e) {
        alert(e);
    }

}

//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetTemplateNames = function(userUid) {

        var tout = 1000;
        var limit = 20;

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getRequestTemplateSummary><user>" + userUid + "</user><subjectPrefix></subjectPrefix><limit>" + limit + "</limit></soa:getRequestTemplateSummary></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("KokuRequestProcessingService");
        // var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-kv-model-0.1-SNAPSHOT/KokuRequestProcessingServiceImpl";
        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        var req = new jsx3.net.Request();

        req.open('POST', url, false);

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        var objXML = req.getResponseXML();

        // var objXML = req.getResponseXML();
        if(objXML == null) {
            alert("Virhe palvelinyhteydess\xE4");
        } else {
            return objXML;

        }
    };
});
//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetTemplate = function(id) {

        var tout = 1000;
        // var limit = 100;

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getRequestTemplateById><requestTemplateId>" + id + "</requestTemplateId></soa:getRequestTemplateById></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("KokuRequestProcessingService");
        // var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-kv-model-0.1-SNAPSHOT/KokuRequestProcessingServiceImpl";

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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.DoesReuqestTemplateExist = function(creator, subject) {

        var tout = 1000;
        // var limit = 100;

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:isRequestTemplateExist><creator>" + creator + "</creator><subject>" + subject + "</subject></soa:isRequestTemplateExist></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("KokuRequestProcessingService");
        // var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-kv-model-0.1-SNAPSHOT/KokuRequestProcessingServiceImpl";
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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserUidByUsername = function(username) {

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
function getTemplate(templateId) {

    try {
        // Add form preload functions here.
        var formData = Arcusys.Internal.Communication.GetTemplate(templateId);

        if(formData != null) {
            createFormFromTemplateData(formData);
            form1.getJSXByName("RequestProcessing_RequestID").setValue(templateId).repaint();
            // mapTemplateNamesToField(formData);
            setButtonDisplay("IntalioInternal_StartButton", "inline-block");

            form1.getJSXByName("Pohja").setDisplay("none").repaint();
            form1.getJSXByName("Roolit").setDisplay("block").repaint();
        }
    } catch (e) {
        alert(e);
    }

}

function inputMultipleChoiceQuestion(tempID, question, questionNumber) {
    var block = "choiceBlock" + tempID;
    var choiceTextField = "choiceTextField" + tempID;
    var id = tempID + "_" + questionNumber;

    var section = form1.getJSXByName(block).load("components/choicesection.xml", true);

    form1.getJSXByName(block).setHeight(form1.getJSXByName(block).getHeight() + 30, true).repaint();
    form1.getJSXByName(block).getParent().setHeight(form1.getJSXByName(block).getParent().getHeight() + 30);
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 30).repaint();

    var choice = section.getFirstChild().getFirstChild().getFirstChild();
    var label = section.getFirstChild().getFirstChild().getNextSibling().getFirstChild();
    var idField = section.getLastChild();

    choice.setName(choice.getName() + id);
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    label.setText(question, true);

    idField.setValue(id);

    form1.getJSXByName("choicePane" + id).getChild("choiceUniversalID").setValue(form1.getJSXByName("multipleChoiceCounter").getValue());

    mapMultipleChoiceToMatrix(form1.getJSXByName("multipleChoiceCounter").getValue(), tempID, question, questionNumber);
    //  mapMultipleChoiceToMatrix(form1.getJSXByName("multipleChoiceCounter").getValue(),tempID,question,form1.getJSXByName(tempID).getChild("choiceCounter").getValue());
    form1.getJSXByName("multipleChoiceCounter").setValue(parseInt(form1.getJSXByName("multipleChoiceCounter").getValue()) + 1);
    form1.getJSXByName(tempID).getChild("choiceCounter").setValue(parseInt(form1.getJSXByName(tempID).getChild("choiceCounter").getValue()) + 1);
}

function inputSectionFromTemplate(question, sectionNumber, inputType) {
    var title = "";
    if(inputType == "FREE_TEXT") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputTextSection(title, question, sectionNumber);
    }
    if(inputType == "YES_NO") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputYesNoSection(title, question, sectionNumber);
    }
    if(inputType == "MULTIPLE_CHOICE") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputMultipleChoiceSection(title, question, sectionNumber);
    }
    if(inputType == "CALENDAR") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputCalendarSection(title, question, sectionNumber);
    }
    if(inputType == "NUMBER") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputNumberSection(title, question, sectionNumber);
    }
}

function createFormFromTemplateData(data) {
    form1.getJSXByName("header").setDisplay("block").repaint();
    form1.getJSXByName("paneBlock").setDisplay("block").repaint();
    form1.getJSXByName("User").setDisplay("block").repaint();

    var headerText = data.selectSingleNode("//subject", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    form1.getJSXByName("Header_Text").setValue(headerText).repaint();
    form1.getJSXByName("formHeaderLabel").setText(headerText).repaint();

    var questions = data.selectNodeIterator("//questions", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");
    var questionDescription, questionNumber, questionType;
    var childNode, childNode1;
    var childIte;
    var i = 0;

    while(questions.hasNext()) {
        childNode = questions.next();
        childIte = childNode.getChildIterator();

        while(childIte.hasNext()) {
            childNode1 = childIte.next();
            if(i == 0) {
                questionDescription = childNode1.getValue();
            }
            if(i == 1) {
                questionNumber = childNode1.getValue();
            }
            if(i == 2) {
                questionType = childNode1.getValue();
            }
            i = i + 1;

        }
        if(questionNumber >= form1.getJSXByName("sectionNumber").getValue()) {
            form1.getJSXByName("sectionNumber").setValue(parseInt(questionNumber) + 1);
        }
        inputSectionFromTemplate(questionDescription, questionNumber, questionType);
        i = 0;

    }

    var descendants = data.selectNodeIterator("//choices", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");

    var choiceDescription, choiceNumber, choiceQuestionNumber;

    while(descendants.hasNext()) {
        childNode = descendants.next();
        childIte = childNode.getChildIterator();

        while(childIte.hasNext()) {
            childNode1 = childIte.next();
            if(i == 0) {
                choiceDescription = childNode1.getValue();
            }
            if(i == 1) {
                choiceNumber = childNode1.getValue();
            }
            if(i == 2) {
                choiceQuestionNumber = childNode1.getValue();
            }
            i = i + 1;

        }
        inputMultipleChoiceQuestion(choiceQuestionNumber, choiceDescription, choiceNumber);
        i = 0;

    }

    showForm(form1.getJSXByName("showFormFlag").getValue());

}

function mapTemplateNamesToField(data) {

    var descendants = data.selectNodeIterator("//return", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");

    var subject, requestTemplateId;
    var xmlForSelectBox = "<data>";

    while(descendants.hasNext()) {
        childNode = descendants.next();
        requestTemplateId = childNode.getFirstChild().getValue();
        subject = childNode.getLastChild().getValue();
        subject = removeQuotes(subject);
        if(subject != "")
            xmlForSelectBox = xmlForSelectBox + "<record jsxid=\"" + requestTemplateId + "\" jsxtext=\"" + subject + "\"/>";
    }
    xmlForSelectBox = xmlForSelectBox + "</data>";

    form1.getJSXByName("PohjanValinta").setXMLString(xmlForSelectBox);
    form1.getJSXByName("PohjanValinta").resetXmlCacheData();
    form1.getJSXByName("PohjanValinta").repaint();

}

function mapFormDataToFields(objXML) {

    var value = objXML.selectNodes("//tns:return", "xmlns:tns='http://soa.kv.koku.arcusys.fi/'");

    if(objXML.selectSingleNode("//approvedSlotNumber", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'"))
        approvedSlotNumber = objXML.selectSingleNode("//approvedSlotNumber", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
}

function useTemplate() {
    getRoles(form1.getJSXByName("User_Sender").getValue());
    form1.getJSXByName("showFormFlag").setValue("Y").repaint();

    form1.getJSXByName("Lomaketyyppi").setDisplay("none").repaint();
    form1.getJSXByName("Pohja").setDisplay("block").repaint();
    form1.getJSXByName("Kentat").setDisplay("none").repaint();
}

function dontUseTemplate() {
    form1.getJSXByName("Haku_Kayttajat").setDisplay("block").repaint(); // show user/group search
    setButtonDisplay("IntalioInternal_StartButton", "inline-block");
    getRoles(form1.getJSXByName("User_Sender").getValue());
    form1.getJSXByName("showFormFlag").setValue("Y").repaint();

    form1.getJSXByName("Lomaketyyppi").setDisplay("none").repaint();
    form1.getJSXByName("Pohja").setDisplay("none").repaint();
    form1.getJSXByName("Kentat").setDisplay("block").repaint();

    form1.getJSXByName("header").setDisplay("block").repaint();
    form1.getJSXByName("User").setDisplay("block").repaint();
    form1.getJSXByName("paneBlock").setDisplay("block").repaint();
    form1.getJSXByName("Roolit").setDisplay("block", true);
}

function uncheckTheOthers(target, checked) {
    var i, descendants = form1.getJSXByName(target).getDescendantsOfType("jsx3.gui.CheckBox");

    for( i = 0; i < descendants.length; i++) {
        if(descendants[i].getName() != checked) {
            descendants[i].setChecked(0);
        }
    }
}

function addChoice(tempID) {
    var block = "choiceBlock" + tempID;
    var choiceTextField = "choiceTextField" + tempID;
    var id = form1.getJSXByName(tempID).getChild("tempID").getValue() + "_" + form1.getJSXByName(tempID).getChild("choiceCounter").getValue();

    var section = form1.getJSXByName(block).load("components/choicesection.xml", true);

    form1.getJSXByName(block).setHeight(form1.getJSXByName(block).getHeight() + 30, true);
    form1.getJSXByName(block).getParent().setHeight(form1.getJSXByName(block).getParent().getHeight() + 30, true);
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 30, true);

    var choice = section.getFirstChild().getFirstChild().getFirstChild();
    var label = section.getFirstChild().getFirstChild().getNextSibling().getFirstChild();
    var idField = section.getLastChild();

    choice.setName(choice.getName() + id);
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    label.setText(form1.getJSXByName(choiceTextField).getValue(), true);

    idField.setValue(id);

    form1.getJSXByName("choicePane" + id).getChild("choiceUniversalID").setValue(form1.getJSXByName("multipleChoiceCounter").getValue());

    mapMultipleChoiceToMatrix(form1.getJSXByName("multipleChoiceCounter").getValue(), tempID, form1.getJSXByName(choiceTextField).getValue(), form1.getJSXByName(tempID).getChild("choiceCounter").getValue());
    form1.getJSXByName("multipleChoiceCounter").setValue(parseInt(form1.getJSXByName("multipleChoiceCounter").getValue()) + 1);
    form1.getJSXByName(tempID).getChild("choiceCounter").setValue(parseInt(form1.getJSXByName(tempID).getChild("choiceCounter").getValue()) + 1);
}

function mapMultipleChoiceToMatrix(id, sectionNumber, question, questionNumber) {
    var node;
    var hasEmptyChild = formatDataCache("MultipleChoice-nomap", "MultipleChoice");
    node = form1.getCache().getDocument("MultipleChoice-nomap").getFirstChild().cloneNode();
    node.setAttribute("jsxid", id);
    node.setAttribute("MultipleChoice_Section", sectionNumber);
    node.setAttribute("MultipleChoice_Question", question);
    node.setAttribute("MultipleChoice_Number", questionNumber);
    node.setAttribute("MultipleChoice_Checked", false);
    form1.getCache().getDocument("MultipleChoice-nomap").insertBefore(node);
    if(hasEmptyChild == true) {
        form1.getCache().getDocument("MultipleChoice-nomap").removeChild(form1.getCache().getDocument("MultipleChoice-nomap").getFirstChild());
    }
}

function removeChoice(block, ID) {
    var choiceID1 = ID.getChild("choiceUniversalID").getValue();

    form1.getCache().getDocument("MultipleChoice-nomap").removeChild(form1.getCache().getDocument("MultipleChoice-nomap").selectSingleNode("//record[@jsxid='" + choiceID1 + "']"));
    form1.getJSXByName(block).removeChild(ID);
    form1.getJSXByName(block).setHeight(form1.getJSXByName(block).getHeight() - 30, true).repaint();
    form1.getJSXByName(block).getParent().setHeight(form1.getJSXByName(block).getParent().getHeight() - 30);
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 30).repaint();

}

function getTemplateID() {
    form1.getJSXByName("templateID").setValue(parseInt(form1.getJSXByName("templateID").getValue()) + 1);
    var templateID = form1.getJSXByName("templateID").getValue();
    return templateID;
}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.IsTemplateNameExisting = function(creator, templateName) {

        var tout = 1000;
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:isRequestTemplateExist><creator>" + creator + "</creator><subject>" + templateName + "</subject></soa:isRequestTemplateExist></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();

        endpoint = getEndpoint("KokuRequestProcessingService");
        // var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-kv-model-0.1-SNAPSHOT/KokuRequestProcessingServiceImpl";

        /*var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getAppointment><appointmentId>" + appointmentId + "</appointmentId></soa:getAppointment></soapenv:Body></soapenv:Envelope>";
         var endpoint = "http://gatein.intra.arcusys.fi:8080/arcusys-koku-0.1-SNAPSHOT-av-model-0.1-SNAPSHOT/KokuAppointmentProcessingServiceImpl";
         var url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";*/

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);

        var req = new jsx3.net.Request();

        req.open('POST', url, false);

        //req.setRequestHeader("Content-Type","text/xml");

        //req.setRequestHeader("SOAPAction","");

        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        req.send(msg, tout);
        var objXML = req.getResponseXML();
        // alert(req.getStatus());

        // var objXML = req.getResponseXML();
        // alert("DEBUG - SERVER RESPONSE:" + objXML);
        if(objXML == null) {
            alert("Virhe palvelinyhteydess\xE4");
        } else {
            return objXML;

        }
    };
});

function resetChoiceSection() {
    form1.getJSXByName("rootpane").setHeight(120, 1);
    // form1.getJSXByName("Block").setHeight(30,1);
    form1.getJSXByName("checkID").setValue(0);
    form1.getJSXByName("choiceLabelID").setValue(0);
}

function test() {

    var choiceID = form1.getJSXByName("checkID").getValue();
    var labelID = form1.getJSXByName("choiceLabelID").getValue();

    var section = form1.getJSXByName("Block").load("components/choicesection.xml", true);
    form1.getJSXByName("rootpane").setHeight(form1.getJSXByName("rootpane").getHeight() + 30, 1);
    form1.getJSXByName("Block").setHeight(form1.getJSXByName("Block").getHeight() + 30, 1);
    var choice = section.getFirstChild().getFirstChild().getFirstChild();
    var label = section.getFirstChild().getLastChild().getFirstChild();
    choice.setName(choice.getName() + choiceID);
    label.setName(label.getName() + labelID);
    label.setText(form1.getJSXByName("vaihtoehto_text").getValue(), 1);

    form1.getJSXByName("checkID").setValue(parseInt(form1.getJSXByName("checkID").getValue()) + 1);
    form1.getJSXByName("choiceLabelID").setValue(parseInt(form1.getJSXByName("choiceLabelID").getValue()) + 1);

}

function getTaskSubscribe() {
    Intalio.Internal.Utilities.SERVER.subscribe(Intalio.Internal.Utilities.GET_TASK_SUCCESS, prepareForm);
};

function prepareForm() {
    var username = Intalio.Internal.Utilities.getUser();
    var firstname, lastname;
    username = username.substring((username.indexOf("\\") + 1));
    setButtonDisplay("IntalioInternal_StartButton", "none");

    form1.getJSXByName("User_SenderDisplay").setValue(username);
    form1.getJSXByName("User_SenderDisplay").setEnabled(jsx3.gui.Form.STATEDISABLED).repaint();

    try {
        // Add form preload functions here.
        var userUid = Arcusys.Internal.Communication.GetUserUidByUsername(username);
        id = userUid.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
        //Arcusys.Internal.Communication.GerLDAPUser();

        if(userUid != null) {
            form1.getJSXByName("User_Sender").setValue(userUid.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
        }

    } catch (e) {
        alert(e);
    }
    data = Arcusys.Internal.Communication.getUserInfo(id);
    form1.getJSXByName("User_SenderDisplay").setValue(parseName(data));
}

function setButtonDisplay(label, display, width) {
    $('span[label|="' + label + '"]').css('display', display);
    //$('span[label|="' + label + '"]').css('width', width);
}

// Changedate: 15.3.12. Added the function below to parse user's real name instead of using username.
function parseName(input) {
    firstname = data.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    lastname = data.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    wholename = firstname + " " + lastname;
    return (wholename);
}

jsx3.lang.Package.definePackage("koku.service", //the full name of the package to create
function(service) {//name the argument of this function

    //call this method to begin the service call (eg.service.callhaeOrganisaatiot();)
    service.callhaeOrganisaatiot = function() {
        var objService = form1.loadResource("MockMapping_xml");
        objService.setOperation("haeOrganisaatiot");

        //subscribe
        objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.onhaeOrganisaatiotSuccess);
        objService.subscribe(jsx3.net.Service.ON_ERROR, service.onhaeOrganisaatiotError);
        objService.subscribe(jsx3.net.Service.ON_INVALID, service.onhaeOrganisaatiotInvalid);

        //PERFORMANCE ENHANCEMENT: uncomment the following line of code to use XSLT to convert the server response to CDF (refer to the API docs for jsx3.net.Service.compile for implementation details)
        //objService.compile();

        //call the service
        objService.doCall();
    };

    service.onhaeOrganisaatiotSuccess = function(objEvent) {

    };

    service.onhaeOrganisaatiotError = function(objEvent) {
        var myStatus = objEvent.target.getRequest().getStatus();
        objEvent.target.getServer().alert("Error", "The service call failed. The HTTP Status code is: " + myStatus);
    };

    service.onhaeOrganisaatiotInvalid = function(objEvent) {
        objEvent.target.getServer().alert("Invalid", "The following message node just failed validation:\n\n" + objEvent.message);
    };
});

jsx3.lang.Package.definePackage("kokuhenkilot.service", //the full name of the package to create
function(service) {//name the argument of this function

    //call this method to begin the service call (eg.service.callhaeHenkilotOrganisaatiossa();)
    service.callhaeHenkilotOrganisaatiossa = function() {
        var objService = form1.loadResource("MockMapping_xml");
        objService.setOperation("haeHenkilotOrganisaatiossa");

        //subscribe
        objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.onhaeHenkilotOrganisaatiossaSuccess);
        objService.subscribe(jsx3.net.Service.ON_ERROR, service.onhaeHenkilotOrganisaatiossaError);
        objService.subscribe(jsx3.net.Service.ON_INVALID, service.onhaeHenkilotOrganisaatiossaInvalid);

        //PERFORMANCE ENHANCEMENT: uncomment the following line of code to use XSLT to convert the server response to CDF (refer to the API docs for jsx3.net.Service.compile for implementation details)
        //objService.compile();

        //call the service
        objService.doCall();
    };

    service.onhaeHenkilotOrganisaatiossaSuccess = function(objEvent) {
        //var responseXML = objEvent.target.getInboundDocument();
        objEvent.target.getServer().alert("Success", "The service call was successful.");
    };

    service.onhaeHenkilotOrganisaatiossaError = function(objEvent) {
        var myStatus = objEvent.target.getRequest().getStatus();
        objEvent.target.getServer().alert("Error", "The service call failed. The HTTP Status code is: " + myStatus);
    };

    service.onhaeHenkilotOrganisaatiossaInvalid = function(objEvent) {
        objEvent.target.getServer().alert("Invalid", "The following message node just failed validation:\n\n" + objEvent.message);
    };
});
function prepareFormMatrix() {
    form1.getJSXByName("TextInput").commitAutoRowSession();
    form1.getJSXByName("MultipleChoice").commitAutoRowSession();
}

function showForm(flag) {
    var descendant, descendants;
    if(flag == "N") {
        form1.getJSXByName("Kentat").setDisplay("block").repaint();

        var childNode;
        var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();
        var fieldsetNumber;
        var descendant, descendants, x;

        while(childIterator.hasNext()) {
            childNode = childIterator.next();
            fieldsetNumber = childNode.getAttribute("TextInput_Number");
            if(fieldsetNumber != "") {
                if(childNode.getAttribute("TextInput_Type") == "MULTIPLE_CHOICE") {
                    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 80).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() + 80).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneOption", true, false);
                    descendant.setHeight(descendant.getHeight() + 40).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneAddChoice", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("deleteButton");
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    descendants = form1.getJSXByName("choiceBlock" + fieldsetNumber).getDescendantsOfType("jsx3.gui.Button");
                    for( x = 0; x < descendants.length; x = x + 1) {
                        descendants[x].setDisplay("block", true);
                    }
                } else if(childNode.getAttribute("TextInput_Type") == "CALENDAR") {
                    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 150).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() + 150).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneEdit", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();

                    if(form1.getJSXByName(fieldsetNumber).getDescendantOfName("aikataso").getValue() == "Tunti") {
                        //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 50).repaint();
                        form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() + 50).repaint();
                        descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneHours", true, false);
                        descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    }
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneAddButton", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneDelete", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    descendants = form1.getJSXByName("choiceBlock" + fieldsetNumber).getDescendantsOfType("jsx3.gui.Button");
                    for( x = 0; x < descendants.length; x = x + 1) {
                        descendants[x].setDisplay("block", true);
                    }
                } else {
                    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 23).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() + 23).repaint();
                    form1.getJSXByName(fieldsetNumber).getDescendantOfName("deleteButton").setDisplay("block", true);
                }
            }
            descendant = "";
            descendants = "";

        }
        form1.getJSXByName("showFormFlag").setValue("Y").repaint();
    } else {
        form1.getJSXByName("Kentat").setDisplay("none").repaint();

        var childNode;
        var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();
        var fieldsetNumber;

        while(childIterator.hasNext()) {
            childNode = childIterator.next();
            fieldsetNumber = childNode.getAttribute("TextInput_Number");
            if(fieldsetNumber != "") {
                if(childNode.getAttribute("TextInput_Type") == "MULTIPLE_CHOICE") {
                    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 80).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() - 80).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneOption", true, false);
                    descendant.setHeight(descendant.getHeight() - 40).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneAddChoice", true, false);
                    descendant.setDisplay("none").repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("deleteButton", true, false);
                    descendant.setDisplay("none").repaint();
                    descendants = form1.getJSXByName("choiceBlock" + fieldsetNumber).getDescendantsOfType("jsx3.gui.Button");
                    for( x = 0; x < descendants.length; x = x + 1) {
                        descendants[x].setDisplay("none", true);
                    }
                } else if(childNode.getAttribute("TextInput_Type") == "CALENDAR") {
                    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 150).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() - 150).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneEdit", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYNONE).repaint();
                    if(form1.getJSXByName(fieldsetNumber).getDescendantOfName("aikataso").getValue() == "Tunti") {
                        //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 50).repaint();
                        form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() - 50).repaint();
                        descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneHours", true, false);
                        descendant.setDisplay(jsx3.gui.Block.DISPLAYNONE).repaint();
                    }
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneAddButton", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYNONE).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneDelete", true, false);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYNONE).repaint();
                    descendants = form1.getJSXByName("choiceBlock" + fieldsetNumber).getDescendantsOfType("jsx3.gui.Button");
                    for( x = 0; x < descendants.length; x = x + 1) {
                        descendants[x].setDisplay("none", true);
                    }
                } else {
                    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 23).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() - 23).repaint();
                    form1.getJSXByName(fieldsetNumber).getDescendantOfName("deleteButton").getParent().setDisplay("none", true);
                }
            }
            descendant = "";
            descendants = "";
        }
        form1.getJSXByName("showFormFlag").setValue("N").repaint();
    }
}

function setValueToText(value, textLabel) {
    form1.getJSXByName(textLabel).setText(value).repaint();

}

function mapFieldsToMatrix(title, question, sectionNumber, type) {
    var node;
    var hasEmptyChild = formatDataCache("TextInput-nomap", "TextInput");
    node = form1.getCache().getDocument("TextInput-nomap").getFirstChild().cloneNode();
    node.setAttribute("jsxid", sectionNumber);
    node.setAttribute("TextInput_Question", question);
    node.setAttribute("TextInput_Section", title);
    node.setAttribute("TextInput_Number", sectionNumber);
    node.setAttribute("TextInput_Type", type);
    form1.getCache().getDocument("TextInput-nomap").insertBefore(node);
    if(hasEmptyChild == true) {
        form1.getCache().getDocument("TextInput-nomap").removeChild(form1.getCache().getDocument("TextInput-nomap").getFirstChild());
    }
}

function json() {
    var myJSONObject = {
        "TaskOutput" : {
            "TextInput" : {
                "TextInput_Question" : form1.getJSXByName("labelKysymys").getText(),
                "TextInput_Answer" : form1.getJSXByName("textbox").getValue()
            }
        }
    };
    alert(myJSONObject);
    var myObject = eval('(' + myJSONObject + ')');
    alert(myObject);
}

function getInputType() {
    var input;
    if(form1.getJSXByName("vastausVapaa").getChecked()) {
        input = "FREE_TEXT";
    }
    if(form1.getJSXByName("vastausKyllaEi").getChecked()) {
        input = "YES_NO";
    }
    if(form1.getJSXByName("vastausVapaatVaihtoehdot").getChecked()) {
        input = "MULTIPLE_CHOICE";
    }
    if(form1.getJSXByName("vastausKalenteriVaihtoehdot").getChecked()) {
        input = "CALENDAR";
    }
    if(form1.getJSXByName("vastausNumeroVaihtoehdot").getChecked()) {
        input = "NUMBER";
    }

    return input;
}

function getAndRaiseSectionNumber() {
    var sectionNumber = form1.getJSXByName("sectionNumber").getValue();
    form1.getJSXByName("sectionNumber").setValue(parseInt(sectionNumber) + 1);
    return sectionNumber;
}

function inputSection(title, question) {
    var sectionNumber = getAndRaiseSectionNumber();
    var inputType = getInputType();
    if(inputType == "FREE_TEXT") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputTextSection(title, question, sectionNumber);
    }
    if(inputType == "YES_NO") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputYesNoSection(title, question, sectionNumber);
    }
    if(inputType == "MULTIPLE_CHOICE") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputMultipleChoiceSection(title, question, sectionNumber);
    }
    if(inputType == "CALENDAR") {
        // alert("CALENDAR");
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputCalendarSection(title, question, sectionNumber);
    }
    if(inputType == "NUMBER") {
        mapFieldsToMatrix(title, question, sectionNumber, inputType);
        inputNumberSection(title, question, sectionNumber);
    }

}

function inputTextSection(title, question, nameSection) {
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 205, true);
    var textSection = form1.getJSXByName("block").load("components/textinputsection.xml", true);
    textSection.setName(nameSection).repaint();
    form1.getJSXByName("labelKysymys").setText(question).repaint();

}

function inputYesNoSection(title, question, nameSection) {
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 213, true);
    var textSection = form1.getJSXByName("block").load("components/yesnosection.xml", true);

    textSection.setName(nameSection).repaint();
    form1.getJSXByName("labelKysymys").setText(question).repaint();

}

function inputMultipleChoiceSection(title, question, nameSection) {

    // var id = getTemplateID();
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 215, true).repaint();
    var textSection = form1.getJSXByName("block").load("components/multiplechoicesection.xml", true);
    textSection.setName(nameSection).repaint();
    //textSection.setTitleText(title).repaint();
    form1.getJSXByName("labelKysymys").setText(question).repaint();
    var block = "choiceBlock" + nameSection;
    var choiceTextfield = "choiceTextField" + nameSection;
    form1.getJSXByName("choiceBlock").setName(block);
    form1.getJSXByName("choiceTextField").setName(choiceTextfield);
    form1.getJSXByName("tempID").setValue(nameSection);

}

function inputCalendarSection(title, question, nameSection) {
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 275).repaint();
    var textSection = form1.getJSXByName("block").load("components/multiplecalendarsection.xml", true);

    textSection.setName(nameSection).repaint();
    
    var startDate = textSection.getDescendantOfName("aloitusPvm");
    var endDate = textSection.getDescendantOfName("lopetusPvm");
    startDate.setName(startDate.getName() + nameSection);
    endDate.setName(endDate.getName() + nameSection);

    var block = "choiceBlock" + nameSection;
    textSection.getDescendantOfName("choiceBlock").setName(block);

    form1.getJSXByName("labelKysymys").setText(question).repaint();

}

function inputNumberSection(title, question, nameSection) {
    //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 95).repaint();
    var textSection = form1.getJSXByName("block").load("components/numberinputsection.xml", true);

    textSection.setName(nameSection).repaint();
    form1.getJSXByName("labelKysymys").setText(question).repaint();

}

function removeThisSection(sectionComponent, type) {
    var sectionName = sectionComponent.getName();

    form1.getJSXByName("block").removeChild(sectionComponent);
    form1.getCache().getDocument("TextInput-nomap").removeChild(form1.getCache().getDocument("TextInput-nomap").selectSingleNode("//record[@TextInput_Number='" + sectionName + "']"));

    if(type == "textinputsection") {
        //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 205).repaint();
    }
    if(type == "yesnoinputsection") {
        //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 145).repaint();
    }
    if(type == "multiplechoice") {
        //form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 133).repaint();
        removeChildrenOfThisMultipleChoiceSection(sectionName);
    }

}

function removeChildrenOfThisMultipleChoiceSection(sectionName) {
    var removableChildNodeIds = new Array();
    var removeIndex = 0;
    var childNode;
    var childIterator = form1.getCache().getDocument("MultipleChoice-nomap").getChildIterator();
    var fieldsetNumber;

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        fieldsetNumber = childNode.getAttribute("MultipleChoice_Section");
        if(fieldsetNumber == sectionName) {

            removableChildNodeIds[removeIndex] = childNode.getAttribute("jsxid");
            removeIndex = removeIndex + 1;

        }
    }
    var index1 = 0;
    for(key in removableChildNodeIds) {
        node1 = form1.getCache().getDocument("MultipleChoice-nomap").selectSingleNode("//record[@jsxid='" + removableChildNodeIds[index1] + "']");
        if(node1 != null) {
            form1.getCache().getDocument("MultipleChoice-nomap").removeChild(node1);
            index1 = index1 + 1;
            form1.getJSXByName("block").setHeight(form1.getJSXByName("block").getHeight() - 30).repaint();
        }
    }
}

jsx3.lang.Package.definePackage("Intalio.Internal.Utilities", function(util) {

    util.showLoading = function() {
        Intalio.Internal.Utilities.hideSuccess();
        Intalio.Internal.Utilities.dimForm();
        var div = document.getElementById("IntalioInternal_loading");
        Intalio.Internal.Utilities.centerDiv(div);
        div.style.visibility = "hidden";
    };
});
// RECEIPIENTCOMPONENT-SCRIPT

function mapSelectedRecipientsToMatrix() {

    var node, hasEmptyChild, jsxid, childIterator, group, uid, groupUid, childNode, xmlData, list, userData, i, kunpoUsername, displayName;
    jsxid = 0;
    list = ["uid"];
    rooliKayttajat = "";
    userIds = "";
    var parentInfo;
    childIterator = form1.getCache().getDocument("receipientsToShow-nomap").getChildIterator();
    // get recipients
    hasEmptyChild = formatDataCache("Receipients-nomapNew", "Receipients");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        group = childNode.getAttribute("group");
        role = childNode.getAttribute("role");
        realm = childNode.getAttribute("realm");

        /*if(group != 0) {
         groupUid = childNode.getAttribute("uid");
         groupData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);
         userData = getData(groupData.selectNodeIterator("//user", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'"));
         nodes = convertArrayToNodesString(userData, "uid", "childUid");
         childData = Arcusys.Internal.Communication.GetChildinfo(nodes);
         parentData = getData(childData.selectNodeIterator("//parents", "xmlns:ns2='http://soa.tiva.koku.arcucsys.fi/'"));

         for( i = 0; i < parentData.length; i++) {
         if(parentData[i]["uid"]) {
         node = form1.getCache().getDocument("Receipients-nomapNew").getFirstChild().cloneNode();
         node.setAttribute("Receipients_ReceipientUid", parentData[i]["uid"]);
         node.setAttribute("Receipients_Receipient", "koku\\" + parentData[i]["displayName"]);
         node.setAttribute("Receipients_Realm", realm);
         form1.getCache().getDocument("Receipients-nomapNew").insertBefore(node);
         }
         }
         }*/
        if(role != 0) {
            uid = childNode.getAttribute("uid");
            roleName = childNode.getAttribute("receipient");
            usernamesData = Arcusys.Internal.Communication.GetUsernamesInRole(uid);
            node = form1.getCache().getDocument("Receipients-nomapNew").getFirstChild().cloneNode();
            usernames = usernamesData.selectNodeIterator("//username", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'");

            while(usernames.hasNext()) {
                userNamesNode = usernames.next();
                rooliKayttajat += "koku\\" + userNamesNode.getValue();
                userIdsData = Arcusys.Internal.Communication.GetUserUidByUsername(userNamesNode.getValue());
                userIds += userIdsData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();

                if(usernames.hasNext()) {
                    rooliKayttajat += ",";
                    userIds += ",";
                }
            }

            node.setAttribute("jsxid", jsxid);
            node.setAttribute("Receipients_ReceipientUid", userIds);
            node.setAttribute("Receipients_Receipient", rooliKayttajat);
            node.setAttribute("Receipients_Realm", realm);
            form1.getCache().getDocument("Receipients-nomapNew").insertBefore(node);
            jsxid++;
        } else {// add single users as recipients
            uid = childNode.getAttribute("uid");
            receipientName = childNode.getAttribute("receipient");
            node = form1.getCache().getDocument("Receipients-nomapNew").getFirstChild().cloneNode();

            if(realm == "Loora") {
                displayName = Arcusys.Internal.Communication.GetLooraUsernameByUid(uid).selectSingleNode("//looraUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
            } else if(realm == "Kunpo") {
                displayName = Arcusys.Internal.Communication.GetKunpoUsernameByUid(uid).selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
            }

            node.setAttribute("jsxid", jsxid);
            node.setAttribute("Receipients_ReceipientUid", uid);
            node.setAttribute("Receipients_Receipient", "koku\\" + displayName);
            node.setAttribute("Receipients_Realm", realm);
            form1.getCache().getDocument("Receipients-nomapNew").insertBefore(node);
            jsxid++;
        }

    }

    if(hasEmptyChild == true) {
        form1.getCache().getDocument("Receipients-nomapNew").removeChild(form1.getCache().getDocument("Receipients-nomapNew").getFirstChild());
    }
    // Delete dupes from the matrix
    deleteDupes();
}

function convertArrayToNodesString(array, index, wrapper) {
    var nodes = "";

    for( i = 0; i < array.length; i++) {
        nodes += "<" + wrapper + ">" + array[i][index] + "</" + wrapper + ">";
    }

    return nodes;
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

function deleteDupes() {
    var childIterator, childNode, sibling, temp, targetUid, currentUid;
    childIterator = form1.getCache().getDocument("Receipients-nomapNew").getChildIterator();

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        targetUid = childNode.getAttribute("Receipients_ReceipientUid");

        if(childNode.getNextSibling() != null) {
            sibling = childNode.getNextSibling();
        }

        while(sibling != null) {
            currentUid = sibling.getAttribute("Receipients_ReceipientUid");

            if(currentUid == targetUid) {
                temp = sibling;
                sibling = sibling.getNextSibling();
                form1.getCache().getDocument("Receipients-nomapNew").removeChild(temp);

            } else {
                sibling = sibling.getNextSibling();
            }

        }
    }
}

function intalioPreStart() {
    
    var sender, headerText, returnValue = null;
    
    sender = form1.getJSXByName("User_Sender");
    headerText = form1.getJSXByName("Header_Text");
    
    if(form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild() == null) {
        return "Pyynt\xF6\xF6n ei ole lis\xE4tty yht\xE4\xE4n vastaanottajaa. Lis\xE4\xE4 pyynn\xF6lle vastaanottajat.";
    }
    if(form1.getJSXByName("User_AnswerUntil").getValue() == "dd.MM.yyyy") {
        return "Puuttuvat tiedot: Vastauksen m\xE4\xE4r\xE4aika";
    }
    if(form1.getJSXByName("User_Reminder").getValue() == null) {
        return "Puuttuvat tiedot: Vastauksen muistutusraja";
    }
    if(form1.getCache().getDocument("TextInput-nomap").getFirstChild() == null) {
        return "Lomakkeelle ei ole lis\xE4tty yht\xE4\xE4n pyynt\xF6\xE4.";
    }

    mapSelectedRecipientsToMatrix();
    throughTextfields();
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
    descendants = form1.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");

    for( i = 0; i < descendants.length; i++) {
        value = form1.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        form1.getJSXByName(descendants[i].getName()).setValue(temp);
        form1.getJSXByName(descendants[i].getName()).repaint();
    }
}

function switchSearchMode(mode) {

    if(mode == "roles") {
        form1.getJSXByName("Haku_Kayttajat").setDisplay("none").repaint();
        form1.getJSXByName("Haku_Ryhmat").setDisplay("none").repaint();
        form1.getJSXByName("Haku_Roolit").setDisplay("block").repaint();

        form1.getJSXByName("HaeKayttajia_Checkbox1").setChecked(0).repaint();
        form1.getJSXByName("HaeRyhmia_Checkbox1").setChecked(0).repaint();
        form1.getJSXByName("HaeKayttajia_Checkbox2").setChecked(0).repaint();
        form1.getJSXByName("HaeRyhmia_Checkbox2").setChecked(0).repaint();
        form1.getJSXByName("HaeKayttajia_Checkbox3").setChecked(0).repaint();
        form1.getJSXByName("HaeRyhmia_Checkbox3").setChecked(0).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox3").setChecked(1).repaint();

    }

    if(mode == "groups") {
        form1.getJSXByName("Haku_Kayttajat").setDisplay("none").repaint();
        form1.getJSXByName("Haku_Ryhmat").setDisplay("block").repaint();
        form1.getJSXByName("Haku_Roolit").setDisplay("none").repaint();

        form1.getJSXByName("HaeKayttajia_Checkbox1").setChecked(0).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox1").setChecked(0).repaint();
        form1.getJSXByName("HaeKayttajia_Checkbox3").setChecked(0).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox3").setChecked(0).repaint();
        form1.getJSXByName("HaeKayttajia_Checkbox2").setChecked(0).repaint();
        form1.getJSXByName("HaeRyhmia_Checkbox2").setChecked(1).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox2").setChecked(0).repaint();

    }

    if(mode == "users") {
        form1.getJSXByName("Haku_Kayttajat").setDisplay("block").repaint();
        form1.getJSXByName("Haku_Ryhmat").setDisplay("none").repaint();
        form1.getJSXByName("Haku_Roolit").setDisplay("none").repaint();

        form1.getJSXByName("HaeRyhmia_Checkbox2").setChecked(0).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox2").setChecked(0).repaint();
        form1.getJSXByName("HaeRyhmia_Checkbox3").setChecked(0).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox3").setChecked(0).repaint();
        form1.getJSXByName("HaeKayttajia_Checkbox1").setChecked(1).repaint();
        form1.getJSXByName("HaeRyhmia_Checkbox1").setChecked(0).repaint();
        form1.getJSXByName("HaeRooleja_Checkbox1").setChecked(0).repaint();
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

    if(form1.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild() != null) {
        form1.getCache().getDocument("HaetutRyhmat-nomap").removeChildren();
        form1.getJSXByName("searchGroupMatrix").repaintData();

    }
    hasEmptyChild = false;
    xmlData = Arcusys.Internal.Communication.GetGroups(searchString);
    groupData = getData(xmlData.selectNodeIterator("//group", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'"));
    hasEmptyChild = formatDataCache("HaetutRyhmat-nomap", "searchGroupMatrix");

    for( i = 0; i < groupData.length; i++) {
        entryFound = true;
        node = form1.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild().cloneNode();

        node.setAttribute("jsxid", i);
        node.setAttribute("nimi", groupData[i]["groupName"]);
        node.setAttribute("uid", groupData[i]["groupUid"]);

        form1.getCache().getDocument("HaetutRyhmat-nomap").insertBefore(node);

    }
    if(hasEmptyChild == true) {
        form1.getCache().getDocument("HaetutRyhmat-nomap").removeChild(form1.getCache().getDocument("HaetutRyhmat-nomap").getFirstChild());
    }
    form1.getJSXByName("searchGroupMatrix").repaintData();

    if(entryFound == false) {
        alert("Valitettavasti antamallasi hakusanalla ei l\xF6ytynyt tuloksia");
    }
}

function listGroupUsers() {

    var node, i, hasEmptyChild, childIterator, childNode, selected, groupUid, personInfo, xmlData, list, userData, fetched;

    /*
     if(form1.getCache().getDocument("GroupUserList-nomap").getFirstChild() != null) {
     form1.getCache().getDocument("GroupUserList-nomap").removeChildren();
     form1.getJSXByName("listGroupUsersMatrix").repaintData();
     }
     */

    hasEmptyChild = formatDataCache("GroupUserList-nomap", "listGroupUsersMatrix");
    childIterator = form1.getCache().getDocument("HaetutRyhmat-nomap").getChildIterator();

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        selected = childNode.getAttribute("valittu");
        fetched = childNode.getAttribute("haettu");
        groupUid = childNode.getAttribute("uid");

        if(selected == 0 && fetched == 1) {
            childNode.setAttribute("haettu", 0);
            removefromCache(groupUid);
        }

        if((selected != 0) && (selected != null) && (fetched != 1)) {
            childNode.setAttribute("haettu", 1);
            groupName = childNode.getAttribute("nimi");
            xmlData = Arcusys.Internal.Communication.GetGroupUsers(groupUid);
            userData = getData(xmlData.selectNodeIterator("//user", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'"));

            for( i = 0; i < userData.length; i++) {
                node = form1.getCache().getDocument("GroupUserList-nomap").getFirstChild().cloneNode();
                node.setAttribute("jsxid", i);
                node.setAttribute("etunimi", userData[i]["firstname"]);
                node.setAttribute("sukunimi", userData[i]["lastname"]);
                node.setAttribute("puhelin", userData[i]["phoneNumber"]);
                node.setAttribute("sahkoposti", userData[i]["email"]);
                node.setAttribute("ryhmanimi", childNode.getAttribute("uid"));
                node.setAttribute("userUid", userData[i]["uid"]);
                node.setAttribute("valittuG", 1);
                form1.getCache().getDocument("GroupUserList-nomap").insertBefore(node);

            }
        }
    }
    if(hasEmptyChild == true) {
        form1.getCache().getDocument("GroupUserList-nomap").removeChild(form1.getCache().getDocument("GroupUserList-nomap").getFirstChild());
    }
    form1.getJSXByName("listGroupUsersMatrix").repaintData();
}

function removefromCache(removable) {
    var tempNode, i, ryhma, node, ryhma, vertaus, taulukko = [];
    i = 0;

    while(form1.getCache().getDocument("GroupUserList-nomap").getFirstChild() != null) {
        tempNode = form1.getCache().getDocument("GroupUserList-nomap").getFirstChild().cloneNode();
        ryhma = tempNode.getAttribute("ryhmanimi");

        if(ryhma != removable) {
            taulukko[i] = tempNode;
            i++;
        }
        form1.getCache().getDocument("GroupUserList-nomap").removeChild(form1.getCache().getDocument("GroupUserList-nomap").getFirstChild());
    }// while
    i = 0;
    // clearDataCache("GroupUserList-nomap", "listGroupUsersMatrix");
    while(taulukko[i] != null) {
        node = taulukko[i];
        form1.getCache().getDocument("GroupUserList-nomap").insertBefore(node);
        i++;
    }
    form1.getJSXByName("listGroupUsersMatrix").repaintData();
}

function searchNames(searchString) {
    var node, hasEmptyChild, entryFound, userData, i, xmlData, personInfo, list;
    entryFound = false;
    hasEmptyChild = false;

    if(searchString == "") {
        alert("Syota hakusana");
        return;
    }
    searchString = searchString.toLowerCase();
    if(form1.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild() != null) {
        form1.getCache().getDocument("HaetutVastaanottajat-nomap").removeChildren();
        form1.getJSXByName("searchMatrix").repaintData();

    }
    hasEmptyChild = formatDataCache("HaetutVastaanottajat-nomap", "searchMatrix");
    childData = Arcusys.Internal.Communication.GetChildrens(searchString);

    if(childData.selectSingleNode("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'") && childData.selectSingleNode("//parents", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'")) {
        entryFound = true;
    }

    if(entryFound) {

        clearDataCache("HaetutVastaanottajat-nomap", "searchMatrix");
        hasEmptyChild = formatDataCache("HaetutVastaanottajat-nomap", "searchMatrix");
        nodeIterator = childData.selectNodes("//child", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
        childArray = getDataString(nodeIterator);

        for( i = 0; i < childArray.length; i++) {
            if(childArray[i]["parents_uid"]) {
                node = form1.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild().cloneNode();
                node.setAttribute("jsxid", 0);
                node.setAttribute("etunimi", childArray[i]["firstname"]);
                node.setAttribute("sukunimi", childArray[i]["lastname"]);
                node.setAttribute("childUid", childArray[i]["uid"]);
                node.setAttribute("huoltajat", childArray[i]["parents_displayName"]);
                node.setAttribute("parentsUid", childArray[i]["parents_uid"]);
                form1.getCache().getDocument("HaetutVastaanottajat-nomap").insertBefore(node);
            }
        }

        form1.getCache().getDocument("HaetutVastaanottajat-nomap").insertBefore(node);

        form1.getJSXByName("searchMatrix").repaintData();

    } else {
        alert("Valitettavasti antamallasi hakusanalla ei l\u00F6ytynyt tuloksia");
    }

    if(hasEmptyChild == true) {
        form1.getCache().getDocument("HaetutVastaanottajat-nomap").removeChild(form1.getCache().getDocument("HaetutVastaanottajat-nomap").getFirstChild());
    }

}

function addRolesToRecipients() {
    var counter, node, i, hasEmptyChild, chosen, childIterator, uid, firstname, lastname, rolename, childNode;
    i = 0;
    counter = 0;
    childIterator = form1.getCache().getDocument("HaetutRoolit-nomap").getChildIterator();
    var roolit = "";
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();

        if(childNode.getAttribute("valittu") == 1) {
            node = form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

            if(childNode.getAttribute("rooli") == 0) {

                node.setAttribute("uid", childNode.getAttribute("uid"));
                node.setAttribute("receipient", childNode.getAttribute("etunimi") + " " + childNode.getAttribute("sukunimi"));
                node.setAttribute("role", 0);
                node.setAttribute("group", 0);
                node.setAttribute("realm", "Loora");

            } else {
                uid = childNode.getAttribute("uid");
                roolinimi = childNode.getAttribute("roolinimi");

                node.setAttribute("role", 1);
                node.setAttribute("group", 0);
                node.setAttribute("uid", uid);
                node.setAttribute("realm", "Loora");
                node.setAttribute("receipient", roolinimi);

            }
            counter++;
            form1.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
        }

    }

    if(hasEmptyChild == true) {
        form1.getCache().getDocument("receipientsToShow-nomap").removeChild(form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    form1.getJSXByName("dummyMatrix").repaintData();
    form1.getJSXByName("recipientCounter").setValue(counter);
}

function addToRecipients() {
    var counter, node, i, hasEmptyChild, chosen, childIterator, uid, firstname, lastname, childNode, kunpoUserName;
    counter = form1.getJSXByName("recipientCounter").getValue();
    i = 0;
    childIterator = form1.getCache().getDocument("HaetutVastaanottajat-nomap").getChildIterator();
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        uidlist = childNode.getAttribute("parentsUid");
        parents = childNode.getAttribute("huoltajat");
        uidlist = uidlist.split(',');
        parents = parents.split(',');

        for( i = 0; i < uidlist.length; i++) {
            node = form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();
            node.setAttribute("jsxid", counter);
            node.setAttribute("receipient", parents[i]);
            node.setAttribute("uid", uidlist[i]);
            node.setAttribute("group", 0);
            node.setAttribute("role", 0);
            node.setAttribute("realm", "Kunpo");
            form1.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
            counter++;

        }

    }
    if(hasEmptyChild == true) {
        form1.getCache().getDocument("receipientsToShow-nomap").removeChild(form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }
    form1.getJSXByName("dummyMatrix").repaintData();
    form1.getJSXByName("recipientCounter").setValue(counter);

}

function getChildsParents(userUid) {
    var parents = null;
    var childData = null;
    var nodes;

    // get childs
    if(userUid != "") {
        nodes = "<childUid>" + userUid + "</childUid>";
        // todo use convertarray
        childData = Arcusys.Internal.Communication.GetChildinfo(nodes);
    }

    // get parents
    if(childData != null) {
        parents = getData(childData.selectNodeIterator("//parents", "xmlns:ns2='http://soa.tiva.koku.arcucsys.fi/'"));
    }

    return parents;
}

// add users/parents instead
function addGroupsToRecipients() {

    var counter, node, hasEmptyChild, valittu, childIterator, groupUid, childNode, groupname, userUid, parentData;

    // read child nodes
    childIterator = form1.getCache().getDocument("GroupUserList-nomap").getChildIterator();
    // this has child uid

    counter = form1.getJSXByName("recipientCounter").getValue();
    hasEmptyChild = formatDataCache("receipientsToShow-nomap", "dummyMatrix");

    // get parent data by loopping trought childs
    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        valittu = childNode.getAttribute("valittuG");
        // valittuG might not exist, need to check
        //groupUid = childNode.getAttribute("uid");
        userUid = childNode.getAttribute("userUid");
        // might not exist
        // if child is selected, checkbox
        if((valittu != null) && (valittu != 0)) {
            parentData = getChildsParents(userUid);
            for( i = 0; i < parentData.length; i++) {// add parents to new rows
                if(parentData[i]["uid"]) {
                    node = form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild().cloneNode();

                    node.setAttribute("jsxid", counter);
                    node.setAttribute("uid", parentData[i]["uid"]);
                    node.setAttribute("receipient", parentData[i]["displayName"]);
                    node.setAttribute("realm", "Kunpo");
                    // in grp msg mode all recipients has kunpo realm
                    node.setAttribute("role", 0);
                    node.setAttribute("group", 0);

                    form1.getCache().getDocument("receipientsToShow-nomap").insertBefore(node);
                    counter++;
                }
            }
        }
    }
    if(hasEmptyChild == true) {
        form1.getCache().getDocument("receipientsToShow-nomap").removeChild(form1.getCache().getDocument("receipientsToShow-nomap").getFirstChild());
    }

    form1.getJSXByName("dummyMatrix").repaintData();
    form1.getJSXByName("recipientCounter").setValue(counter);

}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUsernamesInRole = function(uid) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUsernamesInRole><roleUid>" + uid + "</roleUid></soa:getUsernamesInRole></soapenv:Body></soapenv:Envelope>";

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
    arc.GetChildinfo = function(nodes) {
        var tout, msg, endpoint, url, req, objXML;
        tout = 1000;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getChildInfo>" + nodes + "</soa:getChildInfo></soapenv:Body></soapenv:Envelope>";

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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetEmbloyeeUsers = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelosdsadpe/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchEmployees><!--Optional:--><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchEmployees></soapenv:Body></soapenv:Envelope>";

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
            alert("Virhe palvelinyhteydess" + unescape("%E4") + " (GetUsers)");
        } else {
            return objXML;

        }

    };
});

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUsers = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchUsers><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchUsers></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
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
    arc.GetGroups = function(searchString) {
        var tout, msg, endpoint, url, req, objXML, limit;
        tout = 1000;
        limit = 100;
        msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:searchGroups><searchString>" + searchString + "</searchString><limit>" + limit + "</limit></soa:searchGroups></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
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

        var url = getUrl();
        endpoint = getEndpoint("UsersAndGroupsService");
        // endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
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

    var i, j, attributes, node, childNode, childs, retval;
    i = 0;
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
    retval = valuesToArray(attributes);
    if(checkArrayByGivenAttributes(retval, childlist))
        return retval;
    else
        alert("Haetulla kayttajalla on jarjestelmassa puuttuvia tietoja");
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

function checkArrayByGivenAttributes(arrayToCheck, attributeList) {
    var nodeCount, i, split;
    nodeCount = attributeList.length;

    for( i = 0; i < arrayToCheck.length; i++) {
        split = arrayToCheck[i].split(',');
        if(nodeCount != split.length) {

            return false;
        }

    }
    return true;
}

function removeQuotes(str) {
    str = str.replace(/['"]/g, '');

    return str;
}
