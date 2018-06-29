# dbmonkey
TamperMonkey script to add some quality of life improvements to the database

This script adds a few small but helpful features to the database.

<h2>Installation</h2>
You'll need to install the TamperMonkey browser extension to your favorite browser. I've tested the script with Chrome, but Firefox should work as well.

[Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
[Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

After the extension is installed, you need to install the script.

1. Click the Tampermonkey extension button in the top right of your browser (black square with two circles)
2. Click "Dashboard"
3. Click the "Utilities" tab
4. In the URL box, paste the following link:

https://raw.githubusercontent.com/sweetgiorni/dbmonkey/master/dbmonkey.js




<h3>Case Watch</h3>
Case watch is a way to keep an eye on cases without flagging them to anyone. First, find the case that you want to watch.
Then, click on the flag button. You should see a text box and a watch case button. You can (optionally) put a note in the textbox. 

To view your watched cases, click the "Case Watch" button in the top left of your screen. From there you can unwatch cases by clicking the X, or click the case number to view the case.

<h3>Email parser</h3>
This is a useful tool to try and extract information from client's emails. When a client sends an email - a WD inquiry, for example-  send the "got it" message as usual.
Then, open up the "got it" message you just sent and press Ctrl+A to copy the entire contents of the email. You'll only want to do this on the got it email beause that email contains the original senders email address and name.
To set up the case, go to the database homepage and click the "New Email Case" in the DB Monkey pane. A dialog will appear and ask you to paste in the email you just copied. It will attempt to parse the email to find things like the client's name, email address, and phone number.
On the next page, be sure to double check that the information is correct before submitting.

<h3>Shortcut Buttons and Defaults</h3>
The new case page now features three shortcut buttons for the most common service types: single hard drive, mobile phone, and thumb drive.
The script also sets default values on a few different pages around the database, including the new client page and new case page. Things like state, city, OS, and RM will be set to default values. Don't forget to get that information from the client at some point.

<h3>Email Templates</h3>
This script adds templated emails that allow you to quickly send the most common emails to clients. The list is still being expanded; if there's a template you want, just email it to me and I'll add it.

On the "View Case" screen, you should see an arrow button next to the client's email. From there you can select an email template to send.
Unfortunately, web browsers have a hard limit on the length of a mailto link, which means that if the email has a total length over two thousand characters, it won't work. In this situation, the script will instead copy the body of the email to your clipboard. So if you click a template but the Outlook email window that pops up is blank, just hit Ctrl+V.

<h3>Blue Yourself</h3>
This feature goes through all the cases you have flagged blue to yourself and flags them yellow. Use this in the morning when you get into work to save 30 seconds. It adds up! To use, go to your flagged cases page and click the button at the bottom labeled "Blue yourself!"

<h3>Note Highlighting</h3>
Important events in your case's life are now highlighted the appropriate color. These events include shipping/receiving, billing, evaluation and recovery completion, and eval follow-up calls.

<h3>Case Reminders</h3>
With case reminders, you can set a timer on cases you'd like to follow up on in the future. When the timer runs out, it will open a popup window with the case number and a note and/or it will flag the case to you.
To use, go to the view case page and click the flag case button. Click the button at the bottom labeled "Add a reminder". Optionally add a note, choose the amount of timer for the timer, and check the boxes for the type of reminder you want. If you want to flag it to yourself, you also have the option of choosing what color to flag it (the default selection is yellow.)

<h3>SIP Click To Call</h3>
This feature turns client phone numbers into a SIP click to call link. To get it working with HUD, follow the instructions in the following link (you can skip installing the browser extension; this script replaces it.)

http://www.dslreports.com/forum/r28591771-General-Windows-Dialer-and-Click-to-Dial-using-Google-Chrome

<h3>UPS Integration</h3>
This adds pre-alpha support for sending UPS labels from the database. You'll find a new link on the left side of the view case page labeled 'UPS'.
US only - I'll add support for Canada if Justin switches over from FedEx. I probably won't be adding support for international shipping since it's a huge pain to implement and we rarely use it.
This script is public at the moment, so you'll have to put in the account information manually. On the homepage, clicks the 'Options' link. You'll see four new inputs: username, password, api key, and account number. The username and password is the login you normally use on UPS.com. The account number can be found on the UPS website or Ben's company directory cheat-sheet. If you don't have the api key already, message me for it. Needless to say, this is all sensitive information and shouldn't be shared.

<b>Printing Outgoing Labels</b>
It only supports Zebra thermal printers at the moment. It you are using something else, let me know.
You need to install this program on your PC for printing to work:

https://github.com/qzind/tray/releases/download/v2.0.7/qz-tray-2.0.7.exe

It's pretty straightforward: install that, and next time you make an outgoing label you'll be asked if you want to allow the website to use the printer. Accept all prompts. You can't use the "Remember this decision" button because the database does not currently have a valid SSL certificate. Petition Mike if you want it changed.
  

