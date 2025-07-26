# Dynamic Feedback Form System

This project is a web application for creating and managing multiple, distinct feedback forms. The system is hosted entirely on Vercel, leveraging its static hosting, serverless functions, and Redis storage.

The core principle is "configuration as code": new forms are created and defined by adding simple Markdown files to the project repository. The application dynamically renders these files as interactive HTML forms for users.

---

## Setup Guide: From Scratch to Deployment

This guide provides a complete walkthrough to get this project running, avoiding common pitfalls.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js (version 18.x or later) installed.
2.  **Vercel Account**: Sign up for a free account at [vercel.com](https://vercel.com).
3.  **Git and GitHub Account**: You will need Git installed and a GitHub account.

### Step 1: Get the Code

Clone the repository to your local machine:

```bash
git clone https://github.com/Art3myy/web_form_vercel.git
cd web_form_vercel
```

### Step 2: Install Dependencies

Install the necessary Node.js packages.

```bash
npm install
```

### Step 3: Create and Configure the Vercel Project

This is the most critical part of the setup.

1.  **Create a New Vercel Project**: Go to your Vercel dashboard and click "Add New..." -> "Project".

2.  **Import Git Repository**: Select the GitHub repository you just cloned.

3.  **Configure the Project**:
    *   Vercel will likely detect it as a project with no specific framework. This is okay. Leave the "Framework Preset" as "Other".
    *   **Do not deploy yet.** We need to set up storage and environment variables first.

4.  **Connect Vercel Redis Storage**:
    *   Navigate to the **"Storage"** tab in your new Vercel project.
    *   Click **"Connect Store"** and select **"Redis"**.
    *   Follow the prompts to create a new Redis database. Give it a name and select a region.
    *   Connect the database to your project. Vercel will automatically create the necessary `REDIS_URL` environment variable.

5.  **Add the Admin Secret Key**:
    *   Navigate to **Settings -> Environment Variables**.
    *   Add a new variable named `ADMIN_SECRET_KEY`.
    *   For the value, generate a long, random, and private string. This is your password for the admin endpoints.

6.  **Deploy the Project**:
    *   Go to the **"Deployments"** tab and trigger a new deployment for the `main` branch.

### Step 4: Local Development (Optional)

If you want to run the project on your local machine:

1.  **Install the Vercel CLI**:
    ```bash
    npm install -g vercel
    ```
2.  **Link Your Project**:
    ```bash
    vercel link
    ```
3.  **Pull Environment Variables**: This command creates a `.env.development.local` file with the variables you set up on Vercel.
    ```bash
    vercel env pull
    ```
4.  **Start the Development Server**:
    ```bash
    vercel dev
    ```

---

## Usage

### Creating a Form

-   Create a new `.md` file inside the `/forms` directory.
-   The filename becomes the form's URL slug (e.g., `new-product-survey.md` will be accessible at `/form/new-product-survey`).
-   Define the form structure using YAML frontmatter as shown in the existing `customer-satisfaction.md` example.

### Accessing Admin Endpoints

These endpoints require your `ADMIN_SECRET_KEY` to be passed as a URL query parameter.

#### Download Submissions

To download all submissions for a form as a Markdown file, construct a URL as follows and open it in your browser:

`https://<your-site-url>/api/admin/download/[formId]?token=<your-admin-secret-key>`

-   **[formId]**: The ID of the form (e.g., `customer-satisfaction`).
-   **<your-admin-secret-key>**: The secret key you configured.

#### Reset Submissions

To delete all submissions for a form, send a POST request to the following URL (e.g., using `curl` or an API tool like Postman):

`https://<your-site-url>/api/admin/reset/[formId]?token=<your-admin-secret-key>`