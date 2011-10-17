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


function prepareForm() {

    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("/")+1));
    //alert(username);
    
    if (gup("FormID")) {
        var id = gup("FormID");
        Vahvistuspyynto_Form.getJSXByName("Tiedot_RequestId").setValue(id);
       
        try {

            // Add form preload functions here.
            var formData = Arcusys.Internal.Communication.GetDaycareRequestById(id);
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(formData != null) {
                mapFormDataToFields(formData);
            }
        } catch (e) {
            alert(e);
        }
        
        try {

            var receipientUsername = Arcusys.Internal.Communication.GetUsernameByUid(Vahvistuspyynto_Form.getJSXByName("Tiedot_HakijaUid"));
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(receipientUsername != null) {
                Valtakirja_Form.getJSXByName("Tiedot_HakijaDisplay").setValue(receipientUsername.selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
            }
        } catch (e) {
            alert(e);
        }
        
        
    }
    
}


jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetDaycareRequestById= function(id) {
        
        var tout = 1000;   
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.hak.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getDaycareRequestById><request>" + id + "</request></soa:getDaycareRequestById></soapenv:Body></soapenv:Envelope>";
       
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

function mapFormDataToFields(formData) {
    // alert(formData);
    var creatorUid = formData.selectSingleNode("//creatorUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var daycareNeededFromDate = formData.selectSingleNode("//daycareNeededFromDate", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var formContent = formData.selectSingleNode("//formContent", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    // var requestId = formData.selectSingleNode("//requestId", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var targetPersonUid = formData.selectSingleNode("//targetPersonUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HakijaUid").setValue(creatorUid).repaint();
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HoidontarveAlkaa").setValue(creatorUid).repaint();
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HTML").setValue(creatorUid).repaint();
    // Vahvistuspyynto_Form.getJSXByName("Tiedot_RequestId").setValue(creatorUid).repaint();
    Vahvistuspyynto_Form.getJSXByName("Tiedot_Kohdehenkilo").setValue(creatorUid).repaint();
    
    
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HoidontarveAlkaa").setFormat("dd.MM.yyyy");
    // Vahvistuspyynto_Form.getJSXByName("Tiedot_HoidontarveAlkaa").repaint();
    
}