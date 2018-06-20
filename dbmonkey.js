// ==UserScript==
// @name         DB Monkey
// @namespace    https://db.datarecovery.com
// @version      0.19
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

templates = {
    "Q1": [
        ["Initial contact letter", `Dear {FIRST_NAME},

We received your online data recovery request, and I'm here to answer your questions and guide you through our process. The next step is to ship your device to our laboratory for a free evaluation. If you're within driving distance, you can also drop off your case in person. 
            
You should have received a case setup letter, which includes a case ID number, shipping instructions, and our contact information. Note that we provide free expedited shipping labels to get your case here quickly. This label will come in a separate email from UPS.
            
After we receive and evaluate your case, we'll provide a detailed analysis with an estimated turnaround time, chance of recovery, and a price quote. Data recovery costs start around $400, but vary considerably depending on the complexity of the case. 
            
You're under no obligation to proceed with recovery after receiving the quote. If you decline our recovery services, we will ship back your drive at our expense. If you approve our quote, you will only pay if the recovery is successful. 
            
To finalize your case setup, please email me at this address or call me at the number listed below to provide some more information. I can also answer any questions you have about the case process or our recovery capabilities.  
            
Best regards,`],

        ["Initial contact letter (WD variation)", `Dear {FIRST_NAME},

We received your online data recovery request, and I'm here to answer your questions and guide you through our process. The next step is to ship your device to our laboratory for a free evaluation. If you're within driving distance, you can also drop off your case in person. 
            
You should have received a case setup letter, which includes a case ID number, shipping instructions, and our contact information. Note that we provide free expedited shipping labels to get your case here quickly. This label will come in a separate email from UPS.
            
After we receive and evaluate your case, we'll provide a detailed analysis with an estimated turnaround time, chance of recovery, and a price quote. Data recovery costs start around $400, but vary considerably depending on the complexity of the case. For our Western Digital customers, single disk recoveries have a maximum price of $990. 
            
As a referral from Western Digital, you'll receive free shipping both ways and a 10% discount off the recovery quote.
            
You're under no obligation to proceed with recovery after receiving the quote. If you decline our recovery services, we will ship back your drive at our expense. If you approve our quote, you will only pay if the recovery is successful. 
            
To finalize your case setup, please email me at this address or call me at the number listed below to provide some more information. I can also answer any questions you have about the case process or our recovery capabilities.  
            
            
Best regards,`],


        ["Label receipt follow up letter", `Hey {FIRST_NAME}, 

I just wanted to thank you for opening a case with us recently. Please confirm receipt of the UPS shipping label. If you have any questions or concerns, please don’t hesitate to reach out. You can reply to this email or give us a call at 800-237-4200.

Best Regards, `],


        ["Client consultation follow up", `Hello {FIRST_NAME}, 

Please provide your full shipping address and phone number, I will email you a free shipping label. Can you also please provide some more details on the failure. What happened, power surge, drive was dropped, just stopped working, etc. Also, please provide a list of critical files to be recovered, example – word, excel, pdf, pictures, videos, etc.

Please feel free to contact me if you have any questions.

Best Regards,`],


        ["Generic follow up letter", `Dear {FIRST_NAME},

We received your request, and once we receive your device, we'll provide a free evaluation to give you a price quote, turnaround estimate, and recoverability assessment. Please follow the shipping instructions in your case setup letter to get started.

If you have any questions or concerns regarding your recovery, please give me a call or an email. If you would not like to proceed with the recovery, let me know and I'll close the ticket. 

Best regards,`],

        ["Closing next week letter", `Hello {FIRST_NAME}, 
        
Just following up one last time here before closing your case. I'm happy to answer any questions you have regarding recoverability or price — alternately, if you've decided not to recover your data, I can close out the ticket so you don't get any more of these messages. 

Please contact me via email or phone if you've made a decision or if you have any questions. 

Best regards,
`],

        ["Final Closing Letter", `Dear {FIRST_NAME},

I haven't been able to get a hold if you, so I'll close your case for now. 

However, if you decide to go through with the data recovery process, I can easily reopen your case. Send me an email or call me at the number below, and I'll import your information so you don't have to fill out any more forms. 

Alternately, you can ship your device to the laboratory listed on your case setup letter. Clearly label the package with your case number, and we'll automatically re-open your ticket. 

I hope you've regained access to your data, but if you're still assessing your options, please feel free to give me a call. I can explain our recovery capabilities or consult with an engineer regarding your case. To reach our general customer service line, call 1-800-237-4200.

https://datarecovery.com/submit.php

Thank you again, and please let me know if I can be of assistance. 

Best regards,`]
    ] //// End of Q1
};

