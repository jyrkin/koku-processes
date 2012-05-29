function testAlert() {
    // alert("test");
    createFields();
    form1.getJSXByName("formHeaderLabel").setText(form1.getJSXByName("Header_Text").getValue()).repaint();
    showForm("Y");
    addAdditionalInfoField();
    preload();
}

kokuServiceEndpoints = null;

function getEndpoint(serviceName) {
    if(kokuServiceEndpoints == null) {
        kokuServiceEndpoints = this.parent.getKokuServicesEndpoints();
    }

    return kokuServiceEndpoints.services[serviceName];
}

//Getting the domain name and port if available
function getUrl() {

    var domain = getDomainName();
    //domain = "http://62.61.65.15:8380";
    return domain + "/palvelut-portlet/ajaxforms/WsProxyServlet2";

}

function getDomainName() {

    var url = window.location.href;
    var url_parts = url.split("/");
    var domain_name = url_parts[0] + "//" + url_parts[2];

    return domain_name;

}

function preload() {

    var username = Intalio.Internal.Utilities.getUser();
    var recipientfirstname, recipientlastname, senderfirstname, senderlastname;
    username = username.substring(username.indexOf("\\") + 1);

    var recipientDisplayName = "";
    var rolereceiver, recipientData;

    if(form1.getJSXByName("User_Roolit").getValue() == "true") {
        var uidData = Arcusys.Internal.Communication.GetUserUidByLooraname(username);
        var uid = uidData.selectSingleNode("//userUid", "xmlns:ns2='http://soa.common.koku.arcusys.fi/'").getValue();
        form1.getJSXByName("User_Recipient").setValue(uid);
    } else {
        var uid = form1.getJSXByName("User_Recipient").getValue();
        recipientData = Arcusys.Internal.Communication.GetUserInfo(uid);
    }
    recipientData = Arcusys.Internal.Communication.GetUserInfo(uid);
    recipientDisplayName = recipientDisplayName + recipientData.selectSingleNode("//firstname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    recipientDisplayName = recipientDisplayName + " " + recipientData.selectSingleNode("//lastname", "xmlns:ns2='http://soa.av.koku.arcusys.fi/'").getValue();
    // Changedate: 14.3.12
    // Inserts correct name, instead of the userid, for the recipient. Note: original process did not have first- or lastname fields, needs
    // to be corrected and cleaned up during possible process refactoring.

    /*
     if (form1.getJSXByName("User_RecipientFirstname").getValue() != " ") {
     recipientfirstname = form1.getJSXByName("User_RecipientFirstname").getValue();
     recipientlastname = form1.getJSXByName("User_RecipientLastname").getValue();
     form1.getJSXByName("RecipientName").setValue(recipientfirstname + " " + recipientlastname);
     // If no name is found, the recipient is likely to be a role and the list of users fetched earlier is used.
     } else { form1.getJSXByName("RecipientName").setValue(recipientDisplayName);}     */

    form1.getJSXByName("RecipientName").setValue(recipientDisplayName);

    // Changedate: 15.3.12
    // Added the above for sender as well.
    if(form1.getJSXByName("User_SenderFirstname").getValue() != null) {
        senderfirstname = form1.getJSXByName("User_SenderFirstname").getValue();
        senderlastname = form1.getJSXByName("User_SenderLastname").getValue();
        form1.getJSXByName("SenderName").setValue(senderfirstname + " " + senderlastname);
    }

}

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

jsx3.lang.Package.definePackage("Arcusys.Internal.Communication", function(arc) {
    arc.GetUserInfo = function(uid) {

        var tout = 1000;
        var limit = 100;
        var searchString = "";

        var msg = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soa=\"http://soa.common.koku.arcusys.fi/\"><soapenv:Header/><soapenv:Body><soa:getUserInfo><userUid>" + uid + "</userUid></soa:getUserInfo></soapenv:Body></soapenv:Envelope>";

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

function addAdditionalInfoField() {
    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 195).repaint();
    var textSection = form1.getJSXByName("block").load("components/addinfoinputsection.xml", true);
    textSection.setDisplay("block").repaint();
}

function resetChoiceSection() {
    form1.getJSXByName("rootpane").setHeight(120, 1);
    // form1.getJSXByName("Block").setHeight(30,1);
    form1.getJSXByName("checkID").setValue(0);
    form1.getJSXByName("choiceLabelID").setValue(0);
}

// FOR MULTIPLE CHOICE: uncheckTheOthers(this.getParent().getParent().getParent().getParent().getParent().getName(), this.getName());
function uncheckTheOthers(target, checked) {
    //alert(target + " " + checked);
    var i, descendants = form1.getJSXByName(target).getDescendantsOfType("jsx3.gui.CheckBox");
    //alert(descendants);
    for( i = 0; i < descendants.length; i++) {
        //alert(descendants[i]);
        if(descendants[i].getName() != checked) {
            //alert(descendants[i]);
            descendants[i].setChecked(0);
        }
    }
}

function showForm(flag) {
    //  alert("showForm param: " + flag);
    var descendant, descendants;
    if(flag == "N") {
        // alert("N");
        // if (form1.getJSXByName("Kentat").getDisplay()=="none")
        // form1.getJSXByName("showFormButton").setText("N\xE4yt\xE4 lomake").repaint();
        // form1.getJSXByName("Kentat").setDisplay("block").repaint();
        // form1.getJSXByName("Header").setDisplay("block").repaint();

        var childNode;
        var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();
        var fieldsetNumber;
        var descendant, descendants, x;

        while(childIterator.hasNext()) {
            childNode = childIterator.next();
            fieldsetNumber = childNode.getAttribute("TextInput_Number");
            // alert(fieldsetNumber);
            //alert(fieldsetNumber);
            if(fieldsetNumber != "") {
                //alert(form1.getJSXByName(fieldsetNumber).getChild("pane").getChild("layout (--)").getLastChild().getChild("layout ( | )").getChild("pane").getChild("button").getDisplay());
                if(childNode.getAttribute("TextInput_Type") == "MULTIPLE_CHOICE" || childNode.getAttribute("TextInput_Type") == "CALENDAR") {
                    // alert("MULTIPLE_CHOICE");
                    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 80).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() + 80).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneOption", true, false);
                    // alert(descendant);
                    // descendant.setHeight(descendant.getHeight() + 25).repaint();
                    //  descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("rootpane",true,false);
                    //  alert(descendant);
                    descendant.setHeight(descendant.getHeight() + 40).repaint();
                    //alert(descendant.getHeight());
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneAddChoice", true, false);
                    // alert(descendant);
                    descendant.setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("deleteButton", true, false);
                    // alert(descendant);
                    descendant.setDisplay("none").repaint();
                    descendants = form1.getJSXByName("choiceBlock" + fieldsetNumber).getDescendantsOfType("jsx3.gui.Button")
                    for( x = 0; x < descendants.length; x = x + 1) {
                        // alert(descendants[x]);
                        descendants[x].setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                    }
                } else {
                    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 23).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() + 23).repaint();
                    form1.getJSXByName(fieldsetNumber).getChild("layout (--)").getLastChild().getChild("layout ( | )").getChild("pane").getChild("button").setDisplay(jsx3.gui.Block.DISPLAYBLOCK).repaint();
                }
            }
            descendant = "";
            descendants = "";

        }
        //  form1.getJSXByName("showFormFlag").setValue("Y").repaint();
    } else {
        //  form1.getJSXByName("showFormButton").setText("N\xE4yt\xE4 muokkausn\xE4kym\xE4").repaint();
        // form1.getJSXByName("Kentat").setDisplay("none").repaint();
        // form1.getJSXByName("Header").setDisplay("none").repaint();

        var childNode;
        var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();
        var fieldsetNumber;

        while(childIterator.hasNext()) {
            childNode = childIterator.next();
            fieldsetNumber = childNode.getAttribute("TextInput_Number");
            // alert(fieldsetNumber);
            if(fieldsetNumber != "") {
                if(childNode.getAttribute("TextInput_Type") == "MULTIPLE_CHOICE" || childNode.getAttribute("TextInput_Type") == "CALENDAR") {
                    // alert("MULTIPLE_CHOICE");
                    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 80).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() - 80).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneOption", true, false);
                    // alert(descendant);
                    //descendant.setHeight(descendant.getHeight() - 25).repaint();
                    // descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("rootpane",true,false);
                    // alert(descendant);
                    descendant.setHeight(descendant.getHeight() - 40).repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("paneAddChoice", true, false);
                    // alert(descendant);
                    descendant.setDisplay("none").repaint();
                    descendant = form1.getJSXByName(fieldsetNumber).getDescendantOfName("deleteButton", true, false);
                    // alert(descendant);
                    descendant.setDisplay("none").repaint();
                    descendants = form1.getJSXByName("choiceBlock" + fieldsetNumber).getDescendantsOfType("jsx3.gui.Button");
                    for( x = 0; x < descendants.length; x = x + 1) {
                        descendants[x].setDisplay("none", true);
                    }
                } else {
                    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() - 23).repaint();
                    form1.getJSXByName(fieldsetNumber).setHeight(form1.getJSXByName(fieldsetNumber).getHeight() - 23).repaint();
                    form1.getJSXByName(fieldsetNumber).getChild("layout (--)").getLastChild().getChild("layout ( | )").getChild("pane").getChild("deleteButton").setDisplay("none").repaint();
                }
            }
            descendant = "";
            descendants = "";
        }
        // form1.getJSXByName("showFormFlag").setValue("N").repaint();
    }
}

