/* place JavaScript code here */

var kokuServiceEndpoints = null;

function Preload() {
    MessageId = gup("MessageId");
    IsLoora = (/[\\?&]loora/.exec(top.location.href) != null);
    KayttajaviestintaForm.getJSXByName("Message_MessageId").setValue(MessageId);
    messagecontent = Arcusys.Internal.Communication.GetMessageById(MessageId);

    getSender(messagecontent);
    getRecipient(messagecontent);
    getContent(messagecontent);
}

function intalioPreStart() {
    throughTextfields();
}

// Goes through textfields in order to check XSS-vulnerabilities.
function throughTextfields() {
    var temp, value, descendants = [];
    descendants = KayttajaviestintaForm.getJSXByName("root").getDescendantsOfType("jsx3.gui.TextBox");
    var i;
    for(i = 0; i < descendants.length; i++) {
        value = KayttajaviestintaForm.getJSXByName(descendants[i].getName()).getValue();
        temp = escapeHTML(value);
        KayttajaviestintaForm.getJSXByName(descendants[i].getName()).setValue(temp);
        KayttajaviestintaForm.getJSXByName(descendants[i].getName()).repaint();
    }
}

// Removes HTML-tags.
function escapeHTML(value) {
    if(value !== null && value !== undefined && isNaN(value) && value.replace()) {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
        return value;
    }
}

// Sender's fields
function getSender(content) {
    var username = Intalio.Internal.Utilities.getUser();
    username = username.substring((username.indexOf("\\") + 1));

    // Setting sender UID
    try {
        var result = null;

        if (IsLoora)
            result = Arcusys.Internal.Communication.GetLooraUserUidByUsername(username);
        else
            result = Arcusys.Internal.Communication.GetKunpoUserUidByUsername(username);

        if(result != null) {
            var uid = result.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
            KayttajaviestintaForm.getJSXByName("Message_FromUser").setValue(uid);
        } else {
            alert("Could not get uid");
            return;
        }
        
    } catch (e) {
        alert(e);
        return;
    }

    // Setting sender real name
    try {
        var senderInfo = Arcusys.Internal.Communication.GetUserInfo(uid);
        var nodeFirstName = senderInfo.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'");
        var nodeLastName = senderInfo.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'");
        
        if(nodeFirstName && nodeLastName) {
            wholename = nodeFirstName.getValue() + " " + nodeLastName.getValue();
            KayttajaviestintaForm.getJSXByName("Message_FromRealName").setValue(wholename);
        } else {
            alert("Could not get first and last names");
            return;
        }
    } catch (e) {
        alert(e);
        return;
    }
}


// Recipient's fields
function getRecipient(content) {
    var childiterator, recipient, senderRole;
    recipient = content.selectSingleNode("//senderUserInfo", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");
    if (content.selectSingleNode("//fromRoleUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'")) {
        senderRole = content.selectSingleNode("//fromRoleUid", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
        KayttajaviestintaForm.getJSXByName("Message_FromRole").setValue(senderRole);
    }
        
    nodeIterator = recipient.getFirstChild();
    quit = false;

    while(!quit){
        name = nodeIterator.getNodeName();
        if (name == "displayName"){
            KayttajaviestintaForm.getJSXByName("Message_ToRealName").setValue(nodeIterator.getValue());  
        }
    
        if (name == "uid"){                          
            KayttajaviestintaForm.getJSXByName("Message_ToUser").setValue(nodeIterator.getValue());
        }
        if (nodeIterator.getNextSibling() != null) {
            nodeIterator = nodeIterator.getNextSibling();
        } else {
            quit = true;
        }  

    } // while   

}

function getContent(content) {
var originalcontent, subject, temp;
    subject = "re: ";
    originalcontent = "\n\n\n--\n";
    
    temp = content.selectSingleNode("//subject", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");
    temp = temp.getValue();
    subject = subject + temp;
    temp = content.selectSingleNode("//originalContent", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");
    temp = temp.getValue();
    originalcontent = originalcontent + temp;
    
    KayttajaviestintaForm.getJSXByName("Message_Content").setValue(originalcontent); 
    KayttajaviestintaForm.getJSXByName("Message_Subject").setValue(subject); 
}



// used to parse fields
function gup(name) {
    var regexS, regex, results;

    name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
    regexS = "[\\?&]"+name+"=([^&#]*)";
    regex = new RegExp( regexS );
    results = regex.exec( top.location.href );
    
    
    if(results[1].match("%20"))
    {
        results[1] = results[1].replace("%20"," ");
    }
    if( results == null )
        return false;
    else
        return results[1];
}

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

function getEndpoint(serviceName) {
    if(kokuServiceEndpoints == null) {
        kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
    }
    return kokuServiceEndpoints.services[serviceName];
}

function handleSend(serviceName, soapMessage) {
    var xmlString = parent.KokuWS.handleSend(serviceName, soapMessage);
    var xmlDoc = new jsx3.xml.Document();
    return xmlDoc.loadXML(xmlString);
}

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetMessageById = function(uid) {
        var SERVICE_NAME = "KvMessageService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getMessageById><messageId>" + uid + "</messageId></soa:getMessageById></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
    
    arc.GetLooraUserUidByUsername = function(username) {
        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByLooraName><looraUsername>" + username + "</looraUsername></soa:getUserUidByLooraName></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
    
    arc.GetKunpoUserUidByUsername = function(username) {
        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserUidByKunpoName><kunpoUsername>" + username + "</kunpoUsername></soa:getUserUidByKunpoName></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };

    arc.GetUserInfo = function(uid) {
        var SERVICE_NAME = "UsersAndGroupsService";
        var SOAP_MESSAGE = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + uid + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";

        return handleSend(SERVICE_NAME, SOAP_MESSAGE);
    };
});
