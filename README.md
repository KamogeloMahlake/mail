
# Mail App

This Django-based email client allows users to register, log in, send, receive, and manage emails in an inbox, sent, and archive system. The application models a simple email system, supporting user authentication and standard email actions, and provides a dynamic JavaScript-powered user interface.

## Features

- User registration, login, and logout
- Compose and send emails to registered users
- Inbox, sent mailbox, and archive mailbox with real-time updates
- Mark emails as read/unread and archive/unarchive
- View email details, reply, and manage mailbox directly from the interface

## Models

### User
- Extends Django's `AbstractUser`.
- Used for authentication and as sender/recipient references.

### Email
- `user`: ForeignKey to User, owner of the email instance.
- `sender`: ForeignKey to User, who sent the email.
- `recipients`: ManyToManyField to User, the email recipients.
- `subject`: CharField for the email subject.
- `body`: TextField for the email body.
- `timestamp`: DateTimeField, auto-set on creation.
- `read`: BooleanField, marks if the email is read.
- `archived`: BooleanField, marks if the email is archived.
- `serialize()`: Returns a dictionary with email details for API responses.

## Views

### index(request)
- Renders the inbox for authenticated users.
- Redirects unauthenticated users to login.

### compose(request)
- Requires POST and authentication.
- Parses recipients, subject, and body from JSON.
- Validates recipients and creates Email instances for sender and recipients.

### mailbox(request, mailbox)
- Requires authentication.
- Shows emails per mailbox type: inbox, sent, or archive.
- Filters and orders emails, returning them as JSON.

### email(request, email_id)
- Requires authentication.
- GET: Returns serialized email details.
- PUT: Updates read/archive status.

### login_view(request)
- Handles user authentication via POST.
- Renders login page on GET.

### logout_view(request)
- Logs the user out and redirects to index.

### register(request)
- Handles new user registration via POST.
- Validates unique email and password confirmation.
- Renders registration page on GET.

## Frontend (JavaScript: inbox.js)

- The interface is dynamic and single-page style, powered by JavaScript.
- Navigation between Inbox, Sent, Archive, and Compose views is handled without full page reloads.
- Users can:
  - Load and display lists of emails from the inbox, sent, or archive.
  - Compose new emails via a form and send them using fetch API calls.
  - View individual emails in detail, mark them as read, and archive or unarchive (except for sent mail).
  - Reply to emails with pre-filled recipient, subject, and quoted body.
  - All actions (archive, reply, read status) are performed asynchronously and update the UI immediately.

## API Endpoints (Sample)

- `POST /emails`: Send a new email (JSON: recipients, subject, body)
- `GET /emails/inbox`: List inbox emails
- `GET /emails/sent`: List sent emails
- `GET /emails/archive`: List archived emails
- `GET /emails/<id>`: Fetch details for a specific email
- `PUT /emails/<id>`: Update email (read or archived status)

## Requirements

- Python (with Django)
- JavaScript (for frontend interactivity)
