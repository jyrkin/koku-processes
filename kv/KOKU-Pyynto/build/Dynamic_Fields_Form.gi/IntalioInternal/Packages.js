/*
 *  Copyright (C) 2008, Intalio Inc.
 *
 *  The program(s) herein may be used and/or copied only with the
 *  written permission of Intalio Inc. or in accordance with the terms
 *  and conditions stipulated in the agreement/contract under which the
 *  program(s) have been supplied.
 *
 * Date         Author             Changes
 * Apr 11, 2008   Mark Horton  Created
 */

/////////////////////////////////
// TaskManagementServices WSDL //
/////////////////////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.TMS",
  function(tms) {

    tms.TMS_NS = "xmlns:tms='http://www.intalio.com/BPMS/Workflow/TaskManagementServices-20051109/'";

    /////////////
    // getTask //
    /////////////
    tms.callGetTask = function() {
        Intalio.Internal.Utilities.showLoading();
        
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagementServicesMapping_xml",
                "getTask", tms.onGetTaskSuccess, tms.onGetTaskTimeOut);
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.displayException(e); 
        }
    };

    tms.onGetTaskSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        
        var hasAttachments = false;
        
        var response = event.target.getResponseXML();
        jsx3.log("getTask response: " + Intalio.Internal.Utilities.tidy(response)); 
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            return;
        }
        
        Intalio.Internal.Utilities.setGetTaskDocument(inDoc);
        
        var taskType = Intalio.Internal.Utilities.getTaskType();
        if (taskType == null) {
            var msg = Intalio.Internal.Utilities.getErrorMissingTaskType();
            Intalio.Internal.Utilities.displayError(msg);
            return;
        }
        
        var taskState = Intalio.Internal.Utilities.getTaskState();
        
        jsx3.log("getTask taskType: " + taskType);
        jsx3.log("getTask taskState: " + taskState);
        
        var attachNode = inDoc.selectSingleNode("//tms:attachments", tms.TMS_NS);
        if (attachNode != null) {
            var children = attachNode.getChildNodes();
            if (children != null) {
                if (children.size() > 0) {
                    hasAttachments = true;
                }
            }
        }
        
        // get the data input node
        var mapNode = inDoc.selectSingleNode("//tms:output", tms.TMS_NS);
        if (mapNode == null) {
            mapNode = inDoc.selectSingleNode("//tms:input", tms.TMS_NS);
        }
        
        if (mapNode != null) {
            // create a doc from the node
            var mapDoc = new jsx3.xml.Document();
            mapDoc.loadXML(mapNode.getFirstChild());
            jsx3.log("getTask inbound mapping node: " + Intalio.Internal.Utilities.tidy(mapDoc));
        
            try {
                // invoke the inbound mapping
                var mapService = Intalio.Internal.Utilities.SERVER.loadResource(Intalio.Internal.Utilities.MAPPING);

				//Fix for EDGE-3620
				//get the names of all the matrix items used in the page
				try{
				    var rootBlock = Intalio.Internal.Utilities.SERVER.getRootBlock();
				    var matrixNames = "",matrixArr;
				    if(matrixArr = rootBlock.getDescendantsOfTypeNew("jsx3.gui.Matrix")){
					    for(i=0; i < matrixArr.length ; i++){
						    __name = matrixArr[i].getName();
						    if(matrixNames == ""){
							    matrixNames = __name;
						    } else{
							    matrixNames = matrixNames + "|" + __name;
						    }
					    }
				    }
		
				    //Get the name of the element that is mapped to the matrix
				    var CDFSourceTags = [];
				    var cxfDoc = mapService.getRulesXML();
				    var outputFormModel = cxfDoc.selectSingleNode("//record[@type='O']/record");//removing [@jsxtext='FormModel'] as it will always be true
				    var cdfRecord, script, scriptValue, regExMask, itemMappedToMatrix;
				    var cdfRecords = outputFormModel.selectNodes("descendant::record[@name='CDF Record']");
				    //IE error was resolved as soon as this variable declaration was done
				    var parent;
				    while(cdfRecords.hasNext()){
					    cdfRecord = cdfRecords.next();
					    if(parent = cdfRecord.getParent()){
						    if(parent.getNodeName() == 'mappings'){
							    script = parent.selectSingleNode("record[@name='Script']");
							    if(script && (scriptValue = script.getAttribute('value'))){
								    regExMask = new RegExp("if\\(typeof\\(this\\..*\\)=='undefined'\\)\\{this\\..*=-1;my\\.getCDFDocument\\('(" + matrixNames + ")','INBOUND'\\);\\}");
								    if(scriptValue.match(regExMask)){
									    itemMappedToMatrix = parent.getParent().getAttribute("jsxtext");
									    CDFSourceTags.push(itemMappedToMatrix);
								    }
							    }
						    }
					    }
				    }
				    if(CDFSourceTags.length){
					    //return true if the curretn tag is empty or contains just empty tags
					    //considering a text node to be non-empty only if it has at least one
					    //non-space(something other than space,tab,newline) character
					    function isEmptyEntity(entity){
							var childIter,child,_isEmptyChild;
							if(entity.getNodeType() == jsx3.xml.Entity.TYPETEXT){
							    if(entity.getValue() && jsx3.util.strTrim(entity.getValue())){
								return false;
							    } else{
								return true;
							    }
							}
							else if(entity.getValue()){
							    childIter = entity.getChildIterator(true);
							    if(childIter){
									while(childIter.hasNext()){
									    child = childIter.next();
									    if(child.getNodeType() == jsx3.xml.Entity.TYPETEXT){
										if(child.getValue() && jsx3.util.strTrim(child.getValue())){
										    return false;
										}
									    }else{
										_isEmptyChild = isEmptyEntity(child);
										if(!_isEmptyChild){
										    return false;
										}
									    }
									}
							    }
							}
							return true;
					    }
			
			
					    //remove the item from the inbound doc that is mapped to the matrix in case it is empty
					    var _allChildren = mapDoc.selectNodes("descendant::*");
						//void method, alters the object passed as argument directly
					    /*CDFSourceTags = */jsx3.$A(CDFSourceTags); 
					    if(_allChildren.size()){
						    for (var i = _allChildren.iterator(); i.hasNext(); ) {
						    	var __curNode = i.next();
						    	__name = __curNode.getNodeName();
						    	if(CDFSourceTags.contains(__name)){
						    		//remove the node if it is empty
						    		if(isEmptyEntity(__curNode)){
						    			var __parent = __curNode.getParent();
										if(__parent){
											__parent.removeChild(__curNode);
										}
						    		}
						    	}//end if
						    }//end for
					    }//end if
				    }//end if
				}catch(e){
				    //just a precaution to prevent errors in this fragment
				    //from stopping the core functionality
				}
                //End of EDGE-3620 fix
		

                mapService.setInboundDocument(mapDoc);
                mapService.doInboundMap();        
                
                var root = Intalio.Internal.Utilities.SERVER.getRootBlock();
                var children = root.getChildren();
                if (children != null) {
                    for (var i = 0; i < children.length; i++) {
                        var element = children[i];
                        element.repaint();
                    }
                }
       
                // large forms and/or large datasets need a small amount of time to render/load before we call repaint
                //setTimeout("Intalio.Internal.Utilities.SERVER.getRootBlock().repaint()", 100);
            } catch (e) {
                Intalio.Internal.Utilities.displayException(e);                
                return;
            }
        }
        
        // now that fields are populated, check the form fields validations
        Intalio.Internal.Utilities.updateValidationStatus();
        
        Intalio.Internal.Utilities.activateButtons();       
        jsx3.log("getTask succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.GET_TASK_SUCCESS});
        
        if (hasAttachments) {
            // displaying the attach block will invoke TMS.callGetAttachments 
            Intalio.Internal.Attachments.displayAttachmentsBlock(true);
        }
        
        Intalio.Internal.Utilities.autoClaim();
    };
    
    tms.onGetTaskTimeOut = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        var msg = Intalio.Internal.Utilities.getErrorOperationTimeout();
        msg = msg.replace("{0}", "getTask");
        Intalio.Internal.Utilities.displayError(msg);
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.GET_TASK_TIMEOUT});       
    };

    /////////////////////////
    // initProcess (start) //
    /////////////////////////
    tms.callInitProcess = function() {
        // make sure the form is complete
        if (Intalio.Internal.Utilities.validateForm() == false) {
            return;
        }

        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.showLoading();

        try {
            if (window.intalioPreStart) {
                var retval = window.intalioPreStart();
                if (retval != null) {
                    Intalio.Internal.Utilities.hideLoading();
                    Intalio.Internal.Utilities.activateButtons();   
                    Intalio.Internal.Utilities.displayError(retval);                 
                    return;
                }
            }
            
            Intalio.Internal.FileUpload.checkFileUploads("initProcess");
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);
        }
    };
    
    tms.callInitProcessActual = function() {
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagementServicesMapping_xml",
                "initProcess", tms.onInitProcessSuccess, Intalio.Internal.Utilities.onTimeOut);            
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);
        }          
    };

    tms.onInitProcessSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        Intalio.Internal.Utilities.hideForm();
        
        var response = event.target.getResponseXML();
        jsx3.log("initProcess response: " + Intalio.Internal.Utilities.tidy(response)); 
        var inDoc = Intalio.Internal.Communication.getPayload(response);        
        
        if (inDoc == null) {
            Intalio.Internal.Utilities.activateButtons(); 
            return;
        }        
        
        Intalio.Internal.Utilities.checkChained(inDoc);
        jsx3.log("initProcess succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.INIT_PROCESS_SUCCESS});
    };

    //////////////////////
    // setOutput (save) //
    //////////////////////
    tms.callSetOutput = function() {
        // FYI: save does not validate b/c it will be validated on complete
        
        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.showLoading();
            
        try {
            if (window.intalioPreSave) {
                var retval = window.intalioPreSave();
                if (retval != null) {
                    Intalio.Internal.Utilities.hideLoading();
                    Intalio.Internal.Utilities.activateButtons();   
                    Intalio.Internal.Utilities.displayError(retval);                 
                    return;
                }
            } 
                    
            Intalio.Internal.FileUpload.checkFileUploads("setOutput");
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e); 
        }
    };
    
    tms.callSetOutputActual = function() {
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagementServicesMapping_xml",
                "setOutput", tms.onSetOutputSuccess, Intalio.Internal.Utilities.onTimeOut);              
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);
        }
    }; 

    tms.onSetOutputSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        Intalio.Internal.Utilities.activateButtons();
            
        var response = event.target.getResponseXML();
        jsx3.log("setOutput response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            Intalio.Internal.Utilities.activateButtons(); 
            return;
        }
        
        Intalio.Internal.Utilities.showSuccess(Intalio.Internal.Utilities.getSaveSuccessText(), true);
        jsx3.log("setOutput succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.SET_OUTPUT_SUCCESS});
    };

    ////////////////////////
    // complete (dismiss) //
    ////////////////////////
    tms.callComplete = function() {
        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.showLoading();
    
        try {        
            if (window.intalioPreDismiss) {
                var retval = window.intalioPreDismiss();
                if (retval != null) {
                    Intalio.Internal.Utilities.hideLoading();
                    Intalio.Internal.Utilities.activateButtons();   
                    Intalio.Internal.Utilities.displayError(retval);                 
                    return;
                }
            } 
                    
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagementServicesMapping_xml",
                "complete", tms.onCompleteSuccess, Intalio.Internal.Utilities.onTimeOut); 
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);           
        }     
    };

    tms.onCompleteSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        Intalio.Internal.Utilities.hideForm();
        
        var response = event.target.getResponseXML();
        jsx3.log("complete response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            Intalio.Internal.Utilities.activateButtons(); 
            return;
        }        
        
        document.location.href = "/ui-fw/script/empty.jsp";
        jsx3.log("complete succeeded.");
    };

    ////////////////////
    // getAttachments //
    ////////////////////
    tms.callGetAttachments = function() {
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagementServicesMapping_xml",
                "getAttachments", tms.onGetAttachmentsSuccess, Intalio.Internal.Utilities.onTimeOut); 
        } catch (e) {
            Intalio.Internal.Utilities.displayException(e); 
        }
    };

    tms.onGetAttachmentsSuccess = function(event) {
        var response = event.target.getResponseXML();
        jsx3.log("getAttachments response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            return;
        }
        
        try {
            // create a doc from the node
            var mapDoc = new jsx3.xml.Document();
            mapDoc.loadXML(inDoc);
            
            // invoke the inbound mapping
            var mapService = Intalio.Internal.Utilities.SERVER.loadResource("IntalioInternal_TaskManagementServicesMapping_xml");
            mapService.setOperation("getAttachments");
            mapService.setInboundDocument(mapDoc);
            mapService.doInboundMap();        
        } catch (e) {
            Intalio.Internal.Utilities.displayException(e);                
            return;
        }        

        jsx3.log("getAttachments succeeded.");
        
        // show the attachments list
        Intalio.Internal.Attachments.showAttachments();
    };

    //////////////////////
    // removeAttachment //
    //////////////////////
    tms.callRemoveAttachment = function() {
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagementServicesMapping_xml",
                "removeAttachment", tms.onRemoveAttachmentSuccess, Intalio.Internal.Utilities.onTimeOut);   
        } catch (e) {
            Intalio.Internal.Utilities.displayException(e); 
        }        
    };

    tms.onRemoveAttachmentSuccess = function(event) {
        var response = event.target.getResponseXML();
        jsx3.log("removeAttachment response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            return;
        }
        
        jsx3.log("removeAttachment succeeded.");
        
        // refresh the attachments list
        tms.callGetAttachments();
    };
  }
);
// end package

