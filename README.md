# dbmonkey
TamperMonkey script to add some quality of life improvements to the database

This script adds a few small but helpful features to the database.

<h1>Case Watch</h1>
Case watch is a way to keep an eye on cases without flagging them to anyone. First, find the case that you want to watch.
Then, click on the flag button. You should see a text box and a watch case button. You can (optionally) put a note in the textbox. 

To view your watched cases, click the "Case Watch" button in the top left of your screen. From there you can unwatch cases by clicking the X, or click the case number to view the case.

<h1>Email parser</h1>
This is a useful tool to try and extract information from client's emails. When a client sends an email - a WD inquiry, for example-  send the "got it" message as usual.
Then, open up the "got it" message you just sent and press Ctrl+A to copy the entire contents of the email. You'll only want to do this on the got it email beause that email contains the original senders email address and name.
To set up the case, go to the database homepage and click the "New Email Case" in the DB Monkey pane. A dialog will appear and ask you to paste in the email you just copied. It will attempt to parse the email to find things like the client's name, email address, and phone number.
On the next page, be sure to double check that the information is correct before submitting.

<h1>Note Highlighting</h1>
This feature makes it a little bit easier to follow the stages that a case has gone through. It will automatically add colors to case notes based on the color of the last flag that was set.
It makes more sense when you look at it, so go take a look.
<h1>Shortcut Buttons and Defaults</h1>
The new case page now features three shortcut buttons for the most common service types: single hard drive, mobile phone, and thumb drive.
The script also sets default values on a few different pages around the database, including the new client page and new case page. Things like state, city, OS, and RM will be set to default values. Don't forget to get that information from the client at some point.

<h1>Email Templates</h1>
This script adds templated emails that allow you to quickly send the most common emails to clients. The list is still being expanded; if there's a template you want, just email it to me and I'll add it.

On the "View Case" screen, you should see an arrow button next to the client's email. From there you can select an email template to send.
Unfortunately, web browsers have a hard limit on the length of a mailto link, which means that if the email has a total length over two thousand characters, it won't work. In this situation, the script will instead copy the body of the email to your clipboard. So if you click a template but the Outlook email window that pops up is blank, just hit Ctrl+V.
