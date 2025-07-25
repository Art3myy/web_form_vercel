### **Project Specification: Dynamic Feedback Form System on Vercel**

#### 1. High-Level Overview

The project is a web application for creating and managing multiple, distinct feedback forms. The system will be hosted entirely on Vercel, leveraging its static hosting, serverless functions, and KV storage capabilities.

The core principle is "configuration as code": new forms are created and defined by adding simple Markdown files to the project repository. The application will dynamically render these files as interactive HTML forms for users. An administrator will have secure endpoints to download aggregated submission data as a single Markdown file or to reset the data for a specific form.

#### 2. Core Technologies

*   **Hosting & Backend:** Vercel (Hobby Tier)
*   **Storage:** Vercel KV (Key-Value Store)
*   **Backend Logic:** Node.js Serverless Functions (`/api` directory)
*   **Frontend Logic:** Vanilla JavaScript (or a lightweight framework like Preact/Svelte if desired)
*   **Form Definition Format:** Markdown with YAML Frontmatter
*   **Dependencies:**
    *   `@vercel/kv`: For interacting with Vercel KV.
    *   `gray-matter`: A Node.js library to parse Markdown frontmatter.

#### 3. Data Structures & File Formats

##### 3.1. Form Definition (`.md` files)

Forms will be defined as individual Markdown files placed in a `/forms` directory at the project root. The filename (slug) will serve as the unique `formId`. For example, `customer-satisfaction.md` will have a `formId` of `customer-satisfaction`.

Each file will use **YAML Frontmatter** to define the form's structure and **Markdown content** for the user-facing description.

**Example: `/forms/customer-satisfaction.md`**

```markdown
---
title: "Customer Satisfaction Survey"
questions:
  - id: "rating"
    label: "How would you rate our service?"
    type: "radio"
    options: ["Excellent", "Good", "Average", "Poor"]
    required: true
  - id: "sales_contact"
    label: "Who was your sales contact?"
    type: "text"
    placeholder: "e.g., Jane Doe"
    required: true
  - id: "comments"
    label: "Any additional comments?"
    type: "textarea"
    required: false
---

Thank you for taking the time to provide your feedback. Your input is valuable in helping us improve our services. Please fill out the fields below.
```

##### 3.2. Submission Data (Vercel KV)

Submissions for each form will be stored as a **list** in Vercel KV. The key for the list will be prefixed to avoid collisions.

*   **Key Format:** `form:[formId]` (e.g., `form:customer-satisfaction`)
*   **Value Format:** Each entry in the list will be a JSON object containing the submission data and a timestamp.

**Example Submission Object:**
```json
{
  "submittedAt": "2023-10-27T10:00:00Z",
  "answers": {
    "rating": "Excellent",
    "sales_contact": "John Smith",
    "comments": "The process was very smooth."
  }
}
```

#### 4. System Architecture & API Endpoints

The application will consist of a public-facing frontend and a set of backend API endpoints, some of which are for administrative use only.

##### 4.1. Public-Facing Functionality

*   **Homepage (`/`):** A page that dynamically lists all available forms by reading the contents of the `/forms` directory. Each list item will link to the specific form page (e.g., `/form/customer-satisfaction`).
*   **Form Page (`/form/[formId]`):** A dynamic page that:
    1.  Fetches the corresponding Markdown definition file from the backend.
    2.  Parses the frontmatter and Markdown content.
    3.  Renders the title and descriptive text.
    4.  Generates an HTML `<form>` with input fields based on the `questions` array.
    5.  Handles form submission via client-side JavaScript, sending the data to the `/api/submit/[formId]` endpoint.

##### 4.2. API Endpoints

All serverless functions will reside in the `/api` directory.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/forms` | `GET` | **Public.** Returns a JSON array of available forms, including their `formId` and `title`. Used to build the homepage list. |
| `GET /api/forms/[formId]` | `GET` | **Public.** Reads and parses the specified form's `.md` file. Returns a JSON object with the form's `title`, `description` (Markdown body), and `questions` array. |
| `POST /api/submit/[formId]` | `POST` | **Public.** Receives form submission data as a JSON body. Validates the data against the form definition. Creates a submission object and pushes it to the appropriate list in Vercel KV. |
| `GET /api/admin/download/[formId]` | `GET` | **Admin-Only.** Downloads all submissions for a given form as a single Markdown file. Requires authentication. |
| `POST /api/admin/reset/[formId]` | `POST` | **Admin-Only.** Deletes all submissions for a given form from Vercel KV. Requires authentication. |

#### 5. Admin Functionality & Security

*   **Authentication:** Admin endpoints will be protected by a secret key. The key will be stored as an Environment Variable in Vercel (e.g., `ADMIN_SECRET_KEY`). The admin must provide this key in a request header (e.g., `Authorization: Bearer <secret_key>`) or as a query parameter.
*   **Download (`/api/admin/download/[formId]`):**
    1.  Authenticates the request.
    2.  Fetches all submission objects for the `[formId]` from Vercel KV.
    3.  Generates a Markdown file in-memory. The file will contain a main title and a table of the submissions.
    4.  Sets the `Content-Type` header to `text/markdown` and the `Content-Disposition` header to trigger a file download (e.g., `attachment; filename="customer-satisfaction_submissions.md"`).
*   **Reset (`/api/admin/reset/[formId]`):**
    1.  Authenticates the request.
    2.  Issues a `DEL` command to Vercel KV for the key `form:[formId]`.
    3.  Returns a success message.

#### 6. User and Admin Workflows

*   **Admin Creates a Form:**
    1.  Admin creates a new file, e.g., `new-product-feedback.md`, in the `/forms` directory.
    2.  Admin defines the `title` and `questions` in the frontmatter.
    3.  Admin pushes the changes to the Git repository.
    4.  Vercel automatically deploys the update. The new form is now live.
*   **User Submits Feedback:**
    1.  User visits the site and sees a link to "New Product Feedback".
    2.  User clicks the link, is taken to `/form/new-product-feedback`, and sees the dynamically generated form.
    3.  User fills out and submits the form. The data is saved to Vercel KV.
*   **Admin Downloads Data:**
    1.  Admin constructs the URL: `https://<site-url>/api/admin/download/new-product-feedback`.
    2.  Admin uses a tool like Postman or `curl` (or a simple admin frontend) to make a GET request to that URL with the secret key in the header.
    3.  A Markdown file containing all submissions is downloaded.