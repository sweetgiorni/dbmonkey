// ==UserScript==
// @name         DB Monkey
// @namespace    https://db.datarecovery.com
// @version      0.36
// @description  DB quality of life improvements!
// @author       Alex Sweet
// @match        https://db.datarecovery.com/*
// @updateUrl    https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/dbmonkey.js
// @downloadUrl  https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/dbmonkey.js
// @require      https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/ups_api.js
// @require      https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/qz-tray.js
// @require      https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/sha-256.min.js
// @require      https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/rsvp-3.1.0.min.js
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_xmlhttpRequest
// @connect wwwcie.ups.com
// @connect onlinetools.ups.com

// ==/UserScript==


var versionUpdateInfo = ""+
        "<ul>"+
        "    <li>Adjusted all Q4 HDD Updates, Week 1-5</li>"+
        "</ul>";


var emailInquiry = {};
var path = "";
var root = window.location.host;

//Delete old jquery ui script
templates = {
    "Q1": [
        ["Initial contact letter", `Dear {FIRST_NAME},

We received your online data recovery request, and I'm here to answer your questions and guide you through our process. The next step is to ship your device to our laboratory for a free evaluation. If you're within driving distance, you can also drop off your case in person. 
            
You should have received a case setup letter, which includes a case ID number, shipping instructions, and our contact information. Note that we provide free expedited shipping labels to get your case here quickly. This label will come in a separate email from UPS or FedEx.
            
After we receive and evaluate your case, we'll provide a detailed analysis with an estimated turnaround time, chance of recovery, and a price quote. Data recovery costs start around $400, but vary considerably depending on the complexity of the case. 
            
You're under no obligation to proceed with recovery after receiving the quote. If you decline our recovery services, we will ship back your drive at our expense. If you approve our quote, you will only pay if the recovery is successful. 
            
To finalize your case setup, please email me at this address or call me at the number listed below to provide some more information. I can also answer any questions you have about the case process or our recovery capabilities.  
            
Best regards,`],

        ["Initial contact letter (WD variation - $1350)", `Dear {FIRST_NAME},

We received your online data recovery request, and I'm here to answer your questions and guide you through our process. The next step is to ship your device to our laboratory for a free evaluation. If you're within driving distance, you can also drop off your case in person. 
            
You should have received a case setup letter, which includes a case ID number, shipping instructions, and our contact information. Note that we provide free expedited shipping labels to get your case here quickly. This label will come in a separate email from UPS or FedEx.
            
After we receive and evaluate your case, we'll provide a detailed analysis with an estimated turnaround time, chance of recovery, and a price quote. Data recovery costs start around $400, but vary considerably depending on the complexity of the case. For our Western Digital customers, single disk recoveries have a maximum price of $1350. 
            
As a referral from Western Digital, you'll receive free shipping both ways and a 10% discount off the recovery quote.
            
You're under no obligation to proceed with recovery after receiving the quote. If you decline our recovery services, we will ship back your drive at our expense. If you approve our quote, you will only pay if the recovery is successful. 
            
To finalize your case setup, please email me at this address or call me at the number listed below to provide some more information. I can also answer any questions you have about the case process or our recovery capabilities.  
            
            
Best regards,`],


        ["Label receipt follow up letter", `Hey {FIRST_NAME}, 

I just wanted to thank you for opening a case with us recently. Please confirm receipt of the shipping label that was emailed over. If you have any questions or concerns, please donâ€™t hesitate to reach out. You can reply to this email or give us a call at 800-237-4200.

Best Regards, `],


        ["Client consultation follow up", `Hello {FIRST_NAME},

Please provide your full shipping address and phone number so I can email you a free shipping label. Would you also provide some more details on the failure? A power surge, the drive was dropped, it just stopped working, etc. In addition, please provide a list of folder names and locations that contain the most critical files to be recovered. This is to ensure you will only be charged if we recover what you really need, although we will always attempt to get a complete recovery.

Best Regards,`],


        ["Generic follow up letter", `Dear {FIRST_NAME},

We received your request, and once we receive your device, we'll provide a free evaluation to give you a price quote, turnaround estimate, and recoverability assessment. Please follow the shipping instructions in your case setup letter to get started.

If you have any questions or concerns regarding your recovery, please give me a call or an email. If you would not like to proceed with the recovery, let me know and I'll close the ticket. 

Best regards,`],

        ["Closing next week letter", `Hello {FIRST_NAME}, 
        
Just following up one last time here before closing your case. I'm happy to answer any questions you have regarding recoverability or price â€” alternately, if you've decided not to recover your data, I can close out the ticket so you don't get any more of these messages. 

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
    ], //// End of Q1,
    'Billing': [
            ['CC Authorization Form (US)', `Hello {FIRST_NAME},

We received the credit card approval and our engineers are beginning the work to recover the data today. Due to the fact that the name and/or location on the credit card are different from your own name and shipping address, we need this credit card authorization form filled out before we can ship back. Please download the form using the link below, scan in the required documents, fill out the form, scan it and send it back.
            
https://datarecovery.com/wp-content/uploads/2018/06/Credit-Card-Authorization-Form-USA-20160906.pdf
            
Thank you,`],
            ['CC Authorization Form (Canada)', `Hello {FIRST_NAME},

We received the credit card approval and our engineers are beginning the work to recover the data today. Due to the fact that the name and/or location on the credit card are different from your own name and shipping address, we need this credit card authorization form filled out before we can ship back. Please download the form using the link below, scan in the required documents, fill out the form, scan it and send it back.
                        
https://datarecovery.com/wp-content/uploads/2018/06/Credit-Card-Authorization-Form-CANADA-20160906.pdf
                        
Thank you,`]
    ],  // End of Billing
    "Q4":[

['HDD update - Week 1 (Phone call)', `Hello {FIRST_NAME},

We're working hard to recover your data. The engineer assigned to your case has indicated that the process may be more complicated than originally thought, but this does not affect our anticipated final outcome. The downside is that the process will likely take longer than anticipated. As part of our policy, we will not bill you for the additional time required to complete the recovery. I'll try to get back to you within a few days as I receive more information. Please be rest assured that we are working hard on your case and please don't hesitate to reach out if you have concerns or questions.

Best,`],


['HDD update - Week 2 (email)', `Hi {FIRST_NAME},
    
Now that I have more information, I wanted to give you an update. As discussed before, the damage is a little worse than we were able to see from the evaluation.

The engineers are working hard to piece the data back together by pulling data from each platter side. The next step is reassembling the data back into a single volume, preserving all of your folders and files. At first we didn't realize the extent of the damage, which is why we initially estimated a turnaround window of 3-7 business days. Unfortunately, cases like this can take 30 days or more to complete because the process involves long wait times as our equipment carefully works around the damage. In the end, we expect a full recovery of your data. Since we utilize the latest data recovery equipment and technology in our labs, I can assure you that it is not possible to complete the recovery any faster.

This work involves non-linear data retrieval processes so we can’t predict when we’ll be done or even give you a percentage of completion. By example, let's say that we have 50% of the data -this doesn’t mean that we're 50% complete. It may take several weeks to get the next 50% recovered, or it may be tomorrow. This all depends on how quickly our systems can move through the process. I know this can sound confusing, and it is.

At this point, I can't really offer a more detailed update. Thank you so much for your patience. If you have further questions or concerns, please feel free to reach out to me.

Best regards,`],


['HDD update - Week 3 (Phone call)', `Hello {FIRST_NAME},

I wanted to reach back out to let you know that we are still working through the same process that I explained in our previous discussion. I did talk to the engineer and he was adamant that he feels compelled to continue working through the damage despite the tremendous amount of time that this job is taking.

A little more detail -I asked the engineer if we can just stop and see what's been recovered. He explained that this can't be done because the data is not stored sequentially on each platter side. The final piece is to put back together everything that has been recovered. This part takes less than a day of work. When we get to this point, I will definitely let you know.

Again, please don't hesitate to reach out to discuss further. I know it can be frustrating not knowing a definitive completion date -but it would be wrong to give you any sort of timeline. Fewer than 10% of cases take this long, and as more time goes by, that percentage get smaller and smaller. Thanks again for your patience. 

Best regards,`],
        
        
['HDD update - Week 4 (email)', `Hello again {FIRST_NAME},

I wanted to let you know that I checked with the engineer again today, and we've seen significant progress since my last update. We anticipate completion soon. If anything changes, I will let you know right away. Please feel free to reach out if you have questions. 

Best regards,`],


['HDD Update - Week 5 (email)', `Hi {FIRST_NAME}, 

With the last update, I informed you that I thought we'd be finished soon. Obviously we're not quite there yet.

Most of our cases do not take this long, and I'm very sorry that we did not anticipate these issues from the beginning. While we'd definitely like to keep working on your case, it would be understandable if you need to cancel work. In that case, there will be no charge and we can ship your device back in its original condition. Just let me know by email and I can expedite the return.

Hopefully you don't want to cancel though, because we're now at a point where less than 1% of cases take so long to recover. Few of our competitors will work on a single case for more than a two weeks, so I feel that this is your very best chance of recovery.

As discussed previously, we don't charge a dime for the extra labor that's involved in these situations. In addition, I've talked with management and have gotten them to provide a free 4TB portable hard drive for data return.

As always, please feel free to reach out if you'd like to discuss or have any questions at all. Thanks again for your amazing patience. I will be in touch the moment I am able to find out more.

Best,`],
 
        
['Week 6 (President letter)','']
    ] //End of Q4
};

function ShipInCall(caseNumber, note)
{
    shipInCallURL = 'https://db.datarecovery.com/vc_shipin_call.jsp?case_id=' + caseNumber;

    postNoteURL = 'https://db.datarecovery.com/vc_gen.jsp';
    var xhr = new GM_xmlhttpRequest({
        method: 'GET',
        url: shipInCallURL,
        onload: (res) => {
            callForm  = $(res.responseText).find('[name="log_call_2_form"]');
            callForm.find('#call_form').val('async note');
            formData = $(res.responseText).find('[name="log_call_2_form"]').serializeArray();
            (formData[2])['call_note'] = 'textgoeshere';
            postString = '';
            $(formData).each((ind, dict) => {
                if (dict['name'] == 'call_note')
                {
                    dict['value'] = note;
                }
                k = escape(dict['name']).replace(/%20/g, "+");
                v = escape(dict['value']).replace(/%20/g, "+");

                postString += k + '=' + v + '&'; 
            });
            new GM_xmlhttpRequest({
                method: 'POST',
                data: postString,
                url: postNoteURL,
                headers: {
                    'accept-encoding': 'gzip, deflate, br',
                    'content-type': 'application/x-www-form-urlencoded',
                    'referer': shipInCallURL
                }
            });
        }
    });
}

function UpdateFlag(user, caseId, newFlagColor) {
    var action_type = "1";
    var dataString = "" +
        "action_type=" + action_type +
        "&case_id=" + caseId +
        "&user_id=" + user +
        "&new_flag_color=" + newFlagColor +
        "&new_flag_user=" + user;
    $.ajax({
        type: "GET",
        url: "FlagChangeServlet",
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
            dialog = $(`<div id="dialog" title="dbMonkey Update - Version ` + GM_info.script.version + `">` + versionUpdateInfo + `</div>`);
            dialog.dialog({
                modal: true,
                width: "450px"
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
        /*
        //BELOW STUFF ALL ADDED TO MAIN CASESDB CODE
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

        */


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

                    firstName = $('#name_f').text();
                    lastName = $('#name_l').text();
                    
                    emailBody = emailBody.replace("{FIRST_NAME}", firstName);
                    emailButtonCopy = $("#email_button").clone();
                    href = emailButtonCopy.attr('href');
                    emailBodyEncoded = encodeURIComponent(emailBody);
                    href += `&body=` + emailBodyEncoded;
                    emailButtonCopy.attr('href', href);

                    //Special cases go here 

                    if (templates['Q1'].includes(e.data.currentTemplate)) {  // Was a Q1 template clicked on?
                        // Save values for ship in email page
                        GM_setValue("shipInMessage", true);
                        GM_setValue("note", 'Sent ' + currentTemplate[0].toLowerCase());
                        sleep(500).then(() => {
                            window.location.href = ("/vc_shipin_call.jsp?case_id=" + caseNumber);
                        });
                    }
                    // Did they click a template that's actually a phone call? If so, open a dialog instead of email
                    if (currentTemplate[0].indexOf('(Phone call)') != -1)  
                    {
                        scriptDialog = $(`<div id='templateDialog' style='white-space: pre-wrap'>` + emailBody + `</div>`).dialog({
                            'width':'auto',
                            'height':'auto',
                            'title':currentTemplate[0]
                        });
                        (scriptDialog.parent().find('button')).blur();  // Deselect the stupid 'X' button
                        return;
                    }
                    else if (currentTemplate[0].indexOf('(President letter)') != -1)  // Did they click the president letter link in Q4?
                    {
                        $(location).attr('href', 'https://db.datarecovery.com/vc_president_letter_c1.jsp?case_id=' + case_id);
                        return;
                    }

                    // End of special cases; open template
                    if (href.length > 2000) // Too long for mailto?
                    {
                        CopyToClipboard(emailBody);
                        $("#submitNoteNewNote").blur();
                        $(location).attr('href', $("#email_button").attr("href"));
                    } else {
                        $(location).attr('href', href);
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


        //////////////////////////
        //// UPS Shipping Code
        /////////////////////////

        address_forms_html = ` 
        <div id='address_form_container'>
            <div>
                <label style='display: inline-block; margin: 5px 0px'>Contact addresses:</label>
                <select id='address_select'></select>
            </div>
            <label style='display: block'>Contact</label>
            <input type='text' id='contact_form'>
            <label style='display: block'>Email</label>
            <input type='text' id='email_form'>
            <label>Address</label>
            <input type='text' id='street_form'>
            <label style='display: block'>City</label>
            <input type='text' id='city_form'>
            <div style='display: block; margin: 10px 0px'>
                    <label>State</label>
                    <input style='display: inline-block;" type='text' id='state_form'>
                    <label>Zip</label>
                    <input type='text' id='zip_form'>
            </div>
        </div>`

        //Get current lab
        lab = $('.right_top_vc > tbody > tr > *').eq(3).text();
        if (lab.indexOf('Pleasanton') != -1) {
            lab = 'pleasanton';
        } else if (lab.indexOf('Tempe') != -1) {
            lab = 'tempe';
        } else if (lab.indexOf('Edwardsville') != -1) {
            lab = 'edwardsville';
        } else {
            lab = '';
        }

        upsCSS = $(`<style type='text/css'>
            .loader {
                border: 8px solid #f3f3f3; /* Light grey */
                border-top: 8px solid #3498db; /* Blue */
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 2s linear infinite;
                margin: 0 auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>`).appendTo($('head'))

        // Get addresses from location
        var addType = '11';
        var xmlPostUrl = "https://db.datarecovery.com/addAddrCCServlet?addType=" + addType + "&client_loc_id=" + client_loc_id;
        var xhr = new GM_xmlhttpRequest({
            method: 'POST',
            url: xmlPostUrl,
            onload: (res) => {
                ParseAddressResponse(res.responseXML);
            }
        });

        contactAddresses = [];
        contactID = $('input[name="client_contact_id"]').attr('value');
        clientName = $('#name_f').text() + ' ' + $('#name_l').text();
        var addType = '4'; 
        xmlPostUrl = "https://db.datarecovery.com/addAddrCCServlet?addType=" + addType + "&client_contact_id=" + contactID;
        var xhr = new GM_xmlhttpRequest({
            method: 'GET',
            url: xmlPostUrl,
            onload: (res) => {
                ParseAddressResponse(res.responseXML);
            }
        });

        
        

        function ParseAddressResponse(xml)
        {
            $(xml).find('row').each((ind, row) => {
                add1 = $(row).find('[key="add1"]').text();
                add2 = $(row).find('[key="add2"]').text();
                add3 = $(row).find('[key="add3"]').text();
                add4 = $(row).find('[key="add4"]').text();
                city = $(row).find('[key="city"]').text();
                state = $(row).find('[key="state"]').text();
                zipcode = $(row).find('[key="zipcode"]').text();
                country = $(row).find('[key="country"]').text();
                clientName = $('#name_f').text() + ' ' + $('#name_l').text();
                email = $('#email').text();
                contactAddresses.push(new Address(
                    clientName, "",
                    add1 + ' ' + add2 + ' ' + add3,
                    city,
                    state,
                    zipcode, "",
                    country,
                    email));
            });
        }
        function SetAddressFormsFromForm(addr, form) {
            form.find('#contact_form').val(addr.name);
            form.find('#street_form').val(addr.address_line);
            form.find('#city_form').val(addr.city);
            form.find('#state_form').val(addr.state);
            form.find('#zip_form').val(addr.zip);
            form.find('#email_form').val(addr.email);
        }

        function GetCurrentAddressFromForm(form) {
            return new Address(clientName, "", form.find('#street_form').val(), form.find('#city_form').val(), form.find('#state_form').val(), form.find('#zip_form').val(), '', 'US', form.find('#email_form').val());
        }
        upsDialog = $(`
        <div id='ups-dialog' title='UPS Interface'>
            <ul>
                <li><a href="#tabs-1">Return Label</a></li>
                <li><a href="#tabs-2">Outgoing Shipment</a></li>
            </ul>

            <div id='tabs-1'>
                <label>Return To</label>
                <select id='return_to_form'>
                    <option value='edwardsville'>Edwardsville</option>
                    <option value='tempe'>Tempe</option>
                    <option value='pleasanton'>Pleasanton</option>
                </select>
                
                <select style='display:none; width: 95%; margin: 5px 0px'id='service_form'></select>
                <div>
                    <button style='display:inline-block; margin: 5px 0px' type='button' id='verify_button'>Verify</button>
                    <label style='display:inline-block;' id="verify_status"></label>
                </div>

                <div id='candidate_container' style='word-break:  break-word;'>
                    <span>UPS couldn't match your input to a particular address. Here's a list of possible matches.</span>
                    <ul id='candidate_list' style='font-size: 11px; padding: 0px; white-space: pre'>

                    </ul>
                </div>
                <button style='display:none; margin: 5px 0px' type='button' id='confirm_shipment_button' disabled>Send return label</button>
                <label style='display:none' id='label_result'></label>
            </div>

            <div id='tabs-2'>
                <div id='ship_to_radios' style='margin-bottom: 10px;'>
                    <label>Ship To:</label>
                    <label for='client_radio'>Client</label>
                    <input type='radio' id='client_radio'>
                    <label for='lab_radio'>Lab</label>
                    <input type='radio' id='lab_radio'>
                </div>
                <div id='ship_to_lab_div'>
                    <select id='to_lab_select'>
                        <option value='edwardsville'>Edwardsville</option>
                        <option value='tempe'>Tempe</option>
                        <option value='pleasanton'>Pleasanton</option>
                    </select>
                </div>


                <div style='display: block' id='from_lab_div'>
                    <label for='from_lab_select'>Ship from:</label>
                    <select id='from_lab_select'>
                        <option value='edwardsville'>Edwardsville</option>
                        <option value='tempe'>Tempe</option>
                        <option value='pleasanton'>Pleasanton</option>
                    </select>
                </div>
                <select style='display:none; width: 95%; margin: 5px 0px'id='service_form'></select>
                <div>
                    <button style='margin: 5px 0px' type='button' id='verify_button'>Verify</button>
                    <label style='display:inline-block;' id="verify_status"></label>
                </div>

                <div id='candidate_container' style='word-break:  break-word;'>
                    <span>UPS couldn't match your input to a particular address. Here's a list of possible matches.</span>
                    <ul id='candidate_list' style='font-size: 11px; padding: 0px; white-space: pre'>

                    </ul>
                </div>
                
            <div id='loader' class='loader'></div>
            <button style='display:none; margin: 5px 0px' type='button' id='confirm_shipment_button' disabled>Create label</button>
            
            <label style='display:none' id='label_result'></label>
            </div>
        </div>
        `).dialog({
            autoOpen: false,
            width: 650,
            height: 580
        });
        return_label_address_forms = $(address_forms_html);
        outgoing_address_forms = $(address_forms_html);

        $('#return_to_form').after(return_label_address_forms);
        $('#ship_to_lab_div').after(outgoing_address_forms);
        return_label_address_forms = $('#tabs-1');
        outgoing_address_forms = $('#tabs-2');
        upsDialog.children().css('display', 'block');
        upsDialog.find('input:not([type="radio"])').css('width', '95%');
        upsDialog.find('#state_form').css('width', '20%');
        upsDialog.find('#zip_form').css('width', '40%');
        outgoing_address_forms.find('#state_form').css('width', '20%');
        outgoing_address_forms.find('#zip_form').css('width', '40%');
        //upsDialog.find('div:not(#from_lab_div)').css('display', 'inline-block');
        upsDialog.find('div:not(#from_lab_div)').css('display', 'inline-block');
        upsDialog.find('#loader, #service_form, #candidate_container, #confirm_shipment_button').css('display', 'none');
        upsDialog.find('#return_to_form').val(lab);
        upsLink = $(`
        <p class="req_actions" style="margin-top: 18px;">
            <a href="#" id="ups_link">UPS</a>
        </p>`)
        $('#ship_to_lab_div').css('display', 'none');
        $('.timeline_below').append(upsLink);
        $('#client_radio').prop('checked', true);
        $('#ship_to_radios').css('white-space', 'nowrap');
        $('#ship_to_radios > *').css('display', 'inline-block')
        $('#ship_to_radios > input').change(function (e) {
            $('#ship_to_radios > input').prop('checked', false);
            $(e.target).prop('checked', true);
            if ($('#client_radio').prop('checked') == true) {
                outgoing_address_forms.find('#address_form_container').css('display', 'block');
                $('#ship_to_lab_div').css('display', 'none');
            } else // Lab radio is checked
            {
                outgoing_address_forms.find('#address_form_container').css('display', 'none');
                $('#ship_to_lab_div').css('display', 'inline-block');
            }
        });


        function AddContactAddressesToForm(form, addressList) {
            form.find('#address_select').empty(); // Clear it out first...
            addressList.forEach((ele) => {
                newOption = $('<option>' + ele.address_line + '</option>');
                form.find('#address_select').append(newOption);
                newOption.data(ele);
            });
        }

        function SetupAddressSelectorFromForm(form) {
            form.find('#address_select').change((e) => { // When the selection is changed
                var addr = ($(e.target).find(':selected').data()); // Get the corresponding address
                SetAddressFormsFromForm(addr, form); // And put it in the forms
            });
        }
        SetupAddressSelectorFromForm(outgoing_address_forms);
        SetupAddressSelectorFromForm(return_label_address_forms);
        $('#ups-dialog').tabs();
        outgoing_address_forms.find('input,select :not(#confirm_shipment_button),#return_to_form').change(() => {
            FormResetOnChange(outgoing_address_forms);
        });
        return_label_address_forms.parent().find('input,select :not(#confirm_shipment_button), #return_to_form').change(() => {
            FormResetOnChange(return_label_address_forms);
        });

        function FormResetOnChange(form) {
            if (form.find('#verify_status').text() == '') {
                return;
            }
            ResetThings(form);
            form.find('#verify_status').text('Data changed. Please verify again.');
            form.find('#verify_status').css('color', 'red')
        }

        $('#ups_link').click((e) => {
            e.preventDefault();
            upsDialog.dialog('open');
            if (contactAddresses.length >= 1) {
                AddContactAddressesToForm(return_label_address_forms, contactAddresses);
                AddContactAddressesToForm(outgoing_address_forms, contactAddresses);
                SetAddressFormsFromForm(contactAddresses[0], return_label_address_forms);
                SetAddressFormsFromForm(contactAddresses[0], outgoing_address_forms);
            }
        });

        function ResetThings(form) {
            HideSpinner(form);
            upsDialog.find('#loader, #service_form, #candidate_container, #confirm_shipment_button').css('display', 'none');

        }

        function ShowSpinner(form) {
            form.find('#loader').css('display', 'block');
        }

        function HideSpinner(form) {
            form.find('#loader').css('display', 'none');
        }

        function JsonAddrToString(json) {
            var result = '';
            var Address = json['AddressKeyFormat'];
            if ('AddressLine' in Address) {
                result += 'Street: ' + Address['AddressLine'] + '\n';
                result += 'City: ' + Address['PoliticalDivision2'] + '\n';
                result += 'State: ' + Address['PoliticalDivision1'] + '\n';
                result += 'Zip: ' + Address['PostcodePrimaryLow'] + '\n';
            }
            return result;
        }

        // Verify return address
        return_label_address_forms.find('#verify_button').click(() => {
            shipTo = lab_dict[$('#return_to_form').val()];
            shipFrom = GetCurrentAddressFromForm(return_label_address_forms);
            VerifyAddressFromForm(
                return_label_address_forms,
                GetCurrentAddressFromForm(return_label_address_forms),
                () => {
                    RateFromForm(return_label_address_forms, shipTo, shipFrom, true);
                }
            );
        });

        //Confirm return label
        return_label_address_forms.find('#confirm_shipment_button').click(() => {
            shipTo = lab_dict[$('#return_to_form').val()];
            shipFrom = GetCurrentAddressFromForm(return_label_address_forms);
            SendLabelFromForm(return_label_address_forms, shipFrom, shipTo, true);
        });

        // Verify outgoing address
        outgoing_address_forms.find('#verify_button').click(() => {
            var shipTo;
            if ($('#client_radio').prop('checked') == true) // Selected custom address
            {
                shipTo = GetCurrentAddressFromForm(outgoing_address_forms);
            } else {
                shipTo = lab_dict[$('#to_lab_select').val()];
            }
            var shipFrom = lab_dict[outgoing_address_forms.find('#from_lab_select').val()];
            VerifyAddressFromForm(outgoing_address_forms, shipTo, () => {
                RateFromForm(outgoing_address_forms, shipTo, shipFrom, false);
            });
        });

        // Outgoing SEND LABEL
        outgoing_address_forms.find('#confirm_shipment_button').click(() => {
            var shipTo;
            if ($('#client_radio').prop('checked') == true) // Selected custom address
            {
                shipTo = GetCurrentAddressFromForm(outgoing_address_forms);
            } else {
                shipTo = lab_dict[$('#to_lab_select').val()];
            }
            var shipFrom = lab_dict[outgoing_address_forms.find('#from_lab_select').val()];
            SendLabelFromForm(outgoing_address_forms, shipFrom, shipTo, false);
        });


        // Confirm label - generic
        function SendLabelFromForm(form, shipFrom, shipTo, isReturn) {
            ShowSpinner(form);
            ConfirmLabel(shipFrom, shipTo, form.find('#service_form').val(), isReturn, (json) => {
                HideSpinner(form);
                if ('Fault' in json) {
                    form.find('#label_result').css('display', 'block');
                    form.find('#label_result').text(json['Fault']['detail']['Errors']['ErrorDetail']['PrimaryErrorCode']['Description']);
                    return;
                }
                ShipmentResponse = json['ShipmentResponse'];
                tracking_number = ShipmentResponse['ShipmentResults']['ShipmentIdentificationNumber'];
                form.find('#label_result').css('display', 'block');
                form.find('#label_result').text('Success!\n' + tracking_number);
                if (isReturn) {
                    var note = "Return label: " + service_codes[form.find('#service_form').val()] + ' to ' + shipTo['Address']['StateProvinceCode'] + '\n' + tracking_number + ' emailed to ' + form.find('#email_form').val(); 
                    // Save values for ship in email page
                    GM_setValue("shipInMessage", true);
                    GM_setValue("shipInPhone", true);  // Should it be marked as a phone call
                    GM_setValue("note", note);
                    sleep(500).then(() => {
                        window.location.href = ("/vc_shipin_call.jsp?case_id=" + caseNumber);
                    });
                } else {
                    zpl = json['ShipmentResponse']['ShipmentResults']['PackageResults']['ShippingLabel']['GraphicImage']; //Base64
                    data = [{
                        type: 'raw',
                        format: 'base64',
                        data: zpl
                    }];
                    qz.websocket.connect().then(function () {
                        return qz.printers.find("zebra") // Pass the printer name into the next Promise
                    }).then(function (printer) {
                        var config = qz.configs.create(printer); // Create a default config for the found printer
                        return qz.print(config, data);
                    }).catch(function (e) {
                        console.error(e);
                    });
                }
            });
        }


        // Verify address - generic
        function VerifyAddressFromForm(form, addressToValidate, OnSuccess) {
            ResetThings(form);
            form.find('#loader').css('display', 'block');
            VerifyAddress(addressToValidate, function (json) {
                if ('Fault' in json) {
                    console.log("Error!!!");
                    err = (json['Fault']['detail']['Errors']['ErrorDetail']['PrimaryErrorCode']['Description']);
                    form.find('#verify_status').text(err);
                    form.find('#verify_status').css('color', 'red');
                    ResetThings(form);
                    return;
                }
                json = json['XAVResponse'];
                if ('ValidAddressIndicator' in json) {
                    console.log('Address is valid!');
                    form.find('#verify_status').text('Address is valid!');
                    form.find('#verify_status').css('color', 'green');
                    OnSuccess();
                    return;
                } else if ('AmbiguousAddressIndicator' in json) {
                    ResetThings(form);
                    form.find('#verify_status').text('Address is ambiguous.');
                    form.find('#verify_status').css('color', 'orange');
                    form.find('#candidate_container').css('display', 'block');
                    candidates = json['Candidate'];
                    //Populate candidates list
                    form.find('#candidate_list').empty();
                    if (candidates.constructor !== Array) // Did we get more than one candidate?
                    {
                        candidates = [candidates];
                    }
                    for (i in candidates) {
                        candidate = candidates[i];
                        form.find('#candidate_list').append($(`<li>`, {
                            text: JsonAddrToString(candidate),
                            display: 'block'
                        }));
                    }
                    return;
                } else if ('NoCandidatesIndicator' in json) {
                    form.find('#verify_status').text('Could not find a valid match.');
                    form.find('#verify_status').css('color', 'red');
                    HideSpinner(form);
                    return false;
                }
            });
        }

        function RateFromForm(form, shipTo, shipFrom, isReturn) {
            //Address is valid; get rates
            Rate(shipTo, shipFrom, isReturn, function (json) {
                if ('Fault' in json) {
                    console.log("Error!!!");
                    allErrStr = '';
                    errorList = json['Fault']['detail']['Errors']['ErrorDetail'];
                    if (errorList.constructor !== Array) {
                        errorList = [errorList];
                    }
                    for (i in errorList) {
                        allErrStr += errorList[i]['PrimaryErrorCode']['Description'];
                        allErrStr += '\n';
                    }
                    form.find('#verify_status').text(allErrStr);
                    form.find('#verify_status').css('color', 'red');
                    ResetThings(form);
                    return;
                }
                RateResponse = json['RateResponse'];
                Response = RateResponse['Response'];
                ResponseStatus = Response['ResponseStatus'];
                ResponseStatusDesc = ResponseStatus['Description'];
                Rates = RateResponse['RatedShipment'];

                //Empty and show the services dropdown
                form.find('#service_form').empty();
                form.find('#service_form').css('display', 'block');
                // Enable return label button
                form.find('#confirm_shipment_button').removeAttr('disabled');
                form.find('#confirm_shipment_button').css('display', 'block');
                for (i in Rates) {
                    rate = Rates[i];
                    if (rate['NegotiatedRateCharges'] == undefined) {
                        ResetThings(form);
                        form.find('#verify_status').text("Couln't get negotiated rates.\nIs your account number correct?");
                        form.find('#verify_status').css('color', 'red');
                        return;
                    }
                    cost = rate['NegotiatedRateCharges']['TotalCharge']['MonetaryValue'];
                    service_code = rate['Service']['Code'];
                    serviceDesription = service_codes[service_code];
                    form.find('#service_form').append($('<option>', {
                        value: service_code,
                        text: serviceDesription + ' ($' + cost + ')'
                    }));
                    form.find('#loader').css('display', 'none');
                }
            });
        }

    } else if (path.indexOf("vc_shipin_call") != -1) // Ship in call page
    {
        if (GM_getValue("shipInMessage") == true) {
            GM_setValue("shipInMessage", false);
            note = GM_getValue("note");
            if (GM_getValue("shipInPhone") == true)  // Should it be marked as a phone call
            {
                GM_setValue("shipInPhone", false);
                $("#com_method").val(1).trigger("change");  // Phone
            }
            else  // Make it an email by default
            {
                $("#com_method").val(2).trigger("change");  // Email
            }
            $("#call_note").val(note);
            $('#send_ship_in_email_checkbox').prop('checked', false);
        }
    } else if (path.indexOf("r_user_flags") != -1) // Flagged cases page ////////////////////////////
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
    } else if (path.indexOf('vc_billing') != -1) // Billing page //////////////////////////////
    {
        name = $('#nav1_case > table > tbody > tr > td:nth-child(3) > a').text().toLowerCase().trim();
        if (name.startsWith('mr.') || name.startsWith('ms.') || name.startsWith('mrs.')) {
            name = name.slice(name.indexOf(' ') + 1);
        }
        billingName = $('.vc_bill_info tbody :nth-child(2) :nth-child(2)').text().toLowerCase().trim()
        if (name != billingName) {
            alert("Name on the first credit card doesn't match the name on the case! Make sure you get a CC auth form.");
        }
    } else if (path.indexOf('user_options') != -1) // User options page ////////////////////////
    {
        optionsList = $('.home_grid_block6_cell > ul');
        upsOptions = $(`
        <li>
        <table>
            <tr>
                    <td><label>UPS Account Username</label></td>
                    <td><input id='ups_username'></input></td>
            </tr>
            <tr>
                <td><label>UPS Account Password</label></td>
                <td><input id='ups_password'></input></td>
            </tr>
            <tr>
                <td><label>UPS Account Number</label></td>
                <td><input id='ups_account_number'></input></td>
            </tr>
            <tr>
                <td> <label>UPS API Key</label></td>
                <td><input id='ups_api_key'></input></td>
            </tr>
        </table>
        </li>
        <li>
            <button id='save_button' type='input'>Save</button>
        </li>
        `);
        ids = ['ups_username', 'ups_password', 'ups_account_number', 'ups_api_key'];

        optionsList.append(upsOptions);
        for (i in ids) {
            id = ids[i];
            if (GM_getValue(id) == undefined) {
                GM_setValue(id, '');
            }
            $('#' + id).val(GM_getValue(id));
        }

        $('#save_button').click(function () {
            for (i in ids) {
                id = ids[i];
                textVal = $('#' + id).val();
                if (textVal != '') // Only update the value if the form isn't empty
                {
                    GM_setValue(id, textVal);
                }
            }
            window.location.href = '/';
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
