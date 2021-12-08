if (!localStorage.getItem('page')) {

  // If not, set the counter to 0 in local storage
  localStorage.setItem('page', 'inbox');
}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  // By default, load the inbox
  document.querySelector('#compose-form').onsubmit = send_email;
  let page = localStorage.getItem('page');
/*
  This section is useful if we want to redirect to the specific email after archived/unarchived.
  if(!isNaN(page)){view_mail(page);}
  else{load_mailbox(page);}
  */
  load_mailbox(page);
  localStorage.setItem('page', 'inbox');

});

function reply_email(mailId){
  /*
    1. Replay button.
    2. CLick -> compose form.
    3. 
  */
   // Show reply view and hide other views


   fetch(`/emails/${mailId}`)
   .then(response => response.json())
   .then(email => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-content').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email').style.display = 'none';
    document.querySelector('#email-details').style.display = 'none';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = email.sender;

    if (email.subject.slice(0,3) == 'Re:'){document.querySelector('#compose-subject').value = `${email.subject}`;}
    else (document.querySelector('#compose-subject').value = `Re: ${email.subject}`);
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

   });

}

function send_email(){
  const recipients = document.querySelector('#compose-recipients').value;
  //let a = "fuck";
  //alert(`Hello, ${recipients}`);
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  //alert(`Hello, ${recipients}  ${subject} ${body}`);
  fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      //window.alert("hi");
  });
  //localStorage.clear();
  //window.location.reload();
  //location.reload();
  localStorage.setItem('page', 'sent');
  window.location.reload();
};

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function archive_email(mailId,bool){
  const flag = bool ? false : true;

  fetch(`/emails/${mailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: flag
    })
  })

  localStorage.setItem('page', 'inbox');
  window.location.reload();
}


function view_mail(mailId){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  document.querySelector('#email-details').style.display = 'block';
  const conMailId = mailId;
  //Clearing
  document.querySelector('#email').innerHTML = '';
  document.querySelector('#email-details').innerHTML = '';
  //vs document.querySelector('#email').value = '';?

  fetch(`/emails/${conMailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
  fetch(`/emails/${mailId}`)
  .then(response => response.json())
  .then(email => {

    //JSON object cannot be iterate with forEach and normal for loop (for(const x of json))
    /*for (let key in email){
      document.createElement('b')
    }
    */

    let sender = document.createElement('p');
    sender.innerHTML = `From: ${email.sender}`;
    //console.log(sender);
    document.querySelector('#email').append(sender);

    let recipients = document.createElement('p');
    recipients.innerHTML = `To: ${email.recipients}`;
    //console.log(sender);
    document.querySelector('#email').append(recipients);

    let subject = document.createElement('p');
    subject.innerHTML = `Subject: ${email.subject}`;
    //console.log(sender);
    document.querySelector('#email').append(subject);

    let date = document.createElement('p');
    date.innerHTML = `Timestamp: ${email.timestamp}`;
    //console.log(sender);
    document.querySelector('#email').append(date);

    let archiveButton = document.createElement('button');

    let replyButton = document.createElement('button');
    replyButton.innerHTML = 'Reply';
    replyButton.addEventListener('click', function(){reply_email(mailId)}); 
    document.querySelector('#email').append(replyButton);

    if(email.archived){
      archiveButton.innerHTML = 'Unarchive';
      archiveButton.addEventListener('click', function(){archive_email(mailId, true)});
      document.querySelector('#email').append(archiveButton);
      //archiveButton.addEventListener('click', archive_email(mailId, true));
  }
    else{
      archiveButton.innerHTML = 'Archive';
      archiveButton.addEventListener('click', function(){archive_email(mailId, false)});
      document.querySelector('#email').append(archiveButton);
      //archiveButton.addEventListener('click', archive_email(mailId, false));
    }

    const emailContentDetails = document.querySelector('#email-details');
    emailContentDetails.innerHTML = `${email.body}`;
    
    
});

    

}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#title').innerHTML = mailbox;
  document.querySelector('#inbox-mails').innerHTML = '';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      //document.querySelector('#email-content')
      if (mailbox === 'inbox'){
        //emails = emails.filter(email => )
        emails.forEach(function(email){
          console.log(email);

          const li = document.createElement('li');
          li.onclick = function() {view_mail(email.id)};


          const div1 = document.createElement('div');
          div1.classList.add('email-address-block');
          div1.innerHTML = `${email.sender}`;

          const div3 = document.createElement('div');
          div3.className = 'email-subject-block';
          div3.innerHTML = `${email.subject}`;

          const div2 = document.createElement('div');
          div2.className = 'email-date-block';
          div2.innerHTML = `${email.timestamp}`;

          if (email.read === false) {
            div1.classList.add('read');
            div2.classList.add('read');
            div3.classList.add('read'); 
          }

          li.append(div1);
          li.append(div3);
          li.append(div2);

          document.querySelector('#inbox-mails').append(li);
        })
      }

      else if (mailbox === 'sent'){
        emails.forEach(function(email){
          console.log(email);

          const li = document.createElement('li');
          li.onclick = function() {view_mail(email.id)};

          const div1 = document.createElement('div');
          div1.className = 'email-address-block';
          div1.innerHTML = `${email.recipients}`;

          const div3 = document.createElement('div');
          div3.className = 'email-subject-block';
          div3.innerHTML = `${email.subject}`;

          const div2 = document.createElement('div');
          div2.className = 'email-date-block';
          div2.innerHTML = `${email.timestamp}`;

          li.append(div1);
          li.append(div3);
          li.append(div2);

          document.querySelector('#inbox-mails').append(li);
        })
      }

      else if (mailbox === 'archive'){
        emails.forEach(function(email){
          console.log(email);

          const li = document.createElement('li');
          li.onclick = function() {view_mail(email.id)};

          const div1 = document.createElement('div');
          div1.className = 'email-address-block';
          div1.innerHTML = `${email.recipients}`;

          const div3 = document.createElement('div');
          div3.className = 'email-subject-block';
          div3.innerHTML = `${email.subject}`;

          const div2 = document.createElement('div');
          div2.className = 'email-date-block';
          div2.innerHTML = `${email.timestamp}`;

          li.append(div1);
          li.append(div3);
          li.append(div2);

          document.querySelector('#inbox-mails').append(li);
        })
      }
  
      // ... do something else with emails ...
  });
    // Print emails
    
    // ... do something else with emails ...

}
/*
function send_email(){
  const recipients = document.querySelector('#compose-recipients').value;
  let a = "fuck";
  //alert(`Hello, ${recipients}`);
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  alert(`Hello, ${recipients}  ${subject} ${body}`);
  fetch('/mail/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      //window.alert("hi");
  });
  localStorage.clear();
  load_mailbox('sent');
  return false;
}
*/