/////////////////////////////
// TaskManagerProcess WSDL //
/////////////////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.TMP",
  function(tmp) {
    
    ///////////////////////
    // claimTask (claim) //
    ///////////////////////
    tmp.callClaimTask = function() {
        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.showLoading();
    
        try {        
            if (window.intalioPreClaim) {
                var retval = window.intalioPreClaim();
                if (retval != null) {
                    Intalio.Internal.Utilities.hideLoading();
                    Intalio.Internal.Utilities.activateButtons();   
                    Intalio.Internal.Utilities.displayError(retval);                 
                    return;
                }
            } 
                    
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagerProcessMapping_xml",
                "claimTask", tmp.onClaimTaskSuccess, Intalio.Internal.Utilities.onTimeOut);              
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);            
        }        
    };

    tmp.onClaimTaskSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        Intalio.Internal.Utilities.activateButtons();  
        
        var response = event.target.getResponseXML();
        jsx3.log("claimTask response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            Intalio.Internal.Utilities.activateButtons();
            return;
        }        
        
        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.setTaskState("CLAIMED");
        Intalio.Internal.Utilities.activateButtons();
        Intalio.Internal.Utilities.showSuccess(Intalio.Internal.Utilities.getClaimSuccessText(), true);
        jsx3.log("claimTask succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.CLAIM_TASK_SUCCESS});
    };

    /////////////////////////
    // revokeTask (revoke) //
    /////////////////////////
    tmp.callRevokeTask = function() {
        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.showLoading();
            
        try {
            if (window.intalioPreRevoke) {
                var retval = window.intalioPreRevoke();
                if (retval != null) {
                    Intalio.Internal.Utilities.hideLoading();
                    Intalio.Internal.Utilities.activateButtons();   
                    Intalio.Internal.Utilities.displayError(retval);                 
                    return;
                }
            } 
                    
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagerProcessMapping_xml",
                "revokeTask", tmp.onRevokeTaskSuccess, Intalio.Internal.Utilities.onTimeOut);            
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);            
        }        
    };

    tmp.onRevokeTaskSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        Intalio.Internal.Utilities.activateButtons();  
        
        var response = event.target.getResponseXML();
        jsx3.log("revokeTask response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            Intalio.Internal.Utilities.activateButtons(); 
            return;
        }        
        
        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.setTaskState("READY");
        Intalio.Internal.Utilities.activateButtons();
        Intalio.Internal.Utilities.showSuccess(Intalio.Internal.Utilities.getRevokeSuccessText(), true);
        jsx3.log("revokeTask succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.REVOKE_TASK_SUCCESS});
    };

    /////////////////////////////
    // completeTask (complete) //
    /////////////////////////////
    tmp.callCompleteTask = function() {
        // make sure the form is complete
        if (Intalio.Internal.Utilities.validateForm() == false) {
            return;
        }

        Intalio.Internal.Utilities.deactivateButtons();
        Intalio.Internal.Utilities.showLoading();
        
        try {
            if (window.intalioPreComplete) {
                var retval = window.intalioPreComplete();
                if (retval != null) {
                    Intalio.Internal.Utilities.hideLoading();
                    Intalio.Internal.Utilities.activateButtons();   
                    Intalio.Internal.Utilities.displayError(retval);                 
                    return;
                }
            }
               
            Intalio.Internal.FileUpload.checkFileUploads("completeTask");
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);            
        }        
    };
    
    tmp.callCompleteTaskActual = function() {
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TaskManagerProcessMapping_xml",
                "completeTask", tmp.onCompleteTaskSuccess, Intalio.Internal.Utilities.onTimeOut);             
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.activateButtons();
            Intalio.Internal.Utilities.displayException(e);
        }          
    };    
    
    tmp.onCompleteTaskSuccess = function(event) {
        Intalio.Internal.Utilities.hideLoading();
        Intalio.Internal.Utilities.hideForm();
        
        var response = event.target.getResponseXML();
        jsx3.log("completeTask response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            Intalio.Internal.Utilities.activateButtons(); 
            return;
        }
        
        Intalio.Internal.Utilities.checkChained(inDoc);
        jsx3.log("completeTask succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.COMPLETE_TASK_SUCCESS});
    };
  }
);
// end package

