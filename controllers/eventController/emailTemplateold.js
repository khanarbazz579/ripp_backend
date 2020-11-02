let emailTemplate = {};
const moment = require('moment');

emailTemplate.inviteTemplate = async function(timeTitle, start, end, title, users, text, address, key) {
    var d = moment(start);
    var e = moment(end);
    var monthName = d.format('MMMM');
    var dayName = d.format('dddd');
    var day = d.date();
    var who = '';
    let textArea = '';
    let addressData = '';
    if (address) {
        addressData = `<p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Where:</p>
       <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">${address}</p>
       <a href="https://www.google.com/maps/search/?api=1&query=${address}" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">View Location on Google Maps</a>`;
    }
    if (text) {
        textArea = `<tr>
       <td width="20px"></td>
       <td>
          <table style="width: 100%;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
             <tbody>
                <tr>
                   <td>
                   <div style="width: 100%;min-height: 150px;background: #fff;border: 1px solid #ddd; white-space: pre-wrap;">${text}</div>
                   </td>
                </tr>
             </tbody>
          </table>
       </td>
       <td width="20px"></td>
    </tr>`;
    }
    for (let i = 0; i < users.length; i++) {
        who += `<li style="font-size: 16px;line-height: 40px;">${users[i].first_name} ${users[i].last_name ? users[i].last_name : ''} - ${users[i].company ? users[i].company : ''} - ${users[i].email} <span style="font-weight: 600; color: rgb(177, 177, 177);"> ${users[i].message && users[i].message != 'No Invite Sent' ? users[i].message : ''} </span></li>`;
    }

    return `<html dir="ltr" lang="en"><head>
      <!-- Meta Tags --> 
      <meta name="viewport" content="width=device-width,initial-scale=1.0, user-scalable=no">
      <meta http-equiv="content-type" content="text/html;
         charset=UTF-8">
      <!-- Page Title --> 
      <title>:: Email ::</title>
<style>

 @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700');
         body {
         font-family: 'Lato', sans-serif;
         font-size: 14px; color: #333;}

         @media only screen and (max-width: 767px) {table{width: 100% !important;}}
a[tabindex]:focus { background:#156cd8; color:#fff; }
a[tabindex]:focus { background:#156cd8; color:#fff; }
#DIVi{display:none;}
#DIVi:target{display:block !important;} 
#DIVi:active{display:block !important;}
a[tabindex]:focus { background:#156cd8; color:#fff; }
a[tabindex]:focus { background:#156cd8; color:#fff; }

.focus-btn:focus {
background: #409520 !important;
color: #fff !important;
}

.focus-btn:hover{
background: #409520 !important;
color: #fff !important;

}

</style>
   </head>
   <body>

   <table style="width: 100%;max-width: 1000px;background-color: #f3f7f9;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
      <tbody>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>

         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width:100%; overflow: scroll;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr style="vertical-align: top;">
                        <td width="10px"></td>
                        <td width="10px"></td>
                        
                        <td>
                           <h3 style="margin: 0; font-size: 20px;">${title}</h3>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">When:</p>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">${timeTitle}</p>
                        </td>
                        <td width="10px"></td>
                        <td>
                         ${addressData}
                        </td>
                        <td width="10px"></td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width: 80%;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr>
                        <td width="20px"></td>
                        <td>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Who:</p>
                           <ul>
                              ${who}
                           </ul>
                        </td>
                        <td width="20px"></td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>

         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         ${textArea}
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Event invitation using <a href="https://www.ripplecrm.com/" style="font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">Ripple CRM</a> from Ripple CRM Ltd.</p>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">You have been sent this email because you recently created this event.</p>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">To stop receivig these emails please <a href="#" style="font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">update your notification settings </a></p>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
      </tbody>
   </table>


<style>.tb_button {padding:1px;cursor:pointer;border-right: 1px solid #8b8b8b;border-left: 1px solid #FFF;border-bottom: 1px solid #fff;}.tb_button.hover {borer:2px outset #def; background-color: #f8f8f8 !important;}.ws_toolbar {z-index:100000} .ws_toolbar .ws_tb_btn {cursor:pointer;border:1px solid #555;padding:3px}   .tb_highlight{background-color:yellow} .tb_hide {visibility:hidden} .ws_toolbar img {padding:2px;margin:0px}</style></body></html>`;

}

