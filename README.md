# Project Tracker

A full-stack project management application for managing client projects, project status, priorities, descriptions, start dates, and due dates.

## Features

- Create projects
- View projects
- Edit projects
- Delete projects
- Search projects by client or project name
- Filter projects by status
- Filter projects by priority
- Sort projects by supported columns
- Client-side form validation
- Server-side Laravel validation
- Validation error handling
- Loading and error states
- Responsive user interface
- Automated backend feature tests

## Tech Stack

### Backend

- Laravel
- PHP
- MySQL
- RESTful API

### Frontend

- Vue 3
- Vite
- Axios
- CSS

### Testing

- PHPUnit
- Laravel Feature Tests
- SQLite for automated tests

## Requirements

Before running the application, make sure the following are installed:

- PHP
- Composer
- Node.js
- NPM
- MySQL
- Laravel Herd or another PHP development environment

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/djlemmor/client-project-tracker-frontend.git
cd client-project-tracker-frontend
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Create the environment file

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

### 5. Generate the Laravel application key

```bash
php artisan key:generate
```

### 6. Configure the database

Create a MySQL database named:

```text
client-project-tracker
```

Then update the database settings in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=client-project-tracker
DB_USERNAME=root
DB_PASSWORD=
```

Update the username and password according to your local environment.

### 7. Run database migrations

```bash
php artisan migrate
```

### 8. Start the Laravel backend

```bash
php artisan serve
```

The API will normally be available at:

```text
http://localhost:8000
```

### 9. Configure the frontend API URL

Set the following in the frontend environment file:

```env
VITE_API_URL=http://localhost:8000/api
```

### 10. Start the frontend

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## API Endpoints

### List Projects

```http
GET /api/projects
```

Returns the list of projects.

### Create Project

```http
POST /api/projects
```

Example request:

```json
{
  "client_name": "ABC Corporation",
  "project_name": "Company Website",
  "description": "Corporate website project.",
  "status": "Planning",
  "priority": "High",
  "start_date": "2026-08-10",
  "due_date": "2026-09-10"
}
```

### Show Project

```http
GET /api/projects/{id}
```

Returns a specific project.

### Update Project

```http
PUT /api/projects/{id}
```

Example request:

```json
{
  "client_name": "ABC Corporation",
  "project_name": "Updated Website",
  "description": "Updated project description.",
  "status": "In Progress",
  "priority": "Medium",
  "start_date": "2026-08-10",
  "due_date": "2026-09-10"
}
```

### Delete Project

```http
DELETE /api/projects/{id}
```

Deletes the specified project.

## Validation

The API validates required project fields and ensures that the due date is not earlier than the start date.

Validation errors are returned using Laravel's standard HTTP `422 Unprocessable Entity` response.

The frontend displays these validation errors next to the corresponding form fields.

## Testing

The backend includes feature tests covering:

- Retrieving projects
- Creating projects
- Updating projects
- Deleting projects
- Required field validation
- Date validation
- Handling non-existent projects
- Database persistence

Run the complete test suite with:

```bash
php artisan test
```

The tests use an isolated SQLite database so that automated tests do not modify the development database.

## Production Build

Build the frontend with:

```bash
npm run build
```

## Project Structure

```text
app/
├── Http/
│   ├── Controllers/
│   └── Requests/
└── Models/

database/
├── factories/
└── migrations/

routes/
└── api.php

tests/
└── Feature/
    └── ProjectTest.php

src/
├── components/
│   ├── ProjectForm.vue
│   └── ProjectTable.vue
├── services/
│   └── api.js
├── App.vue
└── style.css
```

## Design Decisions

### Reusable Project Form

The create and edit operations use the same Vue component. The form determines whether it is creating or updating a project based on whether an existing project is supplied.

This avoids duplicating the same form implementation.

### Server-Side Validation

Laravel remains responsible for validating API requests. Frontend validation is used primarily to provide immediate feedback to the user.

This ensures that the API cannot be bypassed simply by sending requests outside the frontend.

### Frontend Filtering and Sorting

Search, status filtering, priority filtering, and sorting are performed on the currently loaded project data.

This approach keeps the implementation simple and is appropriate for the expected dataset size of the assessment.

For a significantly larger production dataset, these operations could be moved to the API and database layer together with server-side pagination.

### Automated Testing

The backend uses Laravel feature tests to verify API behavior and database persistence.

Tests use an isolated test database so they do not affect development data.

## Assumptions

- The application is intended for a relatively small project dataset.
- Authentication was not implemented unless specifically required by the assessment.
- Search and filtering are performed against the projects loaded by the frontend.
- MySQL is used for normal application development.
- SQLite in-memory is used for automated tests.
