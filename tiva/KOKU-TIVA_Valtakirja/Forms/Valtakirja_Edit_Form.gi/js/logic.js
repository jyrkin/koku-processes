/* place JavaScript code here */
kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
        if (kokuServiceEndpoints == null) {
                kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
        }
        
        return kokuServiceEndpoints.services[serviceName];
}


//Getting the domain name and port if available
function getUrl() {
    
    var domain = getDomainName();
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

function getDomainName() {

    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];
       
    return domain_name;

}

function intalioPreStart() {
throughTextfields();
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
    descendants = Valtakirja_Form.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");
    
    for( i = 0; i < descendants.length; i++) {
        value = Valtakirja_Form.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        Valtakirja_Form.getJSXByName(descendants[i].getName()).setValue(temp);
        Valtakirja_Form.getJSXByName(descendants[i].getName()).repaint();
    }
}


function getPortNumber() {
    
    var url = window.location.href;
    
    var url_parts = url.split("/");
    
    var domain_name_parts = url_parts[2].split(":");
    
    var port_number = domain_name_parts[1];
    
    return port_number;

}

/**
 * Functions that has to run before form starts.
 *
 */
function Preload() {
    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\")+1));
    //alert(username);
    Valtakirja_Form.getJSXByName("Tiedot_LahettajaDisplay").setValue(username);
    if (gup("FormID")) {
        var id = gup("FormID");
        Valtakirja_Form.getJSXByName("Tiedot_ValtakirjaId").setValue(id);
       
        try {
            var userUidData = Arcusys.Internal.Communication.GetUserUidByUsername(username);
            if (userUidData != null) {
                userUid = userUidData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue();
                var userInfo = Arcusys.Internal.Communication.GetUserInfo(userUid);
                if (userInfo != null) {
                    var userFullName = userInfo.selectSingleNode("//firstname", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue() + " " + userInfo.selectSingleNode("//lastname", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue();
                    Valtakirja_Form.getJSXByName("Tiedot_LahettajaDisplay").setValue(userFullName).repaint();
                }
            }
        } catch (e) {
            alert(e);
        }
       
        try {
            var formData = Arcusys.Internal.Communication.GetFormData(id, userUid);
            
            if(formData != null) {
                mapFormDataToFields(formData);
            }
        } catch (e) {
            alert(e);
        }
        
        try {
            var receipientUid = Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").getValue();
            var recipientUserInfo = Arcusys.Internal.Communication.GetUserInfo(receipientUid);
            if (recipientUserInfo != null) {
                var recipientFullName = recipientUserInfo.selectSingleNode("//firstname", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue() + " " + recipientUserInfo.selectSingleNode("//lastname", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue();
                Valtakirja_Form.getJSXByName("Tiedot_VastaanottajaDisplay").setValue(recipientFullName).repaint();
            }
        } catch (e) {
            alert(e);
        }
        
        try {
            var personUid = Valtakirja_Form.getJSXByName("Tiedot_Henkilo").getValue();
            var personUserInfo = Arcusys.Internal.Communication.GetUserInfo(personUid);
            if (personUserInfo != null) {
                var personFullName = personUserInfo.selectSingleNode("//firstname", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue() + " " + personUserInfo.selectSingleNode("//lastname", "xmlns:ns2='http://soa.common.koku.arcusys.fi'").getValue();
                Valtakirja_Form.getJSXByName("Tiedot_HenkiloDisplay").setValue(personFullName).repaint();
            }
        } catch (e) {
            alert(e);
        }
    }
}

function commitCustomAutoRowSession(matrix, cache) {
    var nodes, xmlStr;

    nodes = Valtakirja_Form.getJSXByName(matrix).getChildren();
    xmlStr = "<data jsxid=\"jsxroot\"><record jsxid=\"\"";

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && nodes[i].getPath() != "jsxid") {
            xmlStr += " " + nodes[i].getPath() + "=\"\"";
        }
    }
    xmlStr += "/></data>";
    Valtakirja_Form.getCache().getDocument(cache).loadXML(xmlStr);
}

function formatDataCache(cache, matrix) {
    if (Valtakirja_Form.getCache().getDocument(cache).getFirstChild() == null) {
       commitCustomAutoRowSession(matrix, cache);
        return true;
    }
    else {
        return false;
    }
}


function mapFormDataToFields(formData) {
    if (formData.selectSingleNode("//validTill", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'")) {
        var validTill = formData.selectSingleNode("//validTill", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    }
    var receiverUid = formData.selectSingleNode("//receiverUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var senderUid = formData.selectSingleNode("//senderUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var templateId = formData.selectSingleNode("//templateId", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var templateName = formData.selectSingleNode("//templateName", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var templateDescription = formData.selectSingleNode("//description", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var targetPersonUid = formData.selectSingleNode("//targetPersonUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    
    
    Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(senderUid).repaint();
    if (validTill) {
        Valtakirja_Form.getJSXByName("Tiedot_Voimassa").setValue(validTill).repaint();
    }
    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").setValue(receiverUid).repaint();
    //Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(senderUid).repaint();
    Valtakirja_Form.getJSXByName("labelValtakirjaKuvaus").setText(templateDescription).repaint();
    Valtakirja_Form.getJSXByName("Tiedot_Henkilo").setValue(targetPersonUid).repaint();
    
    Valtakirja_Form.getJSXByName("Tiedot_Voimassa").setFormat("dd.MM.yyyy");
    Valtakirja_Form.getJSXByName("Tiedot_Voimassa").repaint();

}

/**
 * Gets a parameter from form url.
 */
function gup(name) {
   name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
   var regexS = "[\\?&]"+name+"=([^&#]*)";
   var regex = new RegExp( regexS );
   var results = regex.exec(window.location.href);
   if( results == null )
      return false;
   else
      return results[1];
}

function handleSend(serviceName, soapMessage) {
    var xmlString = parent.KokuWS.handleSend(serviceName, soapMessage);
    var xmlDoc = new jsx3.xml.Document();
    return xmlDoc.loadXML(xmlString);
}

//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetFormData= function(valtakirjaId,username) {

        var SERVICE_NAME = "KokuValtakirjaProcessingService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getValtakirja><valtakirjaId>" + valtakirjaId + "</valtakirjaId><kayttaja>" + username + "</kayttaja></soa:getValtakirja></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});


jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserUidByUsername= function(username) {
        
        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByKunpoName><kunpoUsername>" + username + "</kunpoUsername></soa:getUserUidByKunpoName></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});



jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUsernameByUid= function(uid) {

        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getKunpoNameByUserUid><userUid>" + uid + "</userUid></soa:getKunpoNameByUserUid></soapenv:Body></soapenv:Envelope>";

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



function getTaskSubscribe() {
Intalio.Internal.Utilities.SERVER.subscribe(
Intalio.Internal.Utilities.GET_TASK_SUCCESS, prepareForm);
};

/*
function prepareForm() {
   // alert("prepareForm");
   // var username = Intalio.Internal.Utilities.getUser();
    
    // form1.getJSXByName("User_Sender").setValue(Intalio.Internal.Utilities.getUser()).repaint();
    
    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("/")+1));
    //alert(username);
    Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(username).repaint();
    
    
}
*/

function changeMandateTemplate() {
    var templateID = Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getValue();
    var templateName = Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getText();
    var templateDesc = Valtakirja_Form.getJSXByName("Valtakirjapohja_Valinta").getXML().getFirstChild().selectSingleNode("//record[@jsxid='" + templateID + "']").getAttribute("jsxdesc");
    
    // alert(templateID + " " + templateName + " " + templateDesc);
    
    Valtakirja_Form.getJSXByName("labelValtakirjaKuvaus").setText(templateDesc).repaint();
    
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Id").setValue(templateID);
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Nimi").setValue(templateName);
    Valtakirja_Form.getJSXByName("Valtakirjapohja_Kuvaus").setValue(templateDesc);
}


function checkDate(dateValue) {
    var notBefore = checkDateNotBefore(dateValue, getTodayDateFinnish());
    if (notBefore==false) {
            var wantsToReplace = confirm("Olet asettanut valtakirjan p\xE4\xE4ttymisp\xE4iv\xE4ksi menneisyydess\xE4 olevan p\xE4iv\xE4m\xE4\xE4r\xE4n. Haluatko korjata p\xE4iv\xE4m\xE4\xE4r\xE4n (korjaa) vai mit\xE4t\xF6id\xE4 valtakirjan (mit\xE4t\xF6i)");
        
    }

}

// USE: checkDateNotBefore(newDATE, getTodayDateFinnish());
function checkDateNotBefore(dateValue, dateNotBefore) {
    
    var dayValue = dateValue.getDate();
    var monthValue = dateValue.getMonth()+1;
    var yearValue = dateValue.getFullYear();

    var dayNotBefore = dateNotBefore.substring(0, 2);
    var monthNotBefore = dateNotBefore.substring(3, 5);
    var yearNotBefore = dateNotBefore.substring(6, 10);
    
    dateObjectValue = new Date(yearValue, monthValue-1, dayValue);
    dateObjectNotBefore = new Date(yearNotBefore, monthNotBefore-1, dayNotBefore);
    
    if (dateObjectValue<dateObjectNotBefore) {
        return false;
    }
    
    return true;
}


function getTodayDateFinnish(){
                rawDate = new Date()    // Create a Date Object set to the last modified date
                year = rawDate.getFullYear()   // Get full year (as opposed to last two digits only)
                month = rawDate.getMonth() + 1  // Get month and correct it (getMonth() returns 0 to 11)
                day = rawDate.getDate()   // Get date within month
                if ( year < 1970 ) year = year + 100;     // millennium bug
                yearString = new String(year)     // Convert year, month and date to strings
                monthString = new String(month)      
                dayString = new String(day)      
                if ( monthString.length == 1 ) monthString = "0" + monthString;    // Add leading zeros to month and date if required
                if ( dayString.length == 1 ) dayString = "0" + dayString;     
                dateString = dayString + "." + monthString + "." + yearString;  
                return dateString;
}