emailTemplate.orgenizerTemplate = async function(timeTitle, start, end, title, users, text, address, userName, is) {
    var d = moment(start);
    var e = moment(end);
    var monthName = d.format('MMMM');
    var dayName = d.format('dddd');
    var day = d.date();
    var who = '';
    var status = '';
    let addressData = '';
    if (address) {
        addressData = `<p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Where:</p>
       <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">${address}</p>
       <a href="https://www.google.com/maps/search/?api=1&query=${address}" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">View Location on Google Maps</a>`;
    }
    for (let i = 0; i < users.length; i++) {
        if (users[i].fixed) {
            who += `<li style="font-size: 16px;line-height: 40px;">${users[i].first_name} ${users[i].last_name} - ${users[i].company} - ${users[i].email} <span style="font-weight: 600; color: rgb(177, 177, 177);"> ${users[i].message} </span></li>`;
        } else {
            let isStatus = '';
            if (users[i].status == 'U') {
                isStatus = 'Unconfirmed';
            } else if (users[i].status == "N") {
                isStatus = 'Not Attending';
            } else if (users[i].status == "T") {
                isStatus = 'Possibly Attending';
            } else {
                isStatus = 'Attending';
            }
            who += `<li style="font-size: 16px;line-height: 40px;">${users[i].first_name} ${users[i].last_name != null ? users[i].last_name : ''} - ${users[i].company != null ? users[i].company : ''} - ${users[i].email} <span style="font-weight: 600; color: rgb(177, 177, 177);"> </span> <b>${isStatus}</b></li>`;
        }

    }

    if (is == 'Y') {
        status = `${userName} is <b>attending</b> this event`;
    }
    if (is == 'N') {
        status = `${userName} is <b>not attending</b> this event`;
    }
    if (is == 'T') {
        status = `${userName} is <b>possibly attending</b> this event`;
    }


    return `<html dir="ltr" lang="en"><head>
      <!-- Meta Tags --> 
      <meta name="viewport" content="width=device-width,initial-scale=1.0, user-scalable=no">
      <meta http-equiv="content-type" content="text/html;
         charset=UTF-8">
      <!-- Page Title --> 
      <title>:: Email ::</title>
      <style> 
         @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700');
         body {
         font-family: 'Lato', sans-serif;
         font-size: 14px; color: #333;
         }
         @media only screen and (max-width: 767px) {
         table{
         width: 100% !important;
         }
         }
      </style>
   </head>
   <body>

   <table style="width: 100%;max-width: 1000px;background-color: #f3f7f9;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
      <tbody>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>

         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width:100%; overflow: scroll;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr style="vertical-align: top;">
                        <td width="10px"></td>
                        <td>
                           <div>
                              <table cellspacing="0" cellpadding="0" border="0" style="background: #fff;text-align: center;">
                                 <tbody>
                                    <tr>
                                       <td style="background: #528cf2;color: #fff;text-align: center;font-size: 15px;">${monthName}</td>
                                    </tr>
                                    <tr>
                                       <td style="background: #fff;font-size: 25px;text-align: center;font-weight: 600;">${day}</td>
                                    </tr>
                                    <tr>
                                       <td>
                                          <table cellspacing="0" cellpadding="0" border="0" style="background: #fff;text-align: center;">
                                             <tbody>
                                                <tr>
                                                   <td>${dayName}</td>
                                                   <td><img src="icon.png" alt=""></td>
                                                </tr>
                                             </tbody>
                                          </table>
                                          <table>
                                          </table>
                                       </td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                           <a href="#" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">View</a>
                           <a href="#" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">Event on</a>
                           <a href="#" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">Ripple</a>
                           <a href="#" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">Calender</a>
                        </td>
                        <td width="10px"></td>
                        <td>
                           <h3 style="margin: 0; font-size: 20px;">${status}</h3>
                           <h3 style="margin: 0; font-size: 20px;">${title}</h3>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">When:</p>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">${timeTitle}</p>
                        </td>
                        <td width="10px"></td>
                        <td>
                          ${addressData}
                        </td>
                        <td width="10px"></td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width: 80%;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr>
                        <td width="20px"></td>
                        <td>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Who:</p>
                           <ul>
                              ${who}
                           </ul>
                        </td>
                        <td width="20px"></td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width: 100%;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr>
                        <td>
                           <div style="width: 100%;min-height: 150px;background: #fff;border: 1px solid #ddd; white-space: pre-wrap;">${text}</div>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Event invitation using <a href="#" style="font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">Ripple CRM</a> from Ripple CRM Ltd.</p>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">You have been sent this email because you recently created this event.</p>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">To stop receivig these emails please <a href="#" style="font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">update your notification settings </a></p>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
      </tbody>
   </table>


<style>.tb_button {padding:1px;cursor:pointer;border-right: 1px solid #8b8b8b;border-left: 1px solid #FFF;border-bottom: 1px solid #fff;}.tb_button.hover {borer:2px outset #def; background-color: #f8f8f8 !important;}.ws_toolbar {z-index:100000} .ws_toolbar .ws_tb_btn {cursor:pointer;border:1px solid #555;padding:3px}   .tb_highlight{background-color:yellow} .tb_hide {visibility:hidden} .ws_toolbar img {padding:2px;margin:0px}</style></body></html>`;

}