function createFields() {
    //alert(form1.getCache());
    var childNode, childId, question, section;
    var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();
    var fieldsetNumber, type;

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        //alert(childNode);
        //childId = childNode.getAttribute("jsxid");
        // alert(childId);

        question = childNode.getAttribute("TextInput_Question");
        // alert(question);

        section = childNode.getAttribute("TextInput_Section");
        fieldsetNumber = childNode.getAttribute("TextInput_Number");
        type = childNode.getAttribute("TextInput_Type");
        //if (question!="" && section!="") {
        inputSection(section, question, fieldsetNumber, type);
        //fieldsetNumber = fieldsetNumber + 1;
        //}

    }
    //form1.getJSXByName("fieldsetCounter").setValue(fieldsetNumber);
}

function createMultipleChoiceQuestions(sectionNumber) {

    var childNode, childId, question, section;
    var childIterator = form1.getCache().getDocument("MultipleChoice-nomap").getChildIterator();
    var fieldsetNumber, type;

    while(childIterator.hasNext()) {
        childNode = childIterator.next();

        if(childNode.getAttribute("MultipleChoice_Section") == sectionNumber) {
            question = childNode.getAttribute("MultipleChoice_Question");
            // alert(question);

            section = childNode.getAttribute("MultipleChoice_Section");
            fieldsetNumber = childNode.getAttribute("MultipleChoice_Number");
            //if (question!="" && section!="") {
            inputMultipleChoiceQuestion(section, question, fieldsetNumber);

        }

    }

}

