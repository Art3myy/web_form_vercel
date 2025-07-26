# Dynamic Feedback Form System

This project is a web application for creating and managing multiple, distinct feedback forms. The system is hosted entirely on Vercel, leveraging its static hosting, serverless functions, and Redis storage.

The core principle is "configuration as code": new forms are created and defined by adding simple Markdown files to the project repository. The application dynamically renders these files as interactive HTML forms for users.

## How It Works

- **Form Creation**: To create a new form, add a new `.md` file to the `/forms` directory. The filename becomes the form's unique ID (e.g., `new-survey.md` becomes `/form/new-survey`).
- **Form Structure**: The form's title and questions are defined using YAML frontmatter within the Markdown file.
- **Data Storage**: Submissions are stored in a Vercel Redis database.

## Project Structure

- `/forms`: Contains the Markdown definitions for each form.
- `/api`: Contains the Node.js serverless functions for backend logic.
- `/public`: Contains the public-facing static assets (HTML, CSS).

## Setup and Configuration

To deploy and run this project, you will need a Vercel account and a Vercel Redis database.

### 1. Environment Variables

This project requires the following environment variables to be set in your Vercel project settings:

- `REDIS_URL`: The connection URL for your Vercel Redis database.
- `ADMIN_SECRET_KEY`: A secret key of your choice used to protect the admin endpoints. This should be a long, random, and private string.

### 2. Local Development

To run the project locally, you can use the Vercel CLI:

1.  Install the Vercel CLI: `npm install -g vercel`
2.  Pull the environment variables: `vercel env pull .env.development.local`
3.  Start the development server: `vercel dev`

## Administrative Endpoints

The following endpoints are for administrative use and require the `ADMIN_SECRET_KEY`.

### Download Submissions

To download all submissions for a form as a Markdown file, construct a URL as follows and open it in your browser:

`https://<your-site-url>/api/admin/download/[formId]?token=<your-admin-secret-key>`

- **[formId]**: The ID of the form (e.g., `customer-satisfaction`).
- **<your-admin-secret-key>**: The secret key you configured.

### Reset Submissions

To delete all submissions for a form, send a POST request to the following URL (e.g., using `curl` or Postman):

`https://<your-site-url>/api/admin/reset/[formId]?token=<your-admin-secret-key>`
