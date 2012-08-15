/* place JavaScript code here */

function intalioPreStart() {
    
    Vahvistuspyynto_Form.getJSXByName("Tiedot_Sijainti").setValue(Vahvistuspyynto_Form.getJSXByName("Tiedot_Sijainti").getText()).repaint();
    throughTextfields();
    return null;
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
    descendants = Vahvistuspyynto_Form.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");
    
    for( i = 0; i < descendants.length; i++) {
        value = Vahvistuspyynto_Form.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        Vahvistuspyynto_Form.getJSXByName(descendants[i].getName()).setValue(temp);
        Vahvistuspyynto_Form.getJSXByName(descendants[i].getName()).repaint();
    }
}

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


function getPortNumber() {
    
    var url = window.location.href;
    
    var url_parts = url.split("/");
    
    var domain_name_parts = url_parts[2].split(":");
    
    var port_number = domain_name_parts[1];
    
    return port_number;

}


function prepareForm() {

    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\")+1));
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

            var receipientUsername = Arcusys.Internal.Communication.GetUsernameByUid(Vahvistuspyynto_Form.getJSXByName("Tiedot_HakijaUid").getValue());
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(receipientUsername != null) {
                Vahvistuspyynto_Form.getJSXByName("Tiedot_HakijaDisplay").setValue(receipientUsername.selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
            }
        } catch (e) {
            alert(e);
        }
        
        try {

            var targetUsername = Arcusys.Internal.Communication.GetUsernameByUid(Vahvistuspyynto_Form.getJSXByName("Tiedot_Kohdehenkilo").getValue());
            //Arcusys.Internal.Communication.GerLDAPUser();
            
            if(targetUsername != null) {
                Vahvistuspyynto_Form.getJSXByName("Tiedot_Kohdehenkilo").setValue(targetUsername.selectSingleNode("//kunpoUsername", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue()).repaint();
            }
        } catch (e) {
            alert(e);
        }
        
    }
    
}

function handleSend(serviceName, soapMessage) {
    var xmlString = parent.KokuWS.handleSend(serviceName, soapMessage);
    var xmlDoc = new jsx3.xml.Document();
    return xmlDoc.loadXML(xmlString);
}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetDaycareRequestById= function(id) {
        var SERVICE_NAME = "KokuHakProcessingService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.hak.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getDaycareRequestById><request>" + id + "</request></soa:getDaycareRequestById></soapenv:Body></soapenv:Envelope>";
       
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
    var creatorUid = formData.selectSingleNode("//creatorUid", "xmlns:ns2='http://soa.hak.koku.arcusys.fi/'").getValue();
    var daycareNeededFromDate = formData.selectSingleNode("//daycareNeededFromDate", "xmlns:ns2='http://soa.hak.koku.arcusys.fi/'").getValue();
    var formContent = formData.selectSingleNode("//formContent", "xmlns:ns2='http://soa.hak.koku.arcusys.fi/'").getValue();
    // var requestId = formData.selectSingleNode("//requestId", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
    var targetPersonUid = formData.selectSingleNode("//targetPersonUid", "xmlns:ns2='http://soa.hak.koku.arcusys.fi/'").getValue();
    
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HakijaUid").setValue(creatorUid).repaint();
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HoidontarveAlkaa").setValue(daycareNeededFromDate).repaint();
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HTML").setValue(formContent).repaint();
    // Vahvistuspyynto_Form.getJSXByName("Tiedot_RequestId").setValue(creatorUid).repaint();
    Vahvistuspyynto_Form.getJSXByName("Tiedot_Kohdehenkilo").setValue(targetPersonUid).repaint();
    
    
    Vahvistuspyynto_Form.getJSXByName("Tiedot_HoidontarveAlkaa").setFormat("dd.MM.yyyy");
    // Vahvistuspyynto_Form.getJSXByName("Tiedot_HoidontarveAlkaa").repaint();
    
}
