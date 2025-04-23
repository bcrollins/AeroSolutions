# Views

This directory contains view templates for the application.

## Purpose

Views render HTML responses to clients. While most of the application is built as a single-page React app, the application also serves some static HTML pages and templates.

## Current Implementation

The application currently serves static HTML pages from the `public` directory:

- `public/index.html`: Main landing page
- `public/test.html`: Test page for API testing
- `public/login.html`: Login page

These static HTML pages are served directly by Express in `simple-server.js`:

```javascript
// Basic routes for HTML pages
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
```

## React Components

Most of the UI is built with React components located in the `client/src/components` directory:

- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- Layout components in `client/src/layouts/`

## Future Organization

If the application needs server-rendered views in the future, this directory can be used to store view templates (e.g., EJS, Pug, or Handlebars templates). For now, it serves as documentation for the current view structure.

## Example View Organization

```
views/
├── layouts/         # Layout templates
│   ├── main.ejs     # Main layout with header and footer
│   └── admin.ejs    # Admin layout with sidebar
├── partials/        # Reusable view partials
│   ├── header.ejs   # Header partial
│   ├── footer.ejs   # Footer partial
│   └── sidebar.ejs  # Sidebar partial
├── pages/           # Page templates
│   ├── home.ejs     # Home page template
│   ├── login.ejs    # Login page template
│   └── error.ejs    # Error page template
└── emails/          # Email templates
    ├── welcome.ejs  # Welcome email template
    └── reset.ejs    # Password reset email template
```

## Static Assets

Static assets like CSS, JavaScript, and images are served from the `public` directory.