emailTemplate.getDeleteEventEmailTemplate = async function(timeTitle, start, end, title, users, text, address) {
    var d = moment(start);
    var e = moment(end);
    var monthName = d.format('MMMM');
    var dayName = d.format('dddd');
    var day = d.date();
    var who = '';
    let addressData = '';
    if (address) {
        addressData = `<p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Where:</p>
       <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">${address}</p>
       <a href="https://www.google.com/maps/search/?api=1&query=${address}" style="display: block;font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">View Location on Google Maps</a>`;
    }
    for (let i = 0; i < users.length; i++) {
        who += `<li style="font-size: 16px;line-height: 40px;">${users[i].first_name} ${users[i].last_name ? users[i].last_name : ''} - ${users[i].company ? users[i].company : ''} - ${users[i].email} <span style="font-weight: 600; color: rgb(177, 177, 177);"> ${users[i].message && users[i].message != 'No Invite Sent' ? users[i].message : ''} </span></li>`;
    }
    return `<html dir="ltr" lang="en"><head>
      <!-- Meta Tags --> 
      <meta name="viewport" content="width=device-width,initial-scale=1.0, user-scalable=no">
      <meta http-equiv="content-type" content="text/html;
         charset=UTF-8">
      <!-- Page Title --> 
      <title>:: Email ::</title>
<style>

 @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700');
         body {
         font-family: 'Lato', sans-serif;
         font-size: 14px; color: #333;}

         @media only screen and (max-width: 767px) {table{width: 100% !important;}}
a[tabindex]:focus { background:#156cd8; color:#fff; }
a[tabindex]:focus { background:#156cd8; color:#fff; }
#DIVi{display:none;}
#DIVi:target{display:block !important;} 
#DIVi:active{display:block !important;}
a[tabindex]:focus { background:#156cd8; color:#fff; }
a[tabindex]:focus { background:#156cd8; color:#fff; }

.focus-btn:focus {
background: #409520 !important;
color: #fff !important;
}

.focus-btn:hover{
background: #409520 !important;
color: #fff !important;

}

</style>
   </head>
   <body>

   <table style="width: 100%;max-width: 1000px;background-color: #f3f7f9;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
      <tbody>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>

         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width:100%; overflow: scroll;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr style="vertical-align: top;">
                        <td width="10px"></td>
                        <td>
                           <div>
                              <table cellspacing="0" cellpadding="0" border="0" style="background: #fff;text-align: center;">
                                 <tbody>
                                    <tr>
                                       <td style="background: #528cf2;color: #fff;text-align: center;font-size: 15px;">${monthName}</td>
                                    </tr>
                                    <tr>
                                       <td style="background: #fff;font-size: 25px;text-align: center;font-weight: 600;">${day}</td>
                                    </tr>
                                    <tr>
                                       <td>
                                          <table cellspacing="0" cellpadding="0" border="0" style="background: #fff;text-align: center;">
                                             <tbody>
                                                <tr>
                                                   <td>${dayName}</td>
                                                   <td><img src="icon.png" alt=""></td>
                                                </tr>
                                             </tbody>
                                          </table>
                                          <table>
                                          </table>
                                       </td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </td>
                        <td width="10px"></td>
                        <td>
                           <h3 style="margin: 0; font-size: 20px;"> <b> EVENT CANCELLED - </b> ${title}</h3>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">When:</p>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">${timeTitle}</p>
                        </td>
                        <td width="10px"></td>
                        <td>
                          ${addressData}
                        </td>
                        <td width="10px"></td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width: 80%;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr>
                        <td width="20px"></td>
                        <td>
                           <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Who:</p>
                           <ul>
                              ${who}
                           </ul>
                        </td>
                        <td width="20px"></td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <table style="width: 100%;margin: 0 auto;" cellspacing="0" cellpadding="0" border="0">
                  <tbody>
                     <tr>
                        <td>
                        <div style="width: 100%;min-height: 150px;background: #fff;border: 1px solid #ddd; white-space: pre-wrap;">${text}</div>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">Event invitation using <a href="https://www.ripplecrm.com/" style="font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">Ripple CRM</a> from Ripple CRM Ltd.</p>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">You have been sent this email because you recently created this event.</p>
               <p style="margin: 0;font-size: 15px;font-weight: 400; line-height: 25px;">To stop receivig these emails please <a href="#" style="font-size: 15px;line-height: 25px;color: rgb(90, 133, 239);">update your notification settings </a></p>
            </td>
            <td width="20px"></td>
         </tr>
         <tr>
            <td width="20px"></td>
            <td height="25px"></td>
            <td width="20px"></td>
         </tr>
      </tbody>
   </table>


<style>.tb_button {padding:1px;cursor:pointer;border-right: 1px solid #8b8b8b;border-left: 1px solid #FFF;border-bottom: 1px solid #fff;}.tb_button.hover {borer:2px outset #def; background-color: #f8f8f8 !important;}.ws_toolbar {z-index:100000} .ws_toolbar .ws_tb_btn {cursor:pointer;border:1px solid #555;padding:3px}   .tb_highlight{background-color:yellow} .tb_hide {visibility:hidden} .ws_toolbar img {padding:2px;margin:0px}</style></body></html>`;
}



module.exports = emailTemplate;