function inputMultipleChoiceQuestion(tempID, question, questionNumber) {
    //alert("addChoice, parameter: " + tempID);
    // var id = getID();
    // alert("id: " + id);
    var block = "choiceBlock" + tempID;
    var choiceTextField = "choiceTextField" + tempID;
    var id = tempID + "_" + questionNumber;

    var section = form1.getJSXByName(block).load("components/choicesection.xml", true);

    form1.getJSXByName(block).setHeight(form1.getJSXByName(block).getHeight() + 30, true).repaint();
    form1.getJSXByName(block).getParent().setHeight(form1.getJSXByName(block).getParent().getHeight() + 30);
    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 30).repaint();

    var choice = section.getFirstChild().getFirstChild().getFirstChild();
    var label = section.getFirstChild().getFirstChild().getNextSibling().getFirstChild();
    var idField = section.getLastChild();

    choice.setName(choice.getName() + id);
    label.setName(label.getName() + id);
    section.setName(section.getName() + id);
    label.setText(question, true);

    idField.setValue(id);

    form1.getJSXByName("choicePane" + id).getChild("choiceUniversalID").setValue(form1.getJSXByName("multipleChoiceCounter").getValue());

    // mapMultipleChoiceToMatrix(form1.getJSXByName("multipleChoiceCounter").getValue(),tempID,form1.getJSXByName(choiceTextField).getValue(),form1.getJSXByName(tempID).getChild("choiceCounter").getValue());
    form1.getJSXByName("multipleChoiceCounter").setValue(parseInt(form1.getJSXByName("multipleChoiceCounter").getValue()) + 1);
    form1.getJSXByName(tempID).getChild("choiceCounter").setValue(parseInt(form1.getJSXByName(tempID).getChild("choiceCounter").getValue()) + 1);
}

