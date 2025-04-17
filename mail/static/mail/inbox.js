document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  const form = document.getElementById('compose-form');
  
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const recipients = document.getElementById('compose-recipients');
    const subject = document.getElementById('compose-subject');
    const body = document.getElementById('compose-body');

    if (!recipients.value || !subject.value || !body.value) return;
    console.log(event);
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
      })
    }).then(response => response.json()).then(data => {
        console.log(data);
        if (data.error) compose_email();
        else if (data.message) load_mailbox('sent');
      });

  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  const emailView = document.querySelector('#emails-view');
  const composeView = document.querySelector('#compose-view');
  const emailDetails = document.querySelector('#email');
  emailView.style.display = 'block';
  composeView.style.display = 'none';
  emailDetails.style.display = 'none';
  // Show the mailbox name
  emailView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`).then(response => response.json()).then(emails => {
    const ul = document.createElement('ul');
    ul.className = 'list-group';
    emailView.appendChild(ul);

    emails.forEach(email => {
      const li = document.createElement('li');
      const readState = email.read ? 'read' : '';
      li.className = `list-group-item ${readState}`;

      li.innerHTML = `<h5>Sender: ${email.sender}</h5>
                      <h3>Subject: ${email.subject}</h3>
                      <p>${email.timestamp}</p>`;
      ul.appendChild(li);
      li.addEventListener('click', () => {
        
        emailView.style.display = 'none';
        composeView.style.display = 'none';
        emailDetails.style.display = 'block';
        

        fetch(`/emails/${email.id}`).then(response => response.json()).then(data => {
          const archiveState = data.archived ? 'Unarchive' : 'Archive';
          emailDetails.innerHTML = `
            <div class="list-group">
              <div class="list-group-item"><strong>From: </strong>${data.sender}</div>
              <div class="list-group-item"><strong>To: </strong>${data.recipients}</div>
              <div class="list-group-item"><strong>Subject: </strong>${data.subject}</div>
              <div class="list-group-item"><strong>Timestamp: </strong>${data.timestamp}</div>
              <div class="list-group-item">
                <button class="reply btn">Reply</button>
                <button class="archive btn">${archiveState}</button>
              </div>
              <div class="list-group-item">${data.body}</div>
            </div>
`
          if (!data.read && mailbox === 'inbox') 
          {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            })
          }
          
          emailDetails.querySelector('.reply').addEventListener('click', () => {
            fetch(`/emails/${email.id}`).then(res => res.json()).then(e => {
              compose_email();
              document.getElementById('compose-recipients').value = e.sender;
              document.getElementById('compose-subject').value = e.subject.slice(0, 3) === 'Re:' ? e.subject : `Re: ${e.subject}`;
              document.getElementById('compose-body').value = `On ${e.timestamp} ${e.sender} wrote: ${e.body}`;
            });
          });
          
          if (mailbox !== 'sent')
          {
            emailDetails.querySelector('.archive').addEventListener('click', () => {
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: !data.archived
                })
              }).then(() => load_mailbox('inbox'));
            });
          }
          else
          {
            emailDetails.querySelector('.archive').hidden = true;
          }
        });
      });
    });
  });
}

