/* place JavaScript code here */

function Preload() {
MessageId = gup("MessageId");
// alert(MessageId);
messagecontent = Arcusys.Internal.Communication.GetMessageById(MessageId);
// (messagecontent);

getSender(messagecontent);
getRecipient(messagecontent);
getContent(messagecontent);
}

function getSender(content) {
/*
sender = content.selectSingleNode("//recipientUserInfos", "xmlns:ns2='http://soa.kv.koku.arcusys.f/'");
senderUid = sender.selectSingleNode("//uid", "xmlns:ns2='http://soa.kv.koku.arcusys.f/'").getValue();
firstname = sender.selectSingleNode("//firstname", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'").getValue();
lastname = sender.selectSingleNode("//lastname", "xmlns:ns2='http://soa.kv.koku.arcusys.f/'").getValue();
KayttajaviestintaForm.getJSXByName("Message_FromRealName").setValue(firstname + " " + lastname);
KayttajaviestintaForm.getJSXByName("Message_FromUser").setValue(senderUid);
*/
}

function getRecipient(content) {

var childnode, childiterator, recipient;
recipient = content.selectSingleNode("//senderUserInfo", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");
firstname = recipient.selectSingleNode("//firstname", "xmlns:ns2='http://soa.kv.koku.arcusys.fi/'");
nodeIterator = recipient.getFirstChild();
alert(recipient);
quit = false;

while(!quit){
    name = nodeIterator.getNodeName();
    if (name == "displayName"){
        KayttajaviestintaForm.getJSXByName("Message_ToRealName").setValue(nodeIterator.getValue());       
    }       
    alert(name);   
    if (name == "uid"){ 
        // TODO: change this field; now used for uid since it wasn't in use.                           
        // KayttajaviestintaForm.getJSXByName("Message_ToFirstName").setValue(nodeIterator.getValue());
        alert(tt);
    }
    if(nodeIterator.getNextSibling() != null)
        nodeIterator = nodeIterator.getNextSibling();
    else quit = true;       
}    

/*
alert(recipient);
senderUid = recipient.selectSingleNode("//uid", "xmlns:ns2='http://soa.kv.koku.arcusys.f/'").getValue();
alert(senderUid);
KayttajaviestintaForm.getJSXByName("Message_FromUser").setValue(senderUid);
firstname = recipient.selectSingleNode("//firstname", "xmlns:ns2='http://soa.kv.koku.arcusys.f/'").getValue();
alert(firstname);
lastname = recipient.selectSingleNode("//lastname", "xmlns:ns2='http://soa.kv.koku.arcusys.f/'").getValue();
alert(lastname);
KayttajaviestintaForm.getJSXByName("Message_ToRealName").setValue(firstname + " " + lastname);
*/
}

function getContent(content) {

}



// used to parse fields
function gup(name) {
    var regexS, regex, results;

    name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
    regexS = "[\\?&]"+name+"=([^&#]*)";
    regex = new RegExp( regexS );
    results = regex.exec( top.location.href );
    
    // alert(document.URL);
    // alert(results);
    
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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetMessageById = function(uid) {

        var tout = 1000;
        var limit = 100;
        var searchString = "";

        // var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + uid + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";
        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.kv.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getMessageById><messageId>" + uid + "</messageId></soa:getMessageById></soapenv:Body></soapenv:Envelope>";

        var url = getUrl();
        
        // TODO: automaattinen endpointin haku.
        endpoint = "http://localhost:8180/arcusys-koku-0.1-SNAPSHOT-kv-model-0.1-SNAPSHOT/KokuMessageServiceImpl";
        // var endpoint = getEndpoint() + "/arcusys-koku-0.1-SNAPSHOT-kv-model-0.1-SNAPSHOT/KokuMessageServiceImpl";

        msg = "message=" + encodeURIComponent(msg) + "&endpoint=" + encodeURIComponent(endpoint);
        // msg = "message=%3Csoapenv%3AEnvelope%20xmlns%3Asoapenv%3D%22http%3A%2F%2Fschemas.xmlsoap.org%2Fsoap%2Fenvelope%2F%22%20xmlns%3Asoa%3D%22http%3A%2F%2Fsoa.common.koku.arcusys.fi%2F%22%3E%3Csoapenv%3AHeader%2F%3E%3Csoapenv%3ABody%3E%3Csoa%3AsearchChildren%3E%3CsearchString%3E444444-4444%3C%2FsearchString%3E%3Climit%3E100%3C%2Flimit%3E%3C%2Fsoa%3AsearchChildren%3E%3C%2Fsoapenv%3ABody%3E%3C%2Fsoapenv%3AEnvelope%3E&endpoint=http%3A%2F%2Flocalhost%3A8180%2Farcusys-koku-0.1-SNAPSHOT-arcusys-common-0.1-SNAPSHOT%2FUsersAndGroupsServiceImpl"

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