function intalioPreComplete() {
    // alert("PreComplete");
    mapAnswerTextFields();

}

function mapAnswerTextFields() {
    //alert(form1.getCache());
    var childNode, childId, question, section, answerText;
    var childIterator = form1.getCache().getDocument("TextInput-nomap").getChildIterator();
    var elementNumber, type;

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        //alert(childNode);
        //childId = childNode.getAttribute("jsxid");
        // alert(childId);
        elementNumber = childNode.getAttribute("TextInput_Number");
        // alert(elementNumber);
        type = childNode.getAttribute("TextInput_Type");
        // alert(type);
        // question = childNode.getAttribute("TextInput_Question");
        // alert(question);

        // section = childNode.getAttribute("TextInput_Answer");

        // if (question!="" && section!="") {
        if(type == "FREE_TEXT" || type == "NUMBER") {
            answerText = form1.getJSXByName("textbox" + elementNumber).getValue();
        }
        if(type == "YES_NO") {
            if(form1.getJSXByName("yes" + elementNumber).getChecked()) {
                answerText = "true";
            }
            if(form1.getJSXByName("no" + elementNumber).getChecked()) {
                answerText = "false";
            }
        }
        if(type == "MULTIPLE_CHOICE" || type == "CALENDAR") {
            // alert("MULTIPLE_CHOICE");
            // NOTE:
            // SOLUTION APPLICAPLE FOR SELECTIONS OF MULTIPLE CHECKBOXES
            // IF ONLY ONE CHOSEN: BETTER TO RETURN ANSWER AND MAP IT TO answerText
            answerText = mapAnswerMultipleChoiceFields(elementNumber);
        }

        //  alert(answerText);
        childNode.setAttribute("TextInput_AnswerText", answerText);
        answerText = "";

        // elementNumber = elementNumber + 1;
        // }
    }
}

function mapAnswerMultipleChoiceFields(sectionNumber) {

    var childNode, childId, question, section, answerText;
    var childIterator = form1.getCache().getDocument("MultipleChoice-nomap").getChildIterator();
    var elementNumber, type;
    var value = "";

    while(childIterator.hasNext()) {
        childNode = childIterator.next();
        // alert(childNode.getAttribute("MultipleChoice_Section") + " " + sectionNumber);
        if(childNode.getAttribute("MultipleChoice_Section") == sectionNumber) {
            // alert(form1.getJSXByName("choicePane" + sectionNumber + "_" + childNode.getAttribute("MultipleChoice_Number")));
            // alert(form1.getJSXByName("choicePane" + sectionNumber + "_" + childNode.getAttribute("MultipleChoice_Number")).getFirstChild().getFirstChild().getFirstChild().getChecked());
            if(form1.getJSXByName("choicePane" + sectionNumber + "_" + childNode.getAttribute("MultipleChoice_Number")).getFirstChild().getFirstChild().getFirstChild().getChecked()) {
                childNode.setAttribute("MultipleChoice_Checked", "true");
                if(value == "") {
                    value = childNode.getAttribute("MultipleChoice_Question");
                } else {
                    value = value + ", " + childNode.getAttribute("MultipleChoice_Question");
                }
            } else {
                childNode.setAttribute("MultipleChoice_Checked", "false");
            }
        }
    }
    return value;

}

