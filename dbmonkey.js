// ==UserScript==
// @name         DB Monkey
// @namespace    https://db.datarecovery.com
// @version      0.1
// @description  DB quality of life improvements!
// @author       Alex Sweet
// @match           https://db.datarecovery.com/*
// @require         http://code.jquery.com/jquery-latest.js

// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue

// ==/UserScript==


var emailInquiry = {};
var path = "";
var root = window.location.host;
$(function(){

    path = window.location.pathname;
    if (path == "" || path.indexOf("index.jsp") != -1) //Home page
    {
        monkeyPane = $('<div class="home_grid_block3_cell" style="background-color: #ff5959;" ><h3>DB Monkey</h3></div>').prependTo(".home_grid_divrow");
        emailInquiryButton = $('<a href="#">New Email Case</a>');
        emailInquiryComment = $('<div style="display: inline-block; vertical-align: middle;" class="ui-state-default ui-corner-all" id="q_nav1_button"> <span class="ui-icon ui-icon-comment"></span>  </div>');
        
        $(monkeyPane).append(emailInquiryButton);
        $(emailInquiryButton).after(emailInquiryComment);
        $(emailInquiryComment).css({
            "margin-left":"5px"
        });
        $(emailInquiryComment).click(function (){
            alert('When you get a new case by email, send the "Got it" message as usual. Then, copy all the content of the "Got it" email you just sent (it contains the senders name and email). Click "New Email Case" and paste the email into the alert box. It will try and parse information from the email and apply it to a new case. Always double check the information before finalizing the case!');
            
        });
        emailInquiryButton.click(function(){
            wdPrompt = prompt("Paste the inquiry email here.");
            if (wdPrompt)
            {
                emailInquiry.active = true;
                //Try and find email
                fromIndex = wdPrompt.indexOf("From:") + 6;
                sentIndex= wdPrompt.indexOf(" Sent:");
                if (wdPrompt.indexOf("WD Inquiry") != -1)  // Check if this a WD referral
                {
                    emailInquiry.wdReferral = true;
                }
                if (fromIndex != -1 && sentIndex != -1) //Make sure the email contains valid from/sent text
                {
                    fromText = wdPrompt.substring(wdPrompt.indexOf("From:") + 6, wdPrompt.indexOf(" Sent:"));
                    var sepCharIndex = fromText.indexOf("<"); // Check to see if the email is enclosed in <>
                    var sepChar = "<";
                    if (sepCharIndex == -1)
                    {
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
                            spaceIndex= fullName.indexOf(' ');
                            if (spaceIndex != -1)
                            {
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
                    if (email)
                    {
                        emailInquiry.email = email;
                    }

                    if (email == fullName)
                    {
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
        if (emailInquiry != undefined && emailInquiry.active)
        {
            $("country_input").val("USA").trigger("change"); // Set country to USA by default
            $("#client_type_input").val("individual").trigger("change");  //Change client type
            if (emailInquiry.firstName && emailInquiry.lastName) //Add client's name 
            {
                $("#company_input").val(emailInquiry.lastName + ", " + emailInquiry.firstName).trigger("change");
            }
            else
            {
                $("#company_input").val("need, need").trigger("change");
            }

            $("#phone1_input").val("0000000000").trigger("change");  // Set the phone number

            if (emailInquiry.email) //Se the client's email
            {
                $("#email_input").val(emailInquiry.email).trigger("change");
            }
            else
            {
                $("#email_input").val("need@need.need").trigger("change");
            }
            
            $("#city_input").val("need").trigger("change");  // Set the client's city
            $("#state_input").val("APO - AA").trigger("change"); //Set the client's state
            
            $("#refer_by_input").val((emailInquiry.wdReferral ? "Western Digital" : "Google")).trigger("change");  // Set the referred by value
            
            emailInquiry.active = false;
            GM_setValue("emailInquiry", emailInquiry);
        }
    }

    else if (path.indexOf("new_case" ) != -1) //Add case page
    {
        $("#case_setup_method").val("email").trigger("change");  // Change the setup method
        //Service type will default to Standard Hard Drive
        $("#serv_pick_attr1").val("single hard drive").trigger("change");
        $("#serv_pick_price_structure").val("variable-eval").trigger("change");
        $("#serv_pick_priority").val("standard").trigger("change");
        $("#service_id").val("1").trigger("change");
        $("#operating_system_id").val("Unknown").trigger("change");  // Change the OS to Uknown
        $("#return_media_id").val("Client Will Decide Later").trigger("change");  // Change RM   
    }
});