var wdInquiry = {};
var path = "";
var root = window.location.host;
$(function(){

    path = window.location.pathname;
    if (path == "" || path.indexOf("index.jsp") != -1) //Home page
    {
        monkeyPane = $('<div class="home_grid_block3_cell" style="background-color: #ff5959;" ><h3>DB Monkey</h3></div>').prependTo(".home_grid_divrow");
        wdInquiryButton = $('<a href="#">New Email Case</a>');
        wdInquiryComment = $('<div style="display: inline-block; vertical-align: middle;" class="ui-state-default ui-corner-all" id="q_nav1_button"> <span class="ui-icon ui-icon-comment"></span>  </div>');
        
        $(monkeyPane).append(wdInquiryButton);
        $(wdInquiryButton).after(wdInquiryComment);
        $(wdInquiryComment).css({
            "margin-left":"5px"
        });
        $(wdInquiryComment).click(function (){
            alert('When you get a new case by email, send the "Got it" message as usual. Then, copy all the content of the "Got it" email you just sent (it contains the senders name and email). Click "New Email Case" and paste the email into the alert box. It will try and parse information from the email and apply it to a new case. Always double check the information before finalizing the case!');
            
        });
        wdInquiryButton.click(function(){
            wdPrompt = prompt("Paste the inquiry email here.");
            if (wdPrompt)
            {
                wdInquiry.active = true;
                //Try and find email
                fromIndex = wdPrompt.indexOf("From:") + 6;
                sentIndex= wdPrompt.indexOf(" Sent:");
                if (wdPrompt.indexOf("WD Inquiry") != -1)  // Check if this a WD referral
                {
                    wdInquiry.wdReferral = true;
                }
                if (fromIndex != -1 && sentIndex != -1) //Make sure the email contains valid from/sent text
                {
                    fromText = wdPrompt.substring(wdPrompt.indexOf("From:") + 6, wdPrompt.indexOf(" Sent:"));
                    console.log(fromText);
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
                        console.log("Full name: " + fullName);
                        var commaIndex = fullName.indexOf(',');
                        if (commaIndex != -1) //Check if the name is in the format last, first
                        {
                            lastName = fullName.substring(0, commaIndex);
                            firstName = fullName.substring(commaIndex, fullName.length);
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
                        wdInquiry.firstName = firstName;
                        wdInquiry.lastName = lastName;
                        console.log("First name: " + firstName + "\nLast name: " + lastName);
                    } 
                    email = fromText.substring(sepCharIndex + (sepChar == "<" ? 1 : 8), fromText.length - 1);
                    if (email)
                    {
                        console.log("Email: " + email);
                        wdInquiry.email = email;
                    }
                    subjectIndex = wdPrompt.indexOf("Subject:", fromIndex);
                    scenario = wdPrompt.substring(subjectIndex, wdPrompt.length);
                    wdInquiry.scenario = scenario;

                }
                
                
                GM_setValue("wdInquiry", wdInquiry);
                window.location.href = ("/add_client_1.jsp");
            }
        });
    }


    else if (path.indexOf("add_client" != -1)) //Add client page
    {
        wdInquiry = GM_getValue("wdInquiry");
        if (wdInquiry != undefined && wdInquiry.active)
        {
            $("#client_type_input").val("individual").trigger("change");  //Change client type
            if (wdInquiry.firstName && wdInquiry.lastName) //Add client's name 
            {
                $("#company_input").val(wdInquiry.lastName + ", " + wdInquiry.firstName).trigger("change");
            }
            else
            {
                $("#company_input").val("need, need").trigger("change");
            }

            $("#phone1_input").val("0000000000").trigger("change");  // Set the phone number

            if (wdInquiry.email) //Se the client's email
            {
                $("#email_input").val(wdInquiry.email).trigger("change");
            }
            else
            {
                $("#email_input").val("need@need.need").trigger("change");
            }
            $("#city_input").val("need").trigger("change");  // Set the client's city
            $("#state_input").val("APO - AA").trigger("change"); //Set the client's state
            
            $("#refer_by_input").val((wdInquiry.wdReferral ? "Western Digital" : "Google")).trigger("change");  // Set the referred by value
            
            wdInquiry.active = false;
            GM_setValue("wdInquiry", wdInquiry);
        }
        $("#submit1").on("click", function(){ 
            wdInquiry.active = true;
            GM_setValue("wdInquiry", wdInquiry);
        });
    }

    else if (path.indexOf("add_client" != -1)) //Add client page
    {
        wdInquiry = GM_getValue("wdInquiry");
        if (wdInquiry != undefined && wdInquiry.active)
        {
            wdInquiry.active = false;
            GM_setValue("wdInquiry", wdInquiry);

            $("#case_setup_method").val("email").trigger("change");  // Change the setup method

            //Service type will default to Standard Hard Drive
            $("#serv_pick_attr1").val("single hard drive").trigger("change");
            $("#serv_pick_price_structure").val("variable-eval").trigger("change");
            $("#serv_pick_priority").val("standar").trigger("change");

            $("#operating_system_id").val("Unknown").trigger("change");  // Change the OS to Uknown
            $("#return_media_id").val("Client Will Decide Later").trigger("change");  // Change RM

            if (wdInquiry.scenario)
            {
                $("#scen_id").val(wdInquiry.scenario).trigger("change");
            }

            GM_delete
        }

    }
});