function mapFieldsToMatrix(title, question) {
    var node;
    node = form1.getCache().getDocument("TextInput-nomap").getFirstChild().cloneNode();
    // alert(node);
    node.setAttribute("TextInput_Question", question);
    node.setAttribute("TextInput_Answer", title);
    form1.getCache().getDocument("TextInput-nomap").insertBefore(node);
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
        input = "vapaaTeksti";
    }
    if(form1.getJSXByName("vastausKyllaEi").getChecked()) {
        input = "kyllaEi";
    }
    if(form1.getJSXByName("vastausVapaatVaihtoehdot").getChecked()) {
        input = "vapaatVaihtoehdot";
    }
    return input;
}

function inputSection(title, question, fieldsetNumber, type) {
    if(type == "FREE_TEXT") {
        // alert("FREE_TEXT");
        inputTextSection(title, question, fieldsetNumber);
    }
    if(type == "YES_NO") {
        // alert("YES_NO");
        inputYesNoSection(title, question, fieldsetNumber);
    }
    if(type == "MULTIPLE_CHOICE" || type == "CALENDAR") {

        inputMultipleChoiceSection(title, question, fieldsetNumber);
    }
    if(type == "NUMBER") {
        inputNumberSection(title, question, fieldsetNumber);
    }
}

function inputTextSection(title, question, fieldsetNumber) {
    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 205).repaint();
    var textSection = form1.getJSXByName("block").load("components/textinputsection.xml", true);
    textSection.setDisplay("block").repaint();
    //  textSection.setTitleText(title).repaint();
    textSection.setName(fieldsetNumber);
    form1.getJSXByName("textbox").setName("textbox" + fieldsetNumber);
    form1.getJSXByName("button").setDisplay("none").repaint();
    //alert(textSection.getChild());
    //alert(textSection.getJSXByName("labelKysymys").getText());
    form1.getJSXByName("labelKysymys").setText(question).repaint();
    //textSection.setName("fieldset" + fieldsetNumber);
    // alert(textSection.getName());
    //form1.getJSXByName("fieldsetCounter").setValue(parseInt(form1.getJSXByName("fieldsetCounter").getValue())+1);
}

function inputYesNoSection(title, question, fieldsetNumber) {
    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 145).repaint();
    var textSection = form1.getJSXByName("block").load("components/yesnosection.xml", true);
    textSection.setDisplay("block").repaint();
    // textSection.setTitleText(title).repaint();
    textSection.setName(fieldsetNumber);
    // textSection.setTitleText(title).repaint();
    form1.getJSXByName("button").setDisplay("none").repaint();
    form1.getJSXByName("labelKysymys").setText(question).repaint();

    form1.getJSXByName("yes").setName("yes" + fieldsetNumber);
    form1.getJSXByName("no").setName("no" + fieldsetNumber);

}

function inputMultipleChoiceSection(title, question, nameSection) {

    // var id = getTemplateID();
    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 143).repaint();
    var textSection = form1.getJSXByName("block").load("components/multiplechoicesection.xml", true);
    textSection.setName(nameSection).repaint();
    //  textSection.setTitleText(title).repaint();
    form1.getJSXByName("labelKysymys").setText(question).repaint();
    var block = "choiceBlock" + nameSection;
    var choiceTextfield = "choiceTextField" + nameSection;
    form1.getJSXByName("choiceBlock").setName(block);
    form1.getJSXByName("choiceTextField").setName(choiceTextfield);
    form1.getJSXByName("tempID").setValue(nameSection);

    createMultipleChoiceQuestions(nameSection);

}

function inputNumberSection(title, question, fieldsetNumber) {
    form1.getJSXByName("paneBlock").setHeight(form1.getJSXByName("paneBlock").getHeight() + 95).repaint();
    var textSection = form1.getJSXByName("block").load("components/numberinputsection.xml", true);

    // textSection.setTitleText(title).repaint();
    textSection.setName(fieldsetNumber).repaint();
    form1.getJSXByName("textbox").setName("textbox" + fieldsetNumber);
    //alert(textSection.getChild());
    //alert(textSection.getJSXByName("labelKysymys").getText());
    form1.getJSXByName("labelKysymys").setText(question).repaint();

}

function removeThisSection(section) {
    form1.getJSXByName("block").removeChild(section);
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