function UpdateFlag(user, caseId, newFlagColor) {
    var action_type = "1";
    var dataString = "" +
        "action_type=" + action_type +
        "&case_id=" + caseId +
        "&user=" + user +
        "&new_flag_color=" + newFlagColor +
        "&new_flag_user=" + user;
    $.ajax({
        type: "GET",
        url: "flagChangeServlet",
        data: dataString,
        dataType: "xml",
        success: function (returnedData) {
            var err_msg_text = $(returnedData).find("err_msg").text();

            if (err_msg_text != '') {
                //we had an error, display err msg and don't reload notes
                alert(err_msg_text);
            } else {
                // No error
            }
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function AddCaseToWatchList(caseNumber, note) {
    var watchedCases = GM_getValue("watchedCases");
    if (watchedCases == undefined) {
        watchedCases = []
    }
    newCase = {}
    // Make sure this case isn't in the list already
    for (i = 0; i < watchedCases.length; i++) {
        if (watchedCases[i].caseNumber == caseNumber) {
            watchedCases[i].note = note; // Although it doesn't need to be re-added, the note can be updated
            GM_setValue("watchedCases", watchedCases);
            return;
        }
    }
    newCase.caseNumber = caseNumber;
    newCase.note = note;
    watchedCases.push(newCase);
    GM_setValue("watchedCases", watchedCases);
}

function RemoveCaseFromWatchList(caseNumber) {
    var watchedCases = GM_getValue("watchedCases");
    if (watchedCases == undefined) {
        return;
    }
    for (i = 0; i < watchedCases.length; i++) {
        if (watchedCases[i].caseNumber == caseNumber) {
            watchedCases.splice(i, 1);
        }
    }
    GM_setValue("watchedCases", watchedCases);
}

function ParseEmailInquiry(wdPrompt) {
    emailInquiry.active = true;
    //Get phone number with RegEx pattern
    phoneRegEx = /(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *x(\d+))?\b/;
    phone = phoneRegEx.exec(wdPrompt);
    validPhone = false;
    if (phone != undefined && phone[0] != undefined) {
        validPhone = true;
        phone = phone[0];
        phone = phone.replace(/\D/g, '');
    }
    if (validPhone) {
        emailInquiry.phone = phone;
    }
    //Try and find email
    fromIndex = wdPrompt.indexOf("From:") + 6;
    sentIndex = wdPrompt.indexOf(" Sent:");
    if (wdPrompt.indexOf("WD Inquiry") != -1) // Check if this a WD referral
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
        if (fullName) // Make sure a name was found
        {
            var commaIndex = fullName.indexOf(',');
            if (commaIndex != -1) //Check if the name is in the format last, first
            {
                lastName = fullName.substring(0, commaIndex);
                firstName = fullName.substring(commaIndex + 2, fullName.length);
            } else //No comma in the name
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

function ShowReminder(reminder) {
    reminderDialog = $(`
        <div title="Reminder!"> 
            <p>Case number ` + reminder.caseNumber + `</p>
            <p>` + reminder.note + `
        </div>
    `);
    reminderDialog.dialog({
        modal: true,
        close: () => {
            GM_setValue('modalOpen', false);
        },
        buttons: {
            Dismiss: function () {
                RemoveReminder(reminder.caseNumber);
                reminderDialog.dialog('close');
            }
        }
    });
}

function RemoveReminder(caseNumber) {
    reminders = GM_getValue('reminders');
    if (reminders == undefined || reminders.length == 0)
        return [];
    var reminderIndex = reminders.findIndex(reminder => {
        return reminder.caseNumber == caseNumber;
    });
    if (reminderIndex != undefined) {
        reminders.splice(reminderIndex, 1);
        GM_setValue('reminders', reminders);
        return reminders;
    }
}

function AddReminder(caseNumber) {
    dialogForm = $(`
        <div id="reminderForm" title="Add reminder">
            <form>
                <label> Case ` + caseNumber + ` </label>
                <label for="note" style="display: block; margin-top:10px;"> Note (optional)</label>
                <input type="text" name="note" id="note" class="text ui-widget-content ui-corner-all">
                
                <div style="display:inline-block; margin: 8px 0px">
                    <label style="margin-top:10px;">Remind me in</label>
                    <input id="spinner" value=1 style="width: 30px; display:inline-block" >
                    <select id="timeUnit">
                        <option selected="selected" value=1>Minutes</option>
                        <option value=60 >Hours</option>
                        <option value=1440 >Days</option>
                    </select>
                </div>
                
                <div style="display:inline-block; margin: 5px 0px">
                    <label for="popupCheckBox">Show me a popup</label>
                    <input type="checkbox" id="popupCheckBox">
                </div>
                <div style="display:inline-block margin: 5px 0px">
                    <label for="flagCheckBox">Flag the case to me</label>
                    <input type="checkbox" name="flagCheckBox" id="flagCheckBox">
                </div>
                <div id="colorPickerDiv" display: hidden>
                    <select id="colorPicker">
                        <option value=1 >Yellow</option>
                        <option value=2 >Orange</option>
                        <option value=3 >Green</option>
                        <option value=4 >Blue</option>
                        <option value=5 >Purple</option>
                        <option value=6 >Red</option>
                        <option value=7 >Black</option>
                        <option value=8 >Pink</option>
                    </select>
                </div>
            </form>
        </div>
    `);

    function UpdateDate() {
        spinnerNum = $("#spinner").val();
        unit = $("#timeUnit").val();
        newDate = new Date();
        newMinutes = newDate.getMinutes() + (spinnerNum * unit);
        newDate.setMinutes(newMinutes);
        return newDate;
    }
    dialog = dialogForm.dialog({
        autoOpen: true,
        height: 350,
        width: 360,
        modal: false,
        buttons: {
            "Add reminder": () => {
                reminders = GM_getValue('reminders');
                if (reminders == undefined) {
                    reminders = []
                }
                //If there is already a reminder for this case, delete it
                reminders = RemoveReminder(caseNumber);
                newReminder = {};
                newReminder.note = dialogForm.find("#note").val();
                newReminder.date = UpdateDate();
                newReminder.flagOption = dialogForm.find("#flagCheckBox").is(":checked");
                newReminder.flagColor = dialogForm.find("#colorPicker").val();
                newReminder.popupOption = dialogForm.find("#popupCheckBox").is(":checked");
                newReminder.caseNumber = caseNumber;

                reminders.push(newReminder);
                GM_setValue('reminders', reminders);
                dialogForm.dialog('close');
            }
        }
    });

    spinner = dialogForm.find("#spinner").spinner({
        stop: UpdateDate
    });
    dialogForm.find("#timeUnit").change(UpdateDate);
    dialogForm.find("#flagCheckBox").change(() => { // When this is checked, give the option to select flag color
        dialogForm.find("#colorPickerDiv").toggle("blind");
    });
    UpdateDate();
}

function CopyToClipboard(value) {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}
$(function () {
    path = window.location.pathname;
    if (path == "/" || path == "" || path.indexOf("index.jsp") != -1) //Home page
    {
        monkeyPane = $('<div class="home_grid_block3_cell" style="background-color: #ff7070;" ><h3>dbMonkey</h3></div>').prependTo(".home_grid_divrow");
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
                if (wdPrompt.toLowerCase().indexOf("got it") === -1) {
                    gotitPrompt = window.confirm('Didn\'t detect "Got it!" in your email; are you sure this is the "Got it!" email?')
                    if (!gotitPrompt) {
                        return;
                    }
                }
                ParseEmailInquiry(wdPrompt);
            }
        });

        // Add documentation link
        docButton = $(`
            <a href = "https://github.com/sweetgiorni/dbmonkey/tree/master">Documentation</a>
        `)
        monkeyPane.append(docButton);
        lastVersion = GM_getValue("lastVersion");
        if (lastVersion == undefined || lastVersion != GM_info.script.version) // Fresh update; show the changelog modal
        {
            GM_setValue("lastVersion", GM_info.script.version);
            dialog = $(`<div id="dialog" title="dbMonkey Update - Version ` + GM_info.script.version + `">
                <ul>
                    <li>Added copy phone number button</li>
                </ul>
            </div>`);
            dialog.dialog({
                modal: true,
                width: "400px"
            });
        }

    } else if (path.indexOf("add_client") != -1) //Add client page
    {
        emailInquiry = GM_getValue("emailInquiry");
        if (emailInquiry != undefined && emailInquiry.active) {
            $("country_input").val("USA").trigger("change"); // Set country to USA by default
            $("#client_type_input").val("individual").trigger("change"); //Change client type
            if (emailInquiry.firstName && emailInquiry.lastName) //Add client's name 
            {
                $("#company_input").val(emailInquiry.lastName + ", " + emailInquiry.firstName).trigger("change");
            } else {
                $("#company_input").val("need, need").trigger("change");
            }



            if (emailInquiry.email) //Se the client's email
            {
                $("#email_input").val(emailInquiry.email).trigger("change");
            } else {
                $("#email_input").val("need@need.need").trigger("change");
            }
            if (emailInquiry.phone) {
                $("#phone1_input").val(emailInquiry.phone).trigger("change"); // Set the phone number
            } else {
                $("#phone1_input").val("0000000000").trigger("change"); // Set the phone number
            }
            $("#city_input").val("need").trigger("change"); // Set the client's city
            $("#state_input").val("APO - AA").trigger("change"); //Set the client's state

            $("#refer_by_input").val((emailInquiry.wdReferral ? "Western Digital" : "Google")).trigger("change"); // Set the referred by value

            emailInquiry.active = false;
            GM_setValue("emailInquiry", emailInquiry);
        }
    } else if (path.indexOf("new_case") != -1) //Add case page OR process new case
    {
        newCasePage = !(path.indexOf("process_new_case") != -1); // True if on new case page, false if on process new online case



        function Reset() {
            $("#serv_pick_attr1").val("").trigger("change");
            $("#serv_pick_attr2").val("").trigger("change");
            $("#serv_pick_price_structure").val("").trigger("change");
            $("#serv_pick_priority").val("").trigger("change");
            $("#service_id").val("").trigger("change");
        }
        async function setService(service_id) {
            Reset();
            await sleep(200); // This is needed to let the page update the values from the server
            $("#service_id").val(service_id).trigger("change");
            return;
        }

        function setServiceHardDrive() {
            setService("1");
        }

        function setServiceThumbDrive() {
            setService("51");
        }

        function setServicePhone() {
            setService("70");
        }

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

        if (newCasePage == true) // Only for standard new case page
        {
            $("#new_case_form > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1)").after(shortcuts);
        } else // Online case processing
        {
            // TODO: Get Mike to add an id to the tables so this selector doesn't need to be stupid long
            $("body > div.main > div.add_client_1 > div:nth-child(2) > fieldset > div > form > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1)").after(shortcuts);
        }
        $("#hardDriveButton").on("click", setServiceHardDrive);
        $("#thumbDriveButton").on("click", setServiceThumbDrive);
        $("#phoneButton").on("click", setServicePhone);

        //////////////////////
        //  Anything past this point is ONLY for the standard new case page
        //
        //
        if (newCasePage != true) {
            return;
        }
        //////////////////////

        $("#case_setup_method").val("phone").trigger("change"); // Change the setup method
        $("#operating_system_id").val("Unknown").trigger("change"); // Change the OS to Uknown
        $("#return_media_id").val("Client Will Decide Later").trigger("change"); // Change RM  




    } else if (path.indexOf("view_case") != -1) // View case page
    {
        var caseNumber = $('#nav1_case > table > tbody > tr > td:nth-child(1) > a').text().replace(/\s/g, '');

        // SIP click to call
        contactHtml = $("#client_loc_info").parent().html();
        phoneStart = contactHtml.indexOf('Phone') + 8;
        phoneEnd = phoneStart
        while (contactHtml[phoneEnd] != 'P') {
            phoneEnd++;
        }
        phoneEnd--;
        phoneNumber = contactHtml.slice(phoneStart, phoneEnd);
        contactHtml = contactHtml.slice(9, phoneStart) + "<a href='sip://" + phoneNumber + "'>" + phoneNumber + "</a>" + contactHtml.slice(phoneEnd, contactHtml.length);
        $("#client_loc_info").parent().html(contactHtml);

        copyPhoneButton = $(`
        <div style="display: inline-block; vertical-align: middle; margin: 0px 3px" class="ui-state-default ui-corner-all">
            <span class="ui-icon ui-icon-copy"></span>
        </div>
        `);

        $("[href='sip://" + phoneNumber + "']").after(copyPhoneButton);

        copyPhoneButton.hover(function (e) {
            copyPhoneButton.addClass("ui-state-hover");

        }, function (e) {
            copyPhoneButton.removeClass("ui-state-hover");
        });

        copyPhoneButton.click(function () {
            CopyToClipboard(phoneNumber);
        });
        watchCaseButton = $(`
        <div>
            <button type="button" style="">Watch this case</button>
            </div>
        `)

        $('#flagColorRadioGroup').append(watchCaseButton);
        caseWatchNote = $(`<textarea style="width: 140px; height: 80px" id="caseWatchNote"></textarea>`);
        watchCaseButton.before(caseWatchNote);

        watchCaseButton.click(function () {
            $("#ui-id-6").next().trigger('click');
            AddCaseToWatchList(caseNumber, caseWatchNote.val());
        });

        // Remind me button
        reminderButton = $(`
        <div style="position: relative; bottom: 0px; margin-top: 30px;">
            <button type="button">Set a reminder</button>
        </div>
        `);
        reminderButton.click(() => {
            $("#ui-id-6").next().trigger('click');
            AddReminder(caseNumber);
        })
        watchCaseButton.after(reminderButton);
        $("#flag_editor_button").click(function () { // When flag button is clicked, don't highlight the first entry
            $("[for=flagUser_0]").removeClass('ui-state-hover ui-state-focus');
        });
        /////////// Case note highlighting
        notesTable = $("#notes_gen_scrollarea>table>tbody").children();
        colors = {
            "yellow": "#fff468",
            "orange": "#ffbe5e",
            "green": "#68ff68",
            "blue": "#75a0ff",
            "purple": "#ed54ff",
            "red": "#ff3030",
            "black": "#3d3d3d",
            "pink": "#ff77e8"
        }
        for (i = notesTable.length - 1; i >= 0; i--) {
            currentRow = $(notesTable[i]).children();
            note = currentRow.last().text();
            if (currentRow.parent().attr("class").indexOf("highlight") != -1) //If this is a highlighted note, leave it alone
            {
                continue;
            } else if (note == "* Item(s) received for case" || note.startsWith("* Case items shipped")) {
                currentRow.css("background-color", colors["purple"]);
            } else if (note.startsWith("* Evaluation completed") || note == '* Recovery result finalized') {
                currentRow.css("background-color", colors["orange"]);
            } else if (note.startsWith("* Evaluation follow-up") || note.startsWith("* Client submitted an approval")) {
                currentRow.css("background-color", colors["pink"]);
            } else if (note == '* Client billed amounts recorded' || note == '* Billing info added') {
                currentRow.css("background-color", colors["green"]);
            }

        }
        /////////// Setup email template things
        emailButton = $(`
        <div style="display: inline-block; vertical-align: middle;" class="ui-state-default ui-corner-all">
            <span class="ui-icon ui-icon-triangle-1-s"></span>
        </div>
        `);

        emailMenu = $(`
            <ul style = "position: absolute; cursor:default" id="qs">
            </ul>
        `);

        function hoverHighlight(target) {
            target.hover(function () {
                target.css({
                    "border": "#003eff",
                    "background": "#007fff"
                });
            }, function () {
                target.css({
                    "border": "#ffffff",
                    "background": "#ffffff"
                });
            });
        }

        for (queue in templates) {
            newQueue = $(`<li class="ui-menu-item"><div style="font-weight: bold; width: 60px; height: 25px;" role="menuitem">` + queue + '</div></li>');
            emailMenu.append(newQueue);
            templateList = $(`<ul style="display: inline-block; padding: 0px;"></ul>`)
            newQueue.append(templateList);
            hoverHighlight(newQueue);
            currentQueue = templates[queue];
            for (template in currentQueue) {
                template = currentQueue[template];
                // Format is ["Summary", "Full email body"]
                newTemplate = $(`<li class="ui-menu-item" style="width: 300px; font-weight: bold"><div style=";">` + template[0] + `</div></li>`);
                hoverHighlight(newTemplate);
                newTemplate.on("click", {
                    currentTemplate: template
                }, function (e) {
                    currentTemplate = e.data.currentTemplate;
                    emailBody = currentTemplate[1];

                    //Get the client's first name
                    clientInfo = $("#client_loc_info").parent().text();
                    start = clientInfo.indexOf("Contact:") + 8;
                    end = clientInfo.indexOf("Location");
                    name = clientInfo.slice(start, end).replace(/^\s+|\s+$/g, '');
                    if (name.startsWith("Mr") || name.startsWith("Ms")) {
                        start = name.indexOf(" ");
                        name = name.slice(start + 1, name.length - start);
                    }
                    lastNameIndex = name.indexOf(" ");
                    firstName = name.slice(0, lastNameIndex);
                    emailBody = emailBody.replace("{FIRST_NAME}", firstName);
                    emailButtonCopy = $("#email_button").clone();
                    href = emailButtonCopy.attr('href');
                    emailBodyEncoded = encodeURIComponent(emailBody);
                    //href += "body=" + emailBody;
                    href += `&body=` + emailBodyEncoded;
                    emailButtonCopy.attr('href', href);
                    if (href.length > 2000) // Too long for mailto?
                    {
                        CopyToClipboard(emailBody);
                        $("#submitNoteNewNote").blur();
                        $(location).attr('href', $("#email_button").attr("href"));
                    } else {
                        $(location).attr('href', href);
                    }
                    if (queue == "Q1") {
                        // Save values for ship in email page
                        GM_setValue("shipInEmail", true);
                        GM_setValue("shipInEmailType", currentTemplate[0]);
                        sleep(500).then(() => {
                            window.location.href = ("/vc_shipin_call.jsp?case_id=" + caseNumber);
                        });
                    }
                });
                templateList.append(newTemplate);
            }
        }
        emailMenu.menu();
        emailMenu.hide();

        emailButton.hover(function (e) {
            emailButton.addClass("ui-state-hover");
            emailMenu.show();

        }, function (e) {
            $(e.target).removeClass("ui-state-hover");
            emailMenu.hide();
        });

        $("#email_button").after(emailButton);
        emailButton.append(emailMenu);
    } else if (path.indexOf("vc_shipin_call") != -1) // Ship in call page
    {
        if (GM_getValue("shipInEmail") == true) {
            GM_setValue("shipInEmail", false);
            shipInEmailType = GM_getValue("shipInEmailType");
            $("#com_method").val(2).trigger("change");
            $("#call_note").val("Sent " + shipInEmailType);
            $('#send_ship_in_email_checkbox').prop('checked', false);
        }
    } else if (path.indexOf("r_user_flags") != -1) // Flagged cases page
    {
        // Get username
        user = $('#nav1 > table > tbody > tr > td.nav1right > span:nth-child(1) > b').text();
        if (String(window.location).endsWith(user)) // Check if we're looking at the current user's cases
        {
            blueMeButton = $(`<button style='margin-top: 10px' type='button'>Blue yourself!</button>`);
            table = $(".qt1 tbody").children();
            table.parent().parent().after(blueMeButton);

            blueMeButton.click(async function () {
                for (i = 0; i < table.length; i++) {
                    clss = $(table[i]).attr('class');
                    if (clss != undefined && clss.startsWith("flag4")) // Is this case flagged blue?
                    {
                        caseNumber = $(table[i]).children(':eq(1)').children(':first').text();
                        UpdateFlag(user, caseNumber, "1")
                    }
                }
                await sleep(1000);
                location.reload();
            })

        }
    } else if (path.indexOf('vc_billing') != -1) // Billing page
    {
        name = $('#nav1_case > table > tbody > tr > td:nth-child(3) > a').text().toLowerCase().trim();
        if (name.startsWith('mr.') || name.startsWith('ms.') || name.startsWith('mrs.')) {
            name = name.slice(name.indexOf(' ') + 1);
        }
        billingName = $('.vc_bill_info tbody :nth-child(2) :nth-child(2)').text().toLowerCase().trim()
        if (name != billingName) {
            alert("Name on the first credit card doesn't match the name on the case! Make sure you get a CC auth form.");
        }
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
    $(watchDialog).dialog({
        "dragStop": function (event, ui) {
            dialogPos = watchDialog.dialog("option", "position");
            dialogSize = [watchDialog.dialog("option", "width"), watchDialog.dialog("option", "height")]
            GM_setValue("dialogPos", dialogPos);
            GM_setValue("dialogSize", dialogSize);
        }
    });
    openWatch = (function () {
        if (watchDialog.dialog("isOpen") == true) {
            return;
        }
        $(watchDialog).css("width", "auto");
        $("#caseWatchList").empty();
        watchedCases = GM_getValue("watchedCases");
        watchDialog.dialog('open');
        $(watchDialog.prev().children()[1]).blur();
        dialogPos = GM_getValue("dialogPos");
        if (dialogPos == undefined) {
            dialogPos = [0, 0];
        }
        watchDialog.dialog("option", "position", dialogPos);
        dialogSize = GM_getValue("dialogSize");
        if (dialogSize == undefined) {
            dialogSize = [280, 150];
        }
        watchDialog.dialog("option", "width", dialogSize[0]);
        watchDialog.dialog("option", "height", dialogSize[1]);
        if (watchedCases == undefined) {
            watchedCases = []
        }
        if (watchedCases.length == 0) {
            $("#caseWatchList").append('<li style="margin: 0;">No cases being watched!</li>');
        } else {
            for (i = 0; i < watchedCases.length; i++) {
                deleteButton = $('<span style="display:inline-flex" class="ui-icon ui-icon-closethick"></span>');
                var listItem = $(`
                    <li style="margin: 0; white-space: nowrap">
                    <a href="https://db.datarecovery.com/view_case.jsp?case_id=` + watchedCases[i].caseNumber + ` " style="display:inline-flex">` + watchedCases[i].caseNumber + `</a>
                    <span style="margin-left: 20px;background-color: coral; display:inline-flex">` + watchedCases[i].note + `</span>
                    </li>
                `)
                listItem.prepend(deleteButton);
                deleteButton.click(function (e) {
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
    watchButton.click(function () {
        if (watchDialog.dialog("isOpen")) {
            watchDialog.dialog("close");
        } else {
            openWatch();
        }
    });
    GM_setValue('modalOpen', false);

    setInterval(function () { // Check remind me list
        var reminders = GM_getValue('reminders'); // Get list of active reminders
        if (reminders == undefined) {
            reminders = [];
        }
        currentDate = new Date();
        reminders.forEach(reminder => {
            // Reminder has properties
            /*
            newReminder.note = $("#note").val();
              newReminder.date = new Date();
              newReminder.flagOption = $("#flagCheckBox").is(":checked");
              newReminder.flagColor = $("#colorPicker").val();
              newReminder.popupOption = $("#popupCheckBox").is(":checked");
              newReminder.caseNumber = caseNumber; */

            //if (reminder.date > currentDate) // Has the date passed? Show reminder
            reminderDate = new Date(reminder.date);
            if ((GM_getValue('modalOpen') != true) && currentDate > reminderDate) {
                if (reminder.flagOption) // Check if "Flag to me" option was checked
                {
                    user = $('#nav1 > table > tbody > tr > td.nav1right > span:nth-child(1) > b').text();
                    UpdateFlag(user, reminder.caseNumber, reminder.flagColor);
                }
                if (reminder.popupOption) // Check if "Show me popup" option was checked
                {
                    GM_setValue('modalOpen', true);
                    ShowReminder(reminder);
                }
            }
        });
    }, 1000 * 3);
});