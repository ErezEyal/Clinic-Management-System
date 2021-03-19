# Clinic Management App

#### Management system for handling the overall operations of a medical clinic.

## Project Highlights:

* Patient management with extensive patient profile, history, upcoming appointments
* Integration with Dropbox, preview patient documents
* Medical documents generation from dynamic dotx/docx templates
* Tasks management - assign tasks to employees, set due dates, link tasks to patients
* Granular, adjustable user permissions via custom "roles"
* Secure system users authentication with 2FA support
* Detailed audit trail for complete visibility into all system actions 
* Export patients database and audit trail to CSV format

## Deploy Steps
1. Pull the code from master
2. Run "NPM run build" inside the "client" directory
3. Move the generated build folder under the server directory
4. run "npm run prod" inside the server directory