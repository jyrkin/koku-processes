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

/**
 * Functions that has to run before form starts.
 *
 */
function Preload() {
    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("/")+1));
    //alert(username);
    Valtakirja_Form.getJSXByName("Tiedot_LahettajaDisplay").setValue(username);
    if (gup("FormID")) {
        var id = gup("FormID");
        Valtakirja_Form.getJSXByName("Tiedot_ValtakirjaId").setValue(id);
       
        try {
           // alert("1. try");
            // Add form preload functions here.
            var userUid = Arcusys.Internal.Communication.GetUserUidByUsername(username);
            //Arcusys.Internal.Communication.GerLDAPUser();
           // alert(userUid);
            if(userUid != null) {
                Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(userUid.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
            }
        } catch (e) {
            alert(e);
        }
       
        try {
           // alert("2. try");
            // Add form preload functions here.
            var formData = Arcusys.Internal.Communication.GetFormData(id,userUid.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue());
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(formData != null) {
                mapFormDataToFields(formData);
            }
        } catch (e) {
            alert(e);
        }
        
        try {
            //alert("3. try");
            var receipientUid = Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").getValue();
            // Add form preload functions here.
            var receipientUsername = Arcusys.Internal.Communication.GetUsernameByUid(receipientUid);
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(receipientUsername != null) {
                Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").setValue(receipientUsername.selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
            }
        } catch (e) {
            alert(e);
        }
        
        try {
            //alert("3. try");
            var personUid = Valtakirja_Form.getJSXByName("Tiedot_Henkilo").getValue();
            // Add form preload functions here.
            var personUsername = Arcusys.Internal.Communication.GetUsernameByUid(personUid);
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(personUsername != null) {
                Valtakirja_Form.getJSXByName("Tiedot_Henkilo").setValue(personUsername.selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
            }
        } catch (e) {
            alert(e);
        }
    }
}

function mapFormDataToFields(formData) {
   // alert(formData);
    var validTill = formData.selectSingleNode("//validTill", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var receiverUid = formData.selectSingleNode("//receiverUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var senderUid = formData.selectSingleNode("//senderUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var templateId = formData.selectSingleNode("//templateId", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var templateName = formData.selectSingleNode("//templateName", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var templateDescription = formData.selectSingleNode("//description", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var targetPersonUid = formData.selectSingleNode("//targetPersonUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    
    
    Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(senderUid).repaint();
    Valtakirja_Form.getJSXByName("Tiedot_Voimassa").setValue(validTill).repaint();
    Valtakirja_Form.getJSXByName("Tiedot_Vastaanottaja").setValue(receiverUid).repaint();
   // Valtakirja_Form.getJSXByName("Tiedot_Lahettaja").setValue(senderUid).repaint();
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


//Package FormPreFill
jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetFormData= function(valtakirjaId,username) {
        
        var tout = 1000;   

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.tiva.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getValtakirja><valtakirjaId>" + valtakirjaId + "</valtakirjaId><kayttaja>" + username + "</kayttaja></soa:getValtakirja></soapenv:Body></soapenv:Envelope>";
        var endpoint="http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-tiva-model-0.1-SNAPSHOT/KokuValtakirjaProcessingServiceImpl";

        var url = getUrl();

        msg = "message=" + encodeURIComponent(msg)+ "&endpoint=" + encodeURIComponent(endpoint);

        var req = new jsx3.net.Request();

        req.open('POST', url, false);
    
        //req.setRequestHeader("Content-Type","text/xml");

        //req.setRequestHeader("SOAPAction","");
        
       req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
       req.send(msg, tout);
       var objXML = req.getResponseXML();
       // alert(req.getStatus());
        
       // var objXML = req.getResponseXML();
       //alert("DEBUG - SERVER RESPONSE:" + objXML);
        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }
    };
});


jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserUidByUsername= function(username) {
        
        var tout = 1000;   
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByKunpoName><kunpoUsername>" + username + "</kunpoUsername></soa:getUserUidByKunpoName></soapenv:Body></soapenv:Envelope>";
       
      
        var url = getUrl();
        
        var endpoint="http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        
        /*var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getAppointment><appointmentId>" + appointmentId + "</appointmentId></soa:getAppointment></soapenv:Body></soapenv:Envelope>";
        var endpoint = "http://gatein.intra.arcusys.fi:8080/arcusys-koku-0.1-SNAPSHOT-av-model-0.1-SNAPSHOT/KokuAppointmentProcessingServiceImpl";
        var url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";*/


        msg = "message=" + encodeURIComponent(msg)+ "&endpoint=" + encodeURIComponent(endpoint);

        var req = new jsx3.net.Request();

        req.open('POST', url, false);      
    
        //req.setRequestHeader("Content-Type","text/xml");

        //req.setRequestHeader("SOAPAction","");
        
       req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
       req.send(msg, tout);
       var objXML = req.getResponseXML();
       // alert(req.getStatus());
        
       // var objXML = req.getResponseXML();
       // alert("DEBUG - SERVER RESPONSE:" + objXML);
        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }
    };
});



jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUsernameByUid= function(uid) {
        
        var tout = 1000;   
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getKunpoNameByUserUid><userUid>" + uid + "</userUid></soa:getKunpoNameByUserUid></soapenv:Body></soapenv:Envelope>";
       
      
        var url = getUrl();
        
        var endpoint="http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT/UsersAndGroupsServiceImpl";
        
        /*var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getAppointment><appointmentId>" + appointmentId + "</appointmentId></soa:getAppointment></soapenv:Body></soapenv:Envelope>";
        var endpoint = "http://gatein.intra.arcusys.fi:8080/arcusys-koku-0.1-SNAPSHOT-av-model-0.1-SNAPSHOT/KokuAppointmentProcessingServiceImpl";
        var url = "http://intalio.intra.arcusys.fi:8080/gi/WsProxyServlet2";*/


        msg = "message=" + encodeURIComponent(msg)+ "&endpoint=" + encodeURIComponent(endpoint);

        var req = new jsx3.net.Request();

        req.open('POST', url, false);      
    
        //req.setRequestHeader("Content-Type","text/xml");

        //req.setRequestHeader("SOAPAction","");
        
       req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
       req.send(msg, tout);
       var objXML = req.getResponseXML();
       // alert(req.getStatus());
        
       // var objXML = req.getResponseXML();
       // alert("DEBUG - SERVER RESPONSE:" + objXML);
        if (objXML == null) {
            alert("Virhe palvelinyhteydessa");
        } else {
            return objXML;

        }
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