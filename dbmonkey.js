// ==UserScript==
// @name         DB Monkey
// @namespace    https://db.datarecovery.com
// @version      0.4
// @description  DB quality of life improvements!
// @author       Alex Sweet
// @match        https://db.datarecovery.com/*
// @updateUrl    https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/dbmonkey.js
// @downloadUrl  https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/dbmonkey.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue

// ==/UserScript==

salmon = '#ff7070';

var emailInquiry = {};
var path = "";
var root = window.location.host;

function AddCaseToWatchList(caseNumber, note)
{
    var watchedCases = GM_getValue("watchedCases");
    if (watchedCases == undefined)
    {
        watchedCases = []
    }
    newCase = {}
    // Make sure this case isn't in the list already
    for (i = 0; i < watchedCases.length; i++)
    {
        if (watchedCases[i].caseNumber == caseNumber)
        {
            return;
        }
    }
    newCase.caseNumber = caseNumber;
    newCase.note = note;
    watchedCases.push(newCase);
    GM_setValue("watchedCases", watchedCases);
}

function RemoveCaseFromWatchList(caseNumber)
{
    var watchedCases = GM_getValue("watchedCases");
    if (watchedCases == undefined)
    {
        return;
    }
    for (i = 0; i < watchedCases.length; i++)
    {
        if (watchedCases[i].caseNumber == caseNumber)
        {
            watchedCases.splice(i, 1);
        }
    }
    GM_setValue("watchedCases", watchedCases);
}
$(function () {

    path = window.location.pathname;
    if (path == "/" || path == "" || path.indexOf("index.jsp") != -1) //Home page
    {
        monkeyPane = $('<div class="home_grid_block3_cell" style="background-color: #ff7070;" ><h3>DB Monkey</h3></div>').prependTo(".home_grid_divrow");
        emailInquiryButton = $('<a href="#">New Email Case</a>');
        emailInquiryComment = $('<div style="display: inline-block; vertical-align: middle;" class="ui-state-default ui-corner-all" id="q_nav1_button"> <span class="ui-icon ui-icon-comment"></span>  </div>');

        $(monkeyPane).append(emailInquiryButton);
        $(emailInquiryButton).after(emailInquiryComment);
        $(emailInquiryComment).css({
            "margin-left": "5px"
        });
        $(emailInquiryComment).click(function () {
            alert('When you get a new case by email, send the "Got it" message as usual. Then, copy all the content of the "Got it" email you just sent (it contains the senders name and email). Click "New Email Case" and paste the email into the alert box. It will try and parse information from the email and apply it to a new case. Always double check the information before finalizing the case!');

        });
        emailInquiryButton.click(function () {
            wdPrompt = prompt("Paste the inquiry email here.");
            if (wdPrompt) {
                if (wdPrompt.toLowerCase().indexOf("got it") === -1)
                {
                    gotitPrompt = window.confirm('Didn\'t detect "Got it!" in your email; are you sure this is the "Got it!" email?')
                    if (!gotitPrompt)
                    {
                        return;
                    }
                }

                emailInquiry.active = true;
                //Get phone number with RegEx pattern
                phoneRegEx = /(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *x(\d+))?\b/;
                phone = phoneRegEx.exec(wdPrompt);
                validPhone = false;
                if (phone != undefined && phone[0] != undefined)
                {
                    validPhone = true;
                    phone = phone[0];
                    phone = phone.replace(/\D/g,'');
                }
                if (validPhone)
                {
                    emailInquiry.phone = phone;
                }
                //Try and find email
                fromIndex = wdPrompt.indexOf("From:") + 6;
                sentIndex = wdPrompt.indexOf(" Sent:");
                if (wdPrompt.indexOf("WD Inquiry") != -1)  // Check if this a WD referral
                {
                    emailInquiry.wdReferral = true;
                }
                if (fromIndex != -1 && sentIndex != -1) //Make sure the email contains valid from/sent text
                {
                    fromText = wdPrompt.substring(wdPrompt.indexOf("From:") + 6, wdPrompt.indexOf(" Sent:"));
                    var sepCharIndex = fromText.indexOf("<"); // Check to see if the email is enclosed in <>
                    var sepChar = "<";
                    if (sepCharIndex == -1) {
                        sepCharIndex = fromText.indexOf("["); // Check to see if the email is enclosed in []
                        sepChar = "[";
                    }
                    if (sepCharIndex != -1) //Make sure a [ or a < was found
                    {
                        fullName = fromText.substring(0, sepCharIndex);
                    }
                    if (fullName)  // Make sure a name was found
                    {
                        var commaIndex = fullName.indexOf(',');
                        if (commaIndex != -1) //Check if the name is in the format last, first
                        {
                            lastName = fullName.substring(0, commaIndex);
                            firstName = fullName.substring(commaIndex + 2, fullName.length);
                        }
                        else //No comma in the name
                        {
                            spaceIndex = fullName.indexOf(' ');
                            if (spaceIndex != -1) {
                                firstName = fullName.substring(0, spaceIndex);
                                lastName = fullName.substring(spaceIndex, fullName.length);
                            }
                        }
                        firstName = $.trim(firstName);
                        lastName = $.trim(lastName);
                        emailInquiry.firstName = firstName;
                        emailInquiry.lastName = lastName;
                    }
                    email = fromText.substring(sepCharIndex + (sepChar == "<" ? 1 : 8), fromText.length - 1);
                    if (email) {
                        emailInquiry.email = email;
                    }

                    if (email == fullName) {
                        emailInquiry.firstName = "";
                        emailInquiry.lastName = "";
                    }
                    subjectIndex = wdPrompt.indexOf("Subject:", fromIndex);
                    scenario = wdPrompt.substring(subjectIndex, wdPrompt.length);
                    emailInquiry.scenario = scenario;

                }
                GM_setValue("emailInquiry", emailInquiry);
                window.location.href = ("/add_client_1.jsp");
            }
        });
    }


    else if (path.indexOf("add_client") != -1) //Add client page
    {
        emailInquiry = GM_getValue("emailInquiry");
        if (emailInquiry != undefined && emailInquiry.active) {
            $("country_input").val("USA").trigger("change"); // Set country to USA by default
            $("#client_type_input").val("individual").trigger("change");  //Change client type
            if (emailInquiry.firstName && emailInquiry.lastName) //Add client's name 
            {
                $("#company_input").val(emailInquiry.lastName + ", " + emailInquiry.firstName).trigger("change");
            }
            else {
                $("#company_input").val("need, need").trigger("change");
            }

            

            if (emailInquiry.email) //Se the client's email
            {
                $("#email_input").val(emailInquiry.email).trigger("change");
            }
            else {
                $("#email_input").val("need@need.need").trigger("change");
            }
            if (emailInquiry.phone)
            {
                $("#phone1_input").val(emailInquiry.phone).trigger("change");  // Set the phone number
            }
            else
            {
                $("#phone1_input").val("0000000000").trigger("change");  // Set the phone number
            }
            $("#city_input").val("need").trigger("change");  // Set the client's city
            $("#state_input").val("APO - AA").trigger("change"); //Set the client's state

            $("#refer_by_input").val((emailInquiry.wdReferral ? "Western Digital" : "Google")).trigger("change");  // Set the referred by value

            emailInquiry.active = false;
            GM_setValue("emailInquiry", emailInquiry);
        }
    }

    else if (path.indexOf("new_case") != -1) //Add case page
    {     
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        function Reset()
        {
            $("#serv_pick_attr1").val("").trigger("change");
            $("#serv_pick_attr2").val("").trigger("change");
            $("#serv_pick_price_structure").val("").trigger("change");
            $("#serv_pick_priority").val("").trigger("change");
            $("#service_id").val("").trigger("change");
        }
        async function setService(service_id)
        {
            Reset();
            await sleep(200);  // This is needed to let the page update the values from the server
            $("#service_id").val(service_id).trigger("change");
            return;
        }
        function setServiceHardDrive()
        { 
            setService("1");
        }
        function setServiceThumbDrive()
        { 
            setService("51");
        }
        function setServicePhone()
        {
            setService("70");
        }
        $("#case_setup_method").val("phone").trigger("change");  // Change the setup method
        //Service type will default to Standard Hard Drive
        $("#operating_system_id").val("Unknown").trigger("change");  // Change the OS to Uknown
        $("#return_media_id").val("Client Will Decide Later").trigger("change");  // Change RM  
        
         //Service type shortcut buttons
        shortcuts = $(`
                <tr >
                    <th style="display: flex; justify-content: space-between;">
                        <button type="button" id="hardDriveButton">Single Hard Drive</button>
                        <button type="button" id="thumbDriveButton">Thumb Drive</button>
                        <button type="button" id="phoneButton">Mobile Phone</button>
                    </th>
                </tr>
        `);
        $("#new_case_form > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1)").after(shortcuts);
        $("#hardDriveButton").on("click", setServiceHardDrive);
        $("#thumbDriveButton").on("click", setServiceThumbDrive);
        $("#phoneButton").on("click", setServicePhone);
    }

    else if (path.indexOf("view_case") != -1)  // View case page
    {
        var caseNumber = $('#nav1_case > table > tbody > tr > td:nth-child(1) > a').text().replace(/\s/g,'');
        watchCaseButton = $(`
        <div>
            <button type="button" style="">Watch this case</button>
            </div>
        `)

       $('#flagColorRadioGroup').append(watchCaseButton);
       caseWatchNote = $(`<textarea style="width: 140px; height: 80px" id="caseWatchNote"></textarea>`);
       watchCaseButton.before(caseWatchNote);
   
       watchCaseButton.click(function(){
        $("body > div:nth-child(12) > div.ui-dialog-titlebar.ui-widget-header.ui-corner-all.ui-helper-clearfix > button").trigger("click");
           AddCaseToWatchList(caseNumber, caseWatchNote.val());
      });
    }
    
    

    //  Case Watcher
    var watchDialogVals = GM_getValue("watchDialogVals");
    
    watchButton = $(`
    <td style="vertical-align: inherit;">
        <button type="button">Case Watch</button>
    </td>
        
    `);
    watchDialog = $(`
        <div id="watchDialog">
            <ul style="list-style-type: none; padding: 0;display: flex; flex-direction: column;flex-wrap: wrap;" id="caseWatchList">
            </ul>
        </div>
    `);
    $(watchDialog).dialog({
        autoOpen: false,
        title: "Case Watch",
        width: 166
      });
    $(".nav1left").after(watchButton);
    $(watchDialog).on("dialogclose", function (event, ui)
    {
        dialogPos = watchDialog.dialog( "option", "position" );
        dialogSize = [ watchDialog.dialog( "option", "width" ),  watchDialog.dialog( "option", "height" )]
        GM_setValue("dialogPos", dialogPos);
        GM_setValue("dialogSize", dialogSize);
    });

    openWatch = (function(){
        if (watchDialog.dialog("isOpen") == true)
        {
            return;
        }
        $(watchDialog).css("width", "auto");//////////////////
        $("#caseWatchList").empty();
        watchedCases = GM_getValue("watchedCases");
        watchDialog.dialog('open');
        $(watchDialog.prev().children()[1]).blur();
        dialogPos = GM_getValue("dialogPos");
        if (dialogPos == undefined)
        {
            dialogPos = [0, 0];
        }
        watchDialog.dialog("option", "position", dialogPos);
        dialogSize = GM_getValue("dialogSize");
        if (dialogSize == undefined)
        {
            dialogSize = [280, 150];
        }
        watchDialog.dialog( "option", "width", dialogSize[0]);
        watchDialog.dialog( "option", "height", dialogSize[1]);
        if (watchedCases == undefined)
        {
            watchedCases = []
        }
        if (watchedCases.length == 0)
        {
            $("#caseWatchList").append('<li style="margin: 0;">No cases being watched!</li>');
        }
        else
        {
            for (i = 0; i < watchedCases.length; i++)
            {
                deleteButton = $('<span style="display:inline-flex" class="ui-icon ui-icon-closethick"></span>');
                var listItem = $(`
                    <li style="margin: 0; white-space: nowrap">
                    <span style="display:inline-flex">` + watchedCases[i].caseNumber + `</span>
                    <span style="margin-left: 20px;background-color: coral; display:inline-flex">` + watchedCases[i].note + `</span>
                    </li>
                `)
                listItem.prepend(deleteButton);
                deleteButton.click(function(e){
                    var toDelete = ($(this).next().text());
                    RemoveCaseFromWatchList(toDelete);
                    $(e.target).parent().remove();
                    c
                    watchedCases = GM_getValue("watchedCases");
                })

                $("#caseWatchList").append(listItem);
            }
        }
        
    });
    watchButton.click(openWatch);
});