////////////////////////////////
// TaskAttachmentService WSDL //
////////////////////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.TAS",
  function(tas) {
    
    ////////////
    // delete //
    ////////////
    tas.callDelete = function(attachmentUrl) {
        try {
            Intalio.Internal.Communication.sendRequest("IntalioInternal_TASMapping_xml",
                "delete", tas.onDeleteSuccess, Intalio.Internal.Utilities.onTimeOut);   
        } catch (e) {
            Intalio.Internal.Utilities.displayException(e); 
        }        
    };

    tas.onDeleteSuccess = function(event) {
        var response = event.target.getResponseXML();
        jsx3.log("delete response: " + Intalio.Internal.Utilities.tidy(response));         
        var inDoc = Intalio.Internal.Communication.getPayload(response);
        
        if (inDoc == null) {
            return;
        }

        jsx3.log("delete succeeded.");
        
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.DELETE_SUCCESS});
    };
  }
);
// end package

/////////////////
// Attachments //
/////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.Attachments",
  function(attach) {
  
    attach.showAttachments = function() {
        // the matrix is already populated, but we still need to calculate the proper block height
        var matrix = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsMatrix");
        if (matrix == null) return;
        
        var rows = matrix.getXML().getChildNodes().getLength();
        var rowHeight = matrix.getRowHeight(jsx3.gui.Matrix.DEFAULT_ROW_HEIGHT);
        var headerHeight = matrix.getHeaderHeight(jsx3.gui.Matrix.DEFAULT_HEADER_HEIGHT);        
        var height = (rows * rowHeight) + headerHeight;
        
        var extra = 70;
        if (document.IntalioInternal_AddAttachmentsForm.attachmentText.style.cssText == "") {
            extra = extra + 90;
        }
        
        attach.setAttachmentsMatrixBlockHeight(height);
        attach.setAttachmentsBlockHeight(height + extra);
        matrix.repaint();
    };
  
    attach.displayAttachmentsImageBlock = function(display) {
        var block = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsImageBlock");
        if (block == null) return;
        
        if (display) {
            block.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
        } else {
            block.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
        }
    };

    // called when the user clicks the paper click image on the form
    attach.displayAttachmentsBlock = function(display) {
        var image = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_CloseImage");
        if (image == null) return;

        var block = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsBlock");
        if (block == null) return;

        if (display) {
            image.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
            block.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
            attach.populateAttachmentsForm();
        } else {
            image.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
            block.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);            
        }
    };

    // calling this will ultimately load the attachment list into the matrix
    attach.populateAttachmentsForm = function() {
        var label = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsFormLabel");
        if (label == null) return;

        // this is the html we want to display (its a form)
        try {
            var doc = Intalio.Internal.Utilities.SERVER.loadResource("IntalioInternal_AttachmentsForm_xml");
            var docRoot = doc.getRootNode();
            label.setText(docRoot, true);
        
            var form = document.IntalioInternal_AddAttachmentsForm;
            form.taskId.value = Intalio.Internal.Utilities.getTaskId();
            form.participantToken.value = Intalio.Internal.Utilities.getParticipantToken();
            form.authorizedUsers.value = Intalio.Internal.Utilities.getUser();
            form.attachmentText.value = "";
        } catch (e) {
            Intalio.Internal.Utilities.displayException(e); 
        }        
    };
    
    attach.setAttachmentsBlockHeight = function(height) {
        var block = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsBlock");
        block.setHeight(height, true);
    };

    attach.setAttachmentsMatrixBlockHeight = function(height) {
        var block = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsMatrixBlock");
        block.setHeight(height, true);
    };
    
    attach.addAttachment = function() {
        document.IntalioInternal_AddAttachmentsForm.submit();
        
        // clear out the attachment form fields
        document.IntalioInternal_AddAttachmentsForm.attachmentName.value = "";
        document.IntalioInternal_AddAttachmentsForm.attachmentFile.value = "";
        document.IntalioInternal_AddAttachmentsForm.attachmentText.value = "";
    }; 

    attach.removeAttachment = function(url) {
        var urlObj = Intalio.Internal.Utilities.SERVER.getJSXByName("IntalioInternal_AttachmentsUrl");
        if (urlObj == null) return;
        urlObj.setText(url);
        
        Intalio.Internal.TAS.callDelete();
        Intalio.Internal.TMS.callRemoveAttachment();
    };
    
    attach.updateCDFNode = function(context) {
        var url = context.getAttribute("IntalioInternal_PayloadUrl");
        var href = "<img src='/gi/files/images/remove.gif' border='0' " + 
                   "  onClick='Intalio.Internal.Attachments.removeAttachment(\"" + url + "\");' />"; 
        context.setAttribute("IntalioInternal_RemoveImage", href); 
        
        attach.setAttributeHref(url, context, "Title");
        attach.setAttributeHref(url, context, "MimeType");
        attach.setAttributeHref(url, context, "CreationDate");
    };
    
    attach.setAttributeHref = function(url, context, attr) {
        var fullAttr = "IntalioInternal_" + attr;
        var text = context.getAttribute(fullAttr);
        var href = "<a href='" + url + "' target='_blank' style='text-decoration: none; color: #581C90;'>" + text + "</a>";
        context.setAttribute(fullAttr, href);        
    };
    
    attach.displayTextInput = function() {
        var file = document.IntalioInternal_AddAttachmentsForm.attachmentFile;
        var text = document.IntalioInternal_AddAttachmentsForm.attachmentText;
        
        if (text.style.cssText == "") {
            text.style.cssText = "display: none;";
            file.style.cssText = "";
        } else {
            text.style.cssText = "";
            file.style.cssText = "display: none;";        
        }

        attach.showAttachments();        
    };
  }
);
// end package
//
///////////////////////////////////
//Get RBAC Service to get Roles //
/////////////////////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.RBACRoleService",
  function(rbacSer) {

    rbacSer._soap_ns_uri = 'http://schemas.xmlsoap.org/soap/envelope/';
    rbacSer._rbac_ns_uri = 'http://tempo.intalio.org/security/RBACQueryService/';
      
    rbacSer.callRBACService = function(){
	Intalio.Internal.Utilities.showLoading();
        try {
	    jsx3.require("jsx3.net.Service");
	    var objService = Intalio.Internal.Utilities.SERVER.loadResource("IntalioInternal_RBACRolesMapping_xml");
	    objService.setNamespace(Intalio.Internal.Utilities.SERVER);
	    objService.setOperation("getAssignedRoles");
	    objService.subscribe(jsx3.net.Service.ON_SUCCESS, rbacSer.onGetRolesSuccess);
	    objService.subscribe(jsx3.net.Service.ON_ERROR, rbacSer.onGetRolesFailure);
	    objService.subscribe(jsx3.net.Service.ON_INVALID, rbacSer.onGetRolesFailure);
	    objService.doCall();
        } catch (e) {
            Intalio.Internal.Utilities.hideLoading();
            Intalio.Internal.Utilities.displayException(e);
        }
    };
    
    rbacSer.onGetRolesSuccess = function(event){
	Intalio.Internal.Utilities.hideLoading();	
	var inDoc = event.target.getInboundDocument();
	
	var nsMap = inDoc.getDeclaredNamespaces();
	var _soap_ns = nsMap[rbacSer._soap_ns_uri];
	var _rbac_ns = nsMap[rbacSer._rbac_ns_uri];

	var roles = inDoc.selectNodes('//'+ _soap_ns +':Body/' +
		    _rbac_ns + ':getAssignedRolesResponse/' +
		    _rbac_ns + ':role', inDoc.getDeclaredNamespaces()
	);
	var _user_roles = [];
	if(roles.size()){
	    for (var i = roles.iterator(); i.hasNext(); ) {
		var roleNode = i.next();
		_user_roles.push(roleNode.getValue());
	    }
	}
	
	Intalio.Internal.Utilities.setAssignedRoles(_user_roles);
	Intalio.Internal.Utilities.disableFieldsBasedOnRoles();
        jsx3.log("getAssignedRoles succeeded.");

        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.GET_ASSIGNED_ROLES_SUCCESS});        
    };

    rbacSer.onGetRolesFailure = function(){
	Intalio.Internal.Utilities.hideLoading();
        var msg = Intalio.Internal.Utilities.getErrorOperationTimeout();
        msg = msg.replace("{0}", "getAssignedRoles");
        Intalio.Internal.Utilities.displayError(msg);
        Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.GET_ASSIGNED_ROLES_FAILURE});
    };
  }
);

//end package


