/* place JavaScript code here */
kokuServiceEndpoints = null;

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

 function formatDataCache(cache, matrix) {
    if (Valtakirja_Form.getCache().getDocument(cache).getFirstChild() == null) {
       commitCustomAutoRowSession(matrix, cache);
        return true;
    }
    else {
        return false;
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


function getPortNumber() {
    
    var url = window.location.href;
    
    var url_parts = url.split("/");
    
    var domain_name_parts = url_parts[2].split(":");
    
    var port_number = domain_name_parts[1];
    
    return port_number;

}



function hideButtonsAndImages() {
    $('span[label|="IntalioInternal_Image"]').remove();

}

function prepareDecision() {
   // alert("prepareDecision");
    Valtakirja_Form.getJSXByName("labelValtakirjaKuvaus").setText(Valtakirja_Form.getJSXByName("Valtakirjapohja_Kuvaus").getValue()).repaint();
    
    var valtakirjaId = Valtakirja_Form.getJSXByName("Tiedot_ValtakirjaId").getValue();
    var kayttaja = Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").getValue();
        try {

            // Add form preload functions here.
            var valtakirjaData = Arcusys.Internal.Communication.GetValtakirja(valtakirjaId, kayttaja);
            //Arcusys.Internal.Communication.GerLDAPUser();
          //  alert(valtakirjaData);
            if(valtakirjaData != null) {
                mapValtakirjaDataToFields(valtakirjaData);
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
    arc.GetValtakirja= function(valtakirjaId, kayttaja) {
        
        var SERVICE_NAME = "KokuValtakirjaProcessingService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getValtakirja><valtakirjaId>" + valtakirjaId + "</valtakirjaId><kayttaja>" + kayttaja + "</kayttaja></soa:getValtakirja></soapenv:Body></soapenv:Envelope>";

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


function mapValtakirjaDataToFields(valtakirjaData) {
    var validTillNode = valtakirjaData.selectSingleNode("//validTill", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");
    var recipientUid = valtakirjaData.selectSingleNode("//receiverUid", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'");

    if (recipientUid != null) {
        var recipientFullNameData = Arcusys.Internal.Communication.GetUserInfo(recipientUid.getValue());
        if (recipientFullNameData != null) {
            var recipientFullName = recipientFullNameData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue() + " " + recipientFullNameData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.tiva.koku.arcusys.fi/'").getValue();
            Valtakirja_Form.getJSXByName("Tiedot_VastaanottajaFullName").setValue(recipientFullName).repaint();
        }
    }

    if (validTillNode != null) {
         var validTill = validTillNode.getValue();

        var array = validTill.split("-");
        array[2] = array[2].charAt(0) + array[2].charAt(1);
    
        var d = new Date();
    
        d.setFullYear(parseInt(array[0]), parseInt(array[1]) - 1, parseInt(array[2]));
    
        Valtakirja_Form.getJSXByName("Tiedot_Voimassa").setValue(d);
    }    
}


function uncheckTheOthers(targetName, checkedName)   {
   var descendants = Valtakirja_Form.getJSXByName(targetName).getDescendantsOfType("jsx3.gui.CheckBox");
   for (x in descendants)   {
      if (descendants[x].getName() != checkedName)
         descendants[x].setChecked(0);
   }
}

function getTaskSubscribe() {
Intalio.Internal.Utilities.SERVER.subscribe(
Intalio.Internal.Utilities.GET_TASK_SUCCESS, prepareForm);
};


function prepareForm() {
   // alert("prepareForm");
   // var username = Intalio.Internal.Utilities.getUser();
    
    // form1.getJSXByName("User_Sender").setValue(Intalio.Internal.Utilities.getUser()).repaint();
    
    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\")+1));
    //alert(username);
    Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(username);
    
    
}


// USE: checkDateNotBefore(newDATE, getTodayDateFinnish());
function checkDateNotBefore(dateValue, dateNotBefore) {
   // alert(dateValue);

    //dateValue = dateValue.toString();
   // alert(dateValue.getDate() + " " + dateValue.getMonth() + " " + dateValue.getyear());
    
    var dayValue = dateValue.getDate();
    var monthValue = dateValue.getMonth()+1;
    var yearValue = dateValue.getFullYear();
   // var dayValue = dateValue.substring(0, 2);
   // var monthValue = dateValue.substring(3, 5);
   // var yearValue = dateValue.substring(6, 10);
  //  alert(dayValue + " " + monthValue + " " + yearValue);

    var dayNotBefore = dateNotBefore.substring(0, 2);
    var monthNotBefore = dateNotBefore.substring(3, 5);
    var yearNotBefore = dateNotBefore.substring(6, 10);
    //alert(dayNotBefore + " " + monthNotBefore + " " + yearNotBefore);    
    
    dateObjectValue = new Date(yearValue, monthValue-1, dayValue);
    dateObjectNotBefore = new Date(yearNotBefore, monthNotBefore-1, dayNotBefore);
    
   // alert(dateObjectValue.toString() + " " + dateObjectNotBefore.toString());
    
    if (dateObjectValue<dateObjectNotBefore)
      {
      alert("P" + unescape("%E4") + "iv" + unescape("%E4") + "m" + unescape("%E4%E4") + "r" + unescape("%E4") + " ei voi olla ennen t" + unescape("%E4") + "t" + unescape("%E4") + " p" + unescape("%E4") + "iv" + unescape("%E4%E4"));
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