///////////////
// Utilities //
///////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.Utilities",
  function(util) {

    util.SERVER = Dynamic_Fields_Form;
    util.MAPPING = "UserSchemaMapping_xml";
    util.BUTTON_POSITION="Both";
      
    util.GET_TASK_SUCCESS = "get-task-success";
    util.GET_TASK_TIMEOUT = "get-task-timeout";    
    util.OPERATION_TIMEOUT = "operation-timeout";
    util.INIT_PROCESS_SUCCESS = "init-process-success";
    util.SET_OUTPUT_SUCCESS = "set-output-success";
    util.CLAIM_TASK_SUCCESS = "claim-task-success";
    util.REVOKE_TASK_SUCCESS = "revoke-task-success";
    util.COMPLETE_TASK_SUCCESS = "complete-task-success";
    util.DELETE_SUCCESS = "delete-success";
    util.GET_ASSIGNED_ROLES_SUCCESS = "get-assigned-roles-success";
    util.GET_ASSIGNED_ROLES_FAILURE = "get-assigned-roles-timeout";
    util.ROLES_NOT_AVAILABLE = "roles-not-available";

    util._user_roles = null;
    
    // get a URL parameter 
    util.getRequestParameter = function(key) {
        var uri = new jsx3.net.URI(window.location.href);
        var val = uri.getQueryParam(key);
        return val;
    };    

    // get the task id
    util.getTaskId = function() {
        return util.getRequestParameter("id");
    };

    // get the participant token
    util.getParticipantToken = function() {
        return util.getRequestParameter("token");
    };

        // get the user
    util.getUser = function() {
        var user = util.getRequestParameter("user");
        user = user.replace(/\+/, " ");
        return user;
    };

    util.setAssignedRoles = function(roles){
		util._user_roles = roles;
		return 	util._user_roles;
    };

    util.disableFieldsBasedOnRoles = function(){
		//jsx3.require("com.intalio.ria.Field");
		var root = util.SERVER.getRootBlock();
	        var children = root.getDescendantsOfTypeNew('com.intalio.ria.Field', false);
		var roles = util.getAssignedRoles();
		var isValidRole, index, role;
	        if (children != null) {
	            for (var i = 0; i < children.length; i++) {
	                var element = children[i];
				isValidRole = false;
		        try {
				    for(var j in roles){
					if(roles[j] && typeof roles[j] == 'string'){
					    index = roles[j].indexOf('\\');
					    role = roles[j].substr(index+1);
					    if(!isValidRole){
						isValidRole = element.isValidRole(role);
					    }
					}
				    }
				    if(!isValidRole && element.getRoles()){
					//element.showMask("Disabled");
					//showMask not working properly, so just hiding the components
					element.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
				    }
		        } catch (Exception) {
		            // nothing to do
		        }
	        }
        }
    };
    
    //get the roles associated with the current user
    util.getAssignedRoles = function(){
	if(util._user_roles == null){
	    //happens when the call to getRoles is made before the
	    //WS call completes
	    return util.ROLES_NOT_AVAILABLE;
	}
	else{
	    return util._user_roles;
	}
    };
       
    // get the type
    util.getType = function() {
        return util.getRequestParameter("type");
    };    
    
    // get the form url
    util.getFormUrl = function() {
        return util.getRequestParameter("url");
    };    
    
    // get the autoclaim param
    util.getAutoClaim = function() {
        return util.getRequestParameter("claimTaskOnOpen");
    };
    
    util.appendOutboundFormModelNode = function(node) {
        try {
            var service = util.SERVER.loadResource(util.MAPPING);
            service.setOperationName("");
                
            var svcMsg = service.getServiceMessage();
            jsx3.log("Outbound mapping node: " + Intalio.Internal.Utilities.tidy(svcMsg));
        
            node.appendChild(svcMsg.cloneNode(true));
        } catch (e) {
            Intalio.Internal.Utilities.displayException(e); 
        }        
    };
    
    util.ensureButtonsText = function() {
        util.ensureButtonText("IntalioInternal_StartButton", "Start");
        util.ensureButtonText("IntalioInternal_SaveButton", "Save");
        util.ensureButtonText("IntalioInternal_ClaimButton", "Claim");
        util.ensureButtonText("IntalioInternal_RevokeButton", "Revoke");
        util.ensureButtonText("IntalioInternal_CompleteButton", "Complete");
        util.ensureButtonText("IntalioInternal_DismissButton", "Dismiss");
        
	util.ensureButtonText("IntalioInternal_StartButtonTop", "Start");
        util.ensureButtonText("IntalioInternal_SaveButtonTop", "Save");
        util.ensureButtonText("IntalioInternal_ClaimButtonTop", "Claim");
        util.ensureButtonText("IntalioInternal_RevokeButtonTop", "Revoke");
        util.ensureButtonText("IntalioInternal_CompleteButtonTop", "Complete");
	util.ensureButtonText("IntalioInternal_DismissButtonTop", "Dismiss");
    };
    
    util.ensureButtonText = function(buttonName, buttonText) {
        var button = util.SERVER.getJSXByName(buttonName);
        if (button == null) return;
        
        if (button.getText() == null) {
            jsx3.log("Adding button text: " + buttonName);
            // must remove the dynamic property first
            button.setDynamicProperty("jsxtext", null);
            button.setText(buttonText, true);
        }
    };
    
    // displays buttons based on task type and button position provided in the config.xml file, but doesnt enable them
    util.processTaskType = function(taskType) {
		if (taskType == null) return;
      	var item;
        if (taskType == "PIPATask") {
	    
		    if(util.BUTTON_POSITION=="Bottom"){
		      		util.SERVER.getJSXByName("IntalioInternal_StartButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
		      		
	        }else if(util.BUTTON_POSITION=="Top"){
			        (item = util.SERVER.getJSXByName("IntalioInternal_StartButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
			        
	        }else if(util.BUTTON_POSITION=="Both"){
	        	    util.SERVER.getJSXByName("IntalioInternal_StartButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
		      		(item = util.SERVER.getJSXByName("IntalioInternal_StartButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
		      		
	       	}
	    
        }
        else if (taskType == "PATask") {
        	
        	if(util.BUTTON_POSITION=="Bottom"){
	            util.SERVER.getJSXByName("IntalioInternal_SaveButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            util.SERVER.getJSXByName("IntalioInternal_ClaimButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            util.SERVER.getJSXByName("IntalioInternal_RevokeButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            util.SERVER.getJSXByName("IntalioInternal_CompleteButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
        	}else if(util.BUTTON_POSITION=="Top"){
				
		    //makes the newly added button on the top visible

		    (item = util.SERVER.getJSXByName("IntalioInternal_SaveButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
		    (item = util.SERVER.getJSXByName("IntalioInternal_ClaimButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
		    (item = util.SERVER.getJSXByName("IntalioInternal_RevokeButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
		    (item = util.SERVER.getJSXByName("IntalioInternal_CompleteButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
        	}else if(util.BUTTON_POSITION=="Both"){
        	    util.SERVER.getJSXByName("IntalioInternal_SaveButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            util.SERVER.getJSXByName("IntalioInternal_ClaimButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            util.SERVER.getJSXByName("IntalioInternal_RevokeButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            util.SERVER.getJSXByName("IntalioInternal_CompleteButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
	            (item = util.SERVER.getJSXByName("IntalioInternal_SaveButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
			    (item = util.SERVER.getJSXByName("IntalioInternal_ClaimButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
			    (item = util.SERVER.getJSXByName("IntalioInternal_RevokeButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
			    (item = util.SERVER.getJSXByName("IntalioInternal_CompleteButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
        		
        		
        	}

	    // display the image block
	    Intalio.Internal.Attachments.displayAttachmentsImageBlock(true);
	}
	else if (taskType == "Notification") {
	
	    
	        if(util.BUTTON_POSITION=="Bottom"){
		      		util.SERVER.getJSXByName("IntalioInternal_DismissButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
		      		
	        }else if(util.BUTTON_POSITION=="Top"){
			        (item = util.SERVER.getJSXByName("IntalioInternal_DismissButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
			        
	        }else if(util.BUTTON_POSITION=="Both"){
				    util.SERVER.getJSXByName("IntalioInternal_DismissButton").setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
				    (item = util.SERVER.getJSXByName("IntalioInternal_DismissButtonTop")) ? item.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true) : null;
		      		
	       	}
       }
       
       
       
    };
    
    util.autoClaim = function() {
        var autoClaim = util.getAutoClaim();
        var taskState = util.getTaskState();
        var taskType = util.getTaskType();
        
        if (autoClaim !== "true") {
            return;   
        }
        
        if (taskType != "NOTIFICATION") {
            if (taskState == "READY") {
                if (util.getAuthorizedAction("claim")) {
                    Intalio.Internal.TMP.callClaimTask();
                }                
            }
        }
    };
    
    util.activateButtons = function() {
        var taskState = util.getTaskState();
        var taskType = util.getTaskType();
        
        if (taskType == "NOTIFICATION") {
            if (taskState == "READY") {
                if (util.getAuthorizedAction("dismiss")) {
                    util.SERVER.getJSXByName("IntalioInternal_DismissButton").setEnabled(true, true);
					var item;
					(item = util.SERVER.getJSXByName("IntalioInternal_DismissButtonTop")) ? item.setEnabled(true, true) : null;
                }
            }
        } 
        else {        
            if (taskState == "NONE") {
                util.SERVER.getJSXByName("IntalioInternal_StartButton").setEnabled(true, true);
		var item;
		(item = util.SERVER.getJSXByName("IntalioInternal_StartButtonTop")) ? item.setEnabled(true, true) : null;
            }
	    // ElseIf condition was put as part of fixing Fixing BPMS-875 on 4 Nov 2010
	    else if(taskState == "COMPLETED"){
            	util.deactivateButtons();
            }
            else {				
		var item;
		if (util.getAuthorizedAction("save")) {
			util.SERVER.getJSXByName("IntalioInternal_SaveButton").setEnabled(true, true);
			(item = util.SERVER.getJSXByName("IntalioInternal_SaveButtonTop")) ? item.setEnabled(true, true) : null;

		}

		if (util.getAuthorizedAction("complete")) {
			util.SERVER.getJSXByName("IntalioInternal_CompleteButton").setEnabled(true, true);
			(item = util.SERVER.getJSXByName("IntalioInternal_CompleteButtonTop")) ? item.setEnabled(true, true) : null;
		}

		if (taskState == "READY") {
			if (util.getAuthorizedAction("claim")) {
				util.SERVER.getJSXByName("IntalioInternal_ClaimButton").setEnabled(true, true);
				(item = util.SERVER.getJSXByName("IntalioInternal_ClaimButtonTop")) ? item.setEnabled(true, true) : null;
			}
		}

		if (taskState == "CLAIMED") {
			if (util.getAuthorizedAction("revoke")) {
				util.SERVER.getJSXByName("IntalioInternal_RevokeButton").setEnabled(true, true);
				(item = util.SERVER.getJSXByName("IntalioInternal_RevokeButtonTop")) ? item.setEnabled(true, true) : null;
			}
		}
	    }
	}	
    };
    
    util.deactivateButtons = function() {
        util.SERVER.getJSXByName("IntalioInternal_StartButton").setEnabled(false, true);
        util.SERVER.getJSXByName("IntalioInternal_SaveButton").setEnabled(false, true);
        util.SERVER.getJSXByName("IntalioInternal_ClaimButton").setEnabled(false, true);
        util.SERVER.getJSXByName("IntalioInternal_CompleteButton").setEnabled(false, true);            
        util.SERVER.getJSXByName("IntalioInternal_RevokeButton").setEnabled(false, true);
        util.SERVER.getJSXByName("IntalioInternal_DismissButton").setEnabled(false, true);
        
	var item;
	(item = util.SERVER.getJSXByName("IntalioInternal_StartButtonTop")) ? item.setEnabled(false, true) : null;
	(item = util.SERVER.getJSXByName("IntalioInternal_SaveButtonTop")) ? item.setEnabled(false, true) : null;
	(item = util.SERVER.getJSXByName("IntalioInternal_ClaimButtonTop")) ? item.setEnabled(false, true) : null;
	(item = util.SERVER.getJSXByName("IntalioInternal_CompleteButtonTop")) ? item.setEnabled(false, true) : null;
	(item = util.SERVER.getJSXByName("IntalioInternal_RevokeButtonTop")) ? item.setEnabled(false, true) : null;
	(item = util.SERVER.getJSXByName("IntalioInternal_DismissButtonTop")) ? item.setEnabled(false, true) : null;
					
		
    };
    
    // this is typically called only once, when a page first loads
    // this does not return a value or generate an alert
    util.updateValidationStatus = function() {
        var root = util.SERVER.getRootBlock();
        var children = root.getDescendantsOfType(jsx3.gui.Form, false);

        if (children != null) {        
            for (var i = 0; i < children.length; i++) {
                var element = children[i];
                
                // certain form elements do not implement the doValidate() method,
                // they will throw an exception
                try {
                    if (element.doValidate()) {
                        var image = util.getValidateImage(element);
                        if (image != null) {
                            image.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);            
                        }
                    }
                } catch (Exception) {
                    // nothing to do    
                }
            }
        }    
    };
    
    // iterate over the form elements and validate them
    // returns true if all are valid, false otherwise (and an alert)
    util.validateForm = function() {
        var root = util.SERVER.getRootBlock();
        var children = root.getDescendantsOfType(jsx3.gui.Form);
        var radioArr = new Object();
        
        if (children != null) {
            var error = null;
            
            for (var i = 0; i < children.length; i++) {
                var element = children[i];
                
                // skip all children of a matrix since we will validate it separately
                if (element.getAncestorOfTypeNew("jsx3.gui.Matrix")) {
                    continue;
                }
                
                var field = element.getAncestorOfTypeNew("com.intalio.ria.Field");
                
                if (field != null && element.isType("jsx3.gui.Matrix")) {
                    if (field.validateMatrix) {
                        if (!field.validateMatrix(element)) {
                            var msg = util.getErrorIncompleteMatrix();
                            var txt = "<li id='IntalioInternal_error'>" + msg + "</li>";
                        
                            if (error == null) {
                                error = txt;
                            } else {
                                error = error + txt;
                            }
                        }
                    }
                    
                    continue;
                }
                
                // certain form elements do not implement the doValidate() method,
                // they will throw an exception
                try {
                    if (element.doValidate() == jsx3.gui.Form.STATEINVALID) {
                        // only 1 radio button in a radio group
                        //if (element.instanceOf(jsx3.gui.RadioButton)) {
						if (element !=null && element.getInstanceOf()=="jsx3.gui.RadioButton") {
                            var groupName = element.getGroupName();
                            if (radioArr[groupName]) {
                                continue;
                            }
                    
                            radioArr[groupName] = groupName;
                        }                        
                        
                        var txt = null;                        
                        if (field != null) {
                            txt = field.getErrorMessageText();
                            if (txt != null) {
                                txt = util.trim(txt);
                                if (txt.length == 0) {
                                    txt = null;
                                }
                            }
                        }
                        
                        if (txt == null) {
                            var name = element.getName();
                            if (Intalio.Internal.CustomErrors) {
                                txt = Intalio.Internal.CustomErrors.getError(name);
                            }                    
                            else {
                                var msg = util.getErrorIncompleteField();
                                txt = msg.replace("{0}", name);
                            }
                        }
                        
                        txt = "<li id='IntalioInternal_error'>" + txt + "</li>";
                        
                        if (error == null) {
                            error = txt;
                        } else {
                            error = error + txt;   
                        }
                    }
                } catch (Exception) {
                    // nothing to do
                }
            }
            
            if (error != null) {
                util.displayError(error);
                return false;
            }
        }
        
        return true;
    };
    
    // initialize the form
    util.initApp = function() {
        // determine the locale for this form 
        util.determineLocale();
        
        // ensure that the buttons have text
        util.ensureButtonsText();
        
        // IE window resize bug work around
        if (jsx3.CLASS_LOADER.IE) {
            jsx3.gui.Event.unsubscribeAll(jsx3.gui.Event.RESIZE);
        }
        
        var taskType = util.getType();
        jsx3.log("task type = " + taskType);
        util.processTaskType(taskType);
        Intalio.Internal.TMS.callGetTask();
    };
    
    util.determineLocale = function() {
        // determine the locale for this form        
        var currentLocale = util.SERVER.getLocale();
        jsx3.log("Current locale: " + currentLocale);
        
        // if the default locale is not set then check for the cookie
        var localeKey = util.SERVER.getSettings().get("default_locale");
        if (localeKey == null || localeKey.length == 0) {
            // does the cookie exist?
            var cookie = util.SERVER.getCookie("intalio-ajax-accept-language");
            if (cookie != null && cookie.length > 1) {
                jsx3.log("Locale cookie: " + cookie);
                
                jsx3.require("jsx3.util.Locale");
                var locale = jsx3.util.Locale.valueOf(cookie);
                
                // if the new locale is different, then change it
                if (!currentLocale.equals(locale)) {
                    util.SERVER.setLocale(locale);
                    util.SERVER.reloadLocalizedResources();
                    util.SERVER.getRootBlock().repaint();
                
                    jsx3.log("New locale: " + util.SERVER.getLocale());
                }
            }
        }               
    };

    util.checkChained = function(inDoc) {
        var nextId = "";
        var nextUrl = "";
        var nextIdNode = inDoc.selectSingleNode("//*[local-name()='nextTaskId']");
        if (nextIdNode != null) {
            nextId = nextIdNode.getValue();
            if (nextId == null) nextId = "";
            nextId = nextId.trim();            
        }
        
        var nextUrlNode = inDoc.selectSingleNode("//*[local-name()='nextTaskURL']");
        if (nextUrlNode != null) {
            nextUrl = nextUrlNode.getValue();
            if (nextUrl == null) nextUrl = "";
            nextUrl = nextUrl.trim();
        }

        if (nextId != "" && nextUrl != "") {
            var fullUrl = nextUrl + 
                "?id=" + nextId + 
                "&type=PATask" + 
                "&url=" + encodeURIComponent(nextUrl) +  
                "&token=" + util.getParticipantToken() + 
                "&user=" + encodeURIComponent(util.getUser());
                
            document.location.href = fullUrl;
        } else {
            document.location.href = "/ui-fw/script/empty.jsp";
        }        
    };    
    
    // set a color pickers value
    util.setColorPickerValue = function(colorPicker, value) {
        var valueObj = util.getValueObject(colorPicker);
        if (valueObj == null || value == null) return;
        
        var str = value.toString(16).toUpperCase();
        while (str.length < 6) {
            str = "0" + str;
        }
        
        var rgb = str.substring(0, 2) + " " + 
                  str.substring(2, 4) + " " + 
                  str.substring(4, 6);
        valueObj.setText(rgb, true);
    };
    
    // set a sliders value
    util.setSliderValue = function(slider, value) {        
        var valueObj = util.getValueObject(slider);
        if (valueObj == null || value == null) return;
        
        valueObj.setText(value.toFixed(2), true);
    };
    
    // check the validation of a form element
    util.validateElement = function(element) {
        var image = util.getValidateImage(element);
        if (image == null) return;

        // radio button group is always valid once selected         
        //jsx3.require("jsx3.gui.RadioButton");
        //if (element instanceof jsx3.gui.RadioButton) {
		if (element.isType("jsx3.gui.RadioButton")) {
            image.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
            return;
        }
        
        if (element.doValidate()) {
            image.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
        }
        else {
            image.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
        }
    };
    
    // find an associated validation image, if any
    util.getValidateImage = function(element) {
        var name = util.getElementName(element);       
        if (name == null) return null;
        
        //jsx3.require("jsx3.gui.RadioButton");
        //if (element instanceof jsx3.gui.RadioButton) {
		if (element.isType('jsx3.gui.RadioButton')) {
            name = element.getGroupName();
            if (name == null) return null;
        }
        
        var retval = util.SERVER.getJSXByName(name + "-validate");
        if (retval != null) {
            //jsx3.require("jsx3.gui.Image");
			//if (retval instanceof jsx3.gui.Image) {
            if (retval.isType('jsx3.gui.Image')) {
                return retval;
            }
        }
        
        return null;                
    };
    
    // find an associated value object, if any
    util.getValueObject = function(element) {
        var name = util.getElementName(element);       
        if (name == null) return null;
        
        var retval = util.SERVER.getJSXByName(name + "-value");
        if (retval == null) {
            retval = util.SERVER.getJSXByName(name + "-value-nomap");
        }
        
        return retval;
    };

    // find the name of the given element    
    util.getElementName = function(element) {
        if (element == null) return null;
        
        var name = element.getName();        
        if (name == null) return null;
        
        // remove '-nomap' if it ends with it
        var idx = name.indexOf("-nomap");
        if (idx > 0) {
            if (idx == name.length - 6) {
                name = name.substring(0, idx);
            }
        }
        
        return name;        
    };
    
    util.getTaskType = function() {
        var taskType = null;
        var inDoc = util.getGetTaskDocument();
        if (inDoc != null) {
            var taskTypeNode = inDoc.selectSingleNode("//tms:metadata/tms:taskType", Intalio.Internal.TMS.TMS_NS);
            if (taskTypeNode != null) {
                taskType = taskTypeNode.getValue(); 
            }
        }
        
        return taskType;       
    };
    
    util.getTaskState = function() {
        var taskState = "NONE";
        var inDoc = util.getGetTaskDocument();
        if (inDoc != null) {
            var taskStateNode = inDoc.selectSingleNode("//tms:metadata/tms:taskState", Intalio.Internal.TMS.TMS_NS);
            if (taskStateNode != null) {
                taskState = taskStateNode.getValue();
            }
        }
        
        return taskState;
    };

    util.setTaskState = function(taskState) {
        var inDoc = util.getGetTaskDocument();
        if (inDoc != null) {
            var taskStateNode = inDoc.selectSingleNode("//tms:metadata/tms:taskState", Intalio.Internal.TMS.TMS_NS);
            if (taskStateNode != null) {
                taskStateNode.setValue(taskState);
            }
        }          
    };
    
    util.getAuthorizedAction = function(action) {
        var auth = false;
        
        var inDoc = util.getGetTaskDocument();
        if (inDoc != null) {
            var authNode = inDoc.selectSingleNode("//tms:metadata/tms:" + action + "Action/tms:authorized", Intalio.Internal.TMS.TMS_NS);
            // if node doesn't exist then authorized
            if (authNode == null) {
                auth = true;
            } else {
                // if node exists and is not 'false' then authorized
                if (authNode.getValue().toLowerCase() != "false") {
                    auth = true;    
                }
            }
        }   
        
        return auth;
    };    
    
    util.setGetTaskDocument = function(inDoc) {
        window.IntalioInternal_getTaskDoc = inDoc;
    };
    
    util.getGetTaskDocument = function() {
        return IntalioInternal_getTaskDoc;
    };
    
    util.onError = function(event) {
        util.hideLoading();
        
        var opname = event.target.getOperationName();
        if (opname !== "getTask") {
            util.activateButtons();            
        }
        
        var status = event.target.getRequest().getStatus();
        
        var msg = util.getErrorOperationError();
        msg = msg.replace("{0}", opname);
        msg = msg.replace("{1}", status); 
        
        util.displayError(msg);        
    };

    util.onInvalid = function(event) {
        util.hideLoading();
        
        var opname = event.target.getOperationName();
        if (opname !== "getTask") {
            util.activateButtons();            
        }

        var msg = util.getErrorOperationInvalid();
        msg = msg.replace("{0}", opname);
        
        util.displayError(msg);        
    };
    
    util.onTimeOut = function(event) {
        util.hideLoading();
            
        var opname = event.target.getOperationName();
        if (opname !== "getTask") {
            util.activateButtons();        
            Intalio.Internal.Utilities.SERVER.publish({subject:Intalio.Internal.Utilities.OPERATION_TIMEOUT});
        }

        var msg = util.getErrorOperationTimeout();
        msg = msg.replace("{0}", opname);
        
        util.displayError(msg);        
    };    
    
    util.closeError = function() {
        document.getElementById("IntalioInternal_error").style.visibility = "hidden";     
        util.undimForm();
    };
    
    util.displayError = function(msg, isException) {
        util.dimForm();
        jsx3.log(msg);
        
        if (isException === true) {
            msg = "<pre id='IntalioInternal_error'>" + msg + "</pre>";                  
        }
        
        document.getElementById("IntalioInternal_error_text").innerHTML = msg;
        document.getElementById("IntalioInternal_error_close_button").innerHTML = util.getCloseButtonText();
        
        var div = document.getElementById("IntalioInternal_error");
        util.centerDiv(div);
        div.style.visibility = "visible"; 
    };
    
    util.displayException = function(e) {        
        var msg = util.getErrorLoggingException();
        
        try {
            msg = jsx3.NativeError.wrap(e).printStackTrace(); 
        } catch (ex) {;}
            
        util.displayError(msg, true);
    };
    
    util.showLoading = function() {
        util.hideSuccess();
        util.dimForm();
        var div = document.getElementById("IntalioInternal_loading");
        document.getElementById("IntalioInternal_loading_wait").innerHTML = util.getLoadingText();
        util.centerDiv(div);
        div.style.visibility = "visible";
    };
    
    util.hideLoading = function() {
        document.getElementById("IntalioInternal_loading").style.visibility = "hidden";
        util.undimForm();
    };
    
    util.dimForm = function() {
        util.hideForm();
    };

    util.undimForm = function() {
        util.showForm();
    };
    
    util.hideForm = function() {
        window.scroll(0,0);
        document.getElementById("IntalioInternal_jsxmain").style.visibility = "hidden";
    };

    util.showForm = function() {
        document.getElementById("IntalioInternal_jsxmain").style.visibility = "visible";
    };    
    
    util.showSuccess = function(msg, autoClose) {
        clearTimeout(window.IntalioInternal_success_timer);
        
        var div = document.getElementById("IntalioInternal_success");
        div.innerHTML = msg;
        util.centerDiv(div);
        div.style.visibility = "visible";
        
        if (autoClose === true) {
            window.IntalioInternal_success_timer = setTimeout("Intalio.Internal.Utilities.hideSuccess()", 5000);
        }
    };
    
    util.hideSuccess = function() {
        document.getElementById("IntalioInternal_success").style.visibility = "hidden";
    };

    util.centerDiv = function(div) {
        var divWidth = document.getElementById("IntalioInternal_jsxmain").offsetWidth;
        var locX = (divWidth - div.offsetWidth) / 2;
        div.style.left = locX;
    };
    
    // simple XSL to tidy up the network in/out XML, mostly for logging 
    util.tidy = function(xmlDoc) {
        if (xmlDoc == null) return "null";
        
        var strXSLCacheId = "IntalioInternal_Tidy_xsl";
        var strXSLURL = util.SERVER.resolveURI("IntalioInternal/Tidy.xsl");
        var objXSL = util.SERVER.getCache().getOrOpenDocument(strXSLURL, strXSLCacheId);
 
        var objTemplate = new jsx3.xml.Template(objXSL); 
        return "\n" + objTemplate.transformToObject(xmlDoc) + "\n";
    };
    
    util.trim = function(str, chars) {
        return util.ltrim(util.rtrim(str, chars), chars);
    };

    util.ltrim = function(str, chars) {
        chars = chars || "\\s";
        return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
    };

    util.rtrim = function(str, chars) {
        chars = chars || "\\s";
        return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
    };    
    
    util.fixCheckboxOutput = function(objCheckbox) {
        if (objCheckbox == null) {
            return "false";   
        }
        
        if (!objCheckbox.instanceOf(jsx3.gui.CheckBox)) {
            return "false";   
        }

        if (objCheckbox.getChecked()) {
            return "true";   
        }
        
        return "false";
    };

    util.fixCheckboxInput = function(objCheckbox, valBool) {
        if (objCheckbox == null) {
            return;   
        }
        
        if (!objCheckbox.instanceOf(jsx3.gui.CheckBox)) {
            return;   
        }        
        
        objCheckbox.setValue(valBool);
    }
    
    util.fixCheckboxOutputMatrix = function(valBool) {
        if (valBool == null) {
            return "false";   
        }
        
        if (valBool == 1 || valBool == "true") {
            return "true";   
        }
        
        return "false";
    };
    
    util.fixCheckboxInputMatrix = function(valBool) {
        if (valBool == null) {
            return "0";
        }
        
        if (valBool == 1 || valBool == "true") {
            return "1";   
        }
        
        return "0";
    };
    
    // form data sent to the server
    util.fixDateOutput = function(objDate) {
        if (objDate == null) {
            return "";
        }
        
        var date = objDate.getDate();
        if (date == null) {
            return "";
        }
        
        var stamp = date.valueOf();
        
        return util.fixDateOutputMatrix(stamp);
    };
    
    // form data received from the server
    util.fixDateInput = function(objDate, dateStr) {
        if (objDate == null || dateStr == null || dateStr == "") {
            return;   
        }
        var stamp = util.fixDateInputMatrix(dateStr);
        var date = new Date();
        date.setTime(stamp);
        
        objDate.setDate(date);
    };
    
    // form data sent to the server
    util.fixDateOutputMatrix = function(dateInt) {
        if (dateInt == null) {
            return "";   
        }
        
        var date = new Date();
        date.setTime(dateInt);
        
        var year = date.getFullYear();
        var month = parseInt(date.getMonth(), 10) + 1;
        var day = parseInt(date.getDate(), 10);
        
        if (month < 10) {
            month = "0" + month;   
        }
        
        if (day < 10) {
            day = "0" + day;   
        }
        
        return year + "-" + month + "-" + day;
    };
    
    // form data received from the server
    util.fixDateInputMatrix = function(dateStr) {
        if (dateStr == null || dateStr == "") {
			//previosly returned zero
            //returning a empty string prevents the display of 1970-1-1 which is the epoch
			return "";			
        }
        
        var parts = dateStr.split("-");
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var day = parseInt(parts[2], 10);
        
        var date = new Date();
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        
        return date.valueOf();
    };
    
    // form data sent to the server
    util.fixTimeOutput = function(objTime) {
        if (objTime == null) {
            return "";
        }
        
        var date = objTime.getDate();
        if (date == null) {
            return "";   
        }
        
        var stamp = date.valueOf();
        
        return util.fixTimeOutputMatrix(stamp);
    };

    // form data sent to the server
    util.fixTimeOutputMatrix = function(timeInt) {
        if (timeInt == null) {
            return "";   
        }
        
        var date = new Date();
        date.setTime(timeInt);
        
        var hour = date.getHours();
        var mins = date.getMinutes();
        var secs = date.getSeconds();
        var millis = date.getMilliseconds();
        
        if (hour < 10) {
            hour = "0" + hour;   
        }
        
        if (mins < 10) {
           mins = "0" + mins;   
        }
        
        if (secs < 10) {
           secs = "0" + secs;   
        }
      
        return hour + ":" + mins + ":" + secs + "." + millis;
    };
    
    // form data received from the server
    util.fixTimeInput = function(objTime, timeStr) {        
        if (objTime == null || timeStr == null || timeStr == "") {
            return;   
        }

        var stamp = util.fixTimeInputMatrix(timeStr);
        var date = new Date();
        date.setTime(stamp);
        
        objTime.setDate(date);
    };
    
    // form data received from the server
    util.fixTimeInputMatrix = function(timeStr) {
        if (timeStr == null || timeStr == "") {
            return 0;
        }
        
        var hour = 0;
        var mins = 0;
        var secs = 0;
        var millis = 0;
        
        var parts = timeStr.split(":");
        
        // hour
        if (parts.length > 0) {
            hour = parts[0];
        }
        
        // minutes
        if (parts.length > 1) {
            mins = parts[1];   
        }
        
        // seconds
        if (parts.length > 2) {
            secs = parts[2];
            var secParts = secs.split(".");
            if (secParts.length > 0) {
                secs = secParts[0];    
            }
            
            // millis
            if (secParts.length > 1) {
                millis = secParts[1];
            }            
        }
        
        var date = new Date();
        date.setHours(hour);
        date.setMinutes(mins);
        date.setSeconds(secs);
        date.setMilliseconds(millis);
        
        return date.valueOf();        
    };
    
    util.getProperty = function(propertyName,defaultVal){
	var prop = null;
	try{
	    prop = util.SERVER.getProperties().get(propertyName);
	}catch(e){
	    //nothing to do
	}
	if(!prop) prop = defaultVal;
	return prop;
    };

    util.getErrorOperationError = function() {
        var error = util.getProperty("Operation Failed Error","Operation '{0}' failed.  The HTTP Status code is: {1}");
        if (window.IntalioInternal_ErrorOperationError) {
            error = window.IntalioInternal_ErrorOperationError;
        }          
        return error;        
    };
    
    util.getErrorOperationInvalid = function() {
        var error = util.getProperty("Operation Invalid Error","Operation '{0}' failed.  The message failed validation.");
        if (window.IntalioInternal_ErrorOperationInvalid) {
            error = window.IntalioInternal_ErrorOperationInvalid;
        }          
        return error;        
    };
    
    util.getErrorOperationTimeout = function() {
        var error = util.getProperty("Operation Timeout Error","Operation '{0}' failed.  The operation timed out.");
        if (window.IntalioInternal_ErrorOperationTimeout) {
            error = window.IntalioInternal_ErrorOperationTimeout;
        }          
        return error;        
    };
    
    util.getErrorLoggingException = function() {
        var error = util.getProperty("Logging Error","An exception occurred while logging a previous exception.");
        if (window.IntalioInternal_ErrorLoggingException) {
            error = window.IntalioInternal_ErrorLoggingException;
        }          
        return error;        
    };

    util.getErrorMissingTaskType = function() {
        var error = util.getProperty("Task Type Parameter Missing Error","The task type parameter is missing.");
        if (window.IntalioInternal_ErrorMissingTaskType) {
            error = window.IntalioInternal_ErrorMissingTaskType;
        }          
        return error;        
    };
    
    util.getErrorMissingPath = function() {
        var error = util.getProperty("Path Parameter Missing Error","The path parameter is missing.");
        if (window.IntalioInternal_ErrorMissingPath) {
            error = window.IntalioInternal_ErrorMissingPath;
        }          
        return error;        
    };

    util.getErrorMissingAssembly = function() {
        var error = util.getProperty("Assembly Parameter Missing Error","The assembly parameter is missing.");
        if (window.IntalioInternal_ErrorMissingAssembly) {
            error = window.IntalioInternal_ErrorMissingAssembly;
        }          
        return error;        
    };

    util.getErrorMissingForm = function() {
        var error = util.getProperty("Form Parameter Missing Error","The form parameter is missing.");
        if (window.IntalioInternal_ErrorMissingForm) {
            error = window.IntalioInternal_ErrorMissingForm;
        }          
        return error;        
    };        

    util.getErrorInvalidResponse = function() {
        var error = util.getProperty("Invalid Response Error","The server sent an invalid response.");
        if (window.IntalioInternal_ErrorInvalidResponse) {
            error = window.IntalioInternal_ErrorInvalidResponse;
        }          
        return error;        
    };        
    
    util.getErrorUploadingFile = function() {
        var error = util.getProperty("File Upload Error","There was a problem uploading the file: {0}");
        if (window.IntalioInternal_ErrorUploadingFile) {
            error = window.IntalioInternal_ErrorUploadingFile;
        }          
        return error;        
    };        
    
    util.getErrorIncompleteMatrix = function() {
        var error = util.getProperty("Incomplete Matrix Error","The form has an incomplete matrix field.");
        if (window.IntalioInternal_ErrorIncompleteMatrix) {
            error = window.IntalioInternal_ErrorIncompleteMatrix;
        }          
        return error;        
    };        

    util.getErrorIncompleteField = function() {
        var error = util.getProperty("Incomplete Field Error","Incomplete form field: {0}");
        if (window.IntalioInternal_ErrorIncompleteField) {
            error = window.IntalioInternal_ErrorIncompleteField;
        }          
        return error;        
    };
    
    util.getLoadingText = function() {
        var msg = util.getProperty("Loading Text","Sending request, please wait...");
        if (window.IntalioInternal_LoadingText) {
            msg = window.IntalioInternal_LoadingText;
        }
        return msg;        
    }; 
    
    util.getCloseButtonText = function() {
        var msg = util.getProperty("Close Button","Close");
        if (window.IntalioInternal_CloseButtonText) {
            msg = window.IntalioInternal_CloseButtonText;
        }
        return msg;        
    }; 
    
    util.getSaveSuccessText = function() {
        var msg = util.getProperty("Save Success Text","The task was successfully saved.");
        if (window.IntalioInternal_SaveSuccessText) {
            msg = window.IntalioInternal_SaveSuccessText;
        }
        return msg;        
    };     
    
    util.getClaimSuccessText = function() {
        var msg = util.getProperty("Claim Success Text","The task was successfully claimed.");
        if (window.IntalioInternal_ClaimSuccessText) {
            msg = window.IntalioInternal_ClaimSuccessText;
        }
        return msg;        
    };  

    util.getRevokeSuccessText = function() {
        var msg = util.getProperty("Revoke Success Text","The task was successfully revoked.");
        if (window.IntalioInternal_RevokeSuccessText) {
            msg = window.IntalioInternal_RevokeSuccessText;
        }
        return msg;        
    };  
  }
);
// end package

///////////////////
// Communication //
///////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.Communication",
  function(com) {
      
      com.sendRequest = function(mapping, operation, onSuccess, onTimeOut) {
          var tout = com.getFormTimeout();
          jsx3.log("form timeout: " + tout);
          
          var path = com.getPath();
          if (path == null) {
              var msg = Intalio.Internal.Utilities.getErrorMissingPath();
              Intalio.Internal.Utilities.displayError(msg);               
              return;    
          }
          
          var assembly = com.getAssembly(path);
          if (assembly == null) {
              var msg = Intalio.Internal.Utilities.getErrorMissingAssembly();
              Intalio.Internal.Utilities.displayError(msg);
              return;    
          }

          var form = com.getForm(path);
          if (form == null) {
              var msg = Intalio.Internal.Utilities.getErrorMissingForm();
              Intalio.Internal.Utilities.displayError(msg);
              return;
          }
          
          var service = Intalio.Internal.Utilities.SERVER.loadResource(mapping);
          service.setOperationName(operation);
          var message = service.getServiceMessage();
          
          jsx3.log(operation + " request: " + Intalio.Internal.Utilities.tidy(message));
          message = "assembly=" + assembly + "&form=" + form + "&message=" + encodeURIComponent(message);          
          
          var request = new jsx3.net.Request();
          request.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, onSuccess);
          request.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, onTimeOut);
          
          request.open("POST", "/gi/validation", true);
          request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");     
          request.send(message, tout);
      };
      
      com.getPath = function() {
          var giAppPath = "/gi/apppath/";
          var url = Intalio.Internal.Utilities.getFormUrl();
          var uri = new jsx3.net.URI(url);
          var path = uri.getPath();
          
          if (path.indexOf(giAppPath) == 0 && path.length >= giAppPath.length) {
              return path.substr(giAppPath.length);
          }

          return null;
      };
      
      com.getAssembly = function(path) {
          var idx = path.indexOf("/");
          if (idx > 0) {
              return path.substring(0, idx);
          }
          
          return null;
      }
      
      com.getForm = function(path) {
          var idx_1 = path.indexOf("/");
          if (idx_1 > 0) {
              var idx_2 = path.indexOf("/IntalioInternal/", idx_1 + 1);
              if (idx_2 > idx_1 + 1) {
                  return path.substring(idx_1 + 1, idx_2);
              }
          }
          
          return null;
      };
      
      com.getPayload = function(response) {
          var payload = null;
          var invalid = false;
          
          var statusNode = response.selectSingleNode("/response/status");
          if (statusNode == null) {
              invalid = true;
          } else {
              var status = statusNode.getValue();
              if (status == "success") {
                  var node = response.selectSingleNode("/response/payload");
                  if (node == null) {
                      invalid = true;
                  } else {
                      payload = new jsx3.xml.Document();
                      payload.loadXML(node.getFirstChild());
                  }
              } else {
                  var messageNode = response.selectSingleNode("/response/message");
                  if (messageNode == null) {
                      invalid = true;
                  } else {
                      var msg = messageNode.getValue();
                      Intalio.Internal.Utilities.displayError(msg);
                  }
              }
          }
          
          if (invalid) {
              var msg = Intalio.Internal.Utilities.getErrorInvalidResponse();
              Intalio.Internal.Utilities.displayError(msg);              
          }
          
          return payload;
      };
      
      com.getFormTimeout = function() {
          var tout = 300000;
          if (window.IntalioInternal_form_timeout) {
            tout = window.IntalioInternal_form_timeout;
          }          
          return tout;
      };
  }
);
// end package

/////////////////
// File Upload //
/////////////////
jsx3.lang.Package.definePackage(
  "Intalio.Internal.FileUpload",
  function(upload) {
	  upload.CONTROLS = null; 
      
	 upload.checkFileUploads = function(action) {
		 window.IntalioInternal_FileUpload_action = action;
		 a = Intalio.Internal.Utilities.SERVER.getRootBlock().getDescendantsOfTypeNew('com.intalio.ria.FileUpload');
		 if(!a || (a && !a.length)){
			upload.executeAction();
			return;
		 }
		
		 a = a.filter(function(control){
		 if (control.isCandidateForUpload()) {
				return true;
			}
			return false;
		 });
		 
		 if (jsx3.$A.is(a) && a.length) {
			upload.doUpload().when(function(){
				upload.executeAction();
			});
		 } else {
			upload.executeAction();
		 }
      };
	  
	  upload._finish = function(){};
	  
	  
	  upload.doUpload = jsx3.$Y(function(cb){
	  	//retrun value does not matter
		//it only matters whether we call the done() 
		//method on the callback object passed as the only argument
	  	var a = cb.args();
		if (jsx3.$A.is(a) && a.length) {
			a = jsx3.$A(a);
			//filtering out controls that are not file upload components
			a = a.filter(function(control){
				return control.isType("com.intalio.ria.FileUpload") && control.isCandidateForUpload();
			});
		}
		else {
			a = Intalio.Internal.Utilities.SERVER.getRootBlock().getDescendantsOfTypeNew('com.intalio.ria.FileUpload');
			if(!a || (a && !a.length)) return;
			
			a = a.filter(function(control){
				if (control.isCandidateForUpload()) {
					return true;
				}
				return false;
			});
		}
		if (jsx3.$A.is(a) && a.length) {
			upload.CONTROLS = jsx3.$A(a);
			upload._finish = function(){
				upload._finish = function(){};
				cb.done();
			};
			upload.submitNextFile();
		}
	  });
	  
      upload.executeAction = function() {
          var action = window.IntalioInternal_FileUpload_action;          
          jsx3.log("executing action: " + action);  
          if (action == "initProcess") {
              Intalio.Internal.TMS.callInitProcessActual();
          } else if (action == "setOutput") {
              Intalio.Internal.TMS.callSetOutputActual();
          } else if (action == "completeTask") {
              Intalio.Internal.TMP.callCompleteTaskActual();
          }
      };
      
      upload.submitNextFile = function() {
		  if(upload.CONTROLS && upload.CONTROLS.length){	  	
		  	//set participant token value and then submit the last form
			upload.CONTROLS[upload.CONTROLS.length-1].setParticipantToken(Intalio.Internal.Utilities.getParticipantToken());
		  	upload.CONTROLS[upload.CONTROLS.length-1].submit();
			return;
		  }else{
		  	//upload.executeAction();
			upload._finish();
		  }
      };
      
      upload.callComplete = function(result) {
          jsx3.log("file upload complete: " + result);
          if (result != null && result.indexOf("OK: ") == 0) {
			if(upload.CONTROLS){
				var control = upload.CONTROLS.pop();
		  		var url = result.substr(result.indexOf('http://'));
		  		control.setURL(url);	
			} 
              upload.submitNextFile();
          } else {
              Intalio.Internal.Utilities.hideLoading();
              Intalio.Internal.Utilities.activateButtons();
              
              var msg = Intalio.Internal.Utilities.getErrorUploadingFile();
              msg = msg.replace("{0}", result);
              Intalio.Internal.Utilities.displayError(msg);              
          }
      };
  }
);
// end package

