# MARASSI Transport & Logistics

Modern logistics and transportation website built with HTML, CSS, and JavaScript.

## Features

- Responsive design
- Multi-page layout (Home, About, Services, Projects, Contact)
- Animated UI elements
- Service worker for offline capability
- SEO optimized
- Accessibility features
- Cookie consent management
- Form validation

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework**: Bootstrap 5
- **Animations**: AOS, GSAP
- **Icons**: Phosphor Icons
- **Server**: Express.js (Node.js)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Visit
http://localhost:3000
```

## Deployment

This project is configured for **Bolt.new** deployment:

- Express server handles all routes
- Static files served from root directory
- Dynamic PORT configuration for cloud environments
- 404 error handling included

## Project Structure

```
├── index.html              # Homepage
├── about.html              # About page
├── service.html            # Services page
├── project.html            # Projects page
├── contact.html            # Contact page
├── privacy-policy.html     # Privacy policy
├── terms-of-service.html   # Terms of service
├── 404.html                # Error page
├── 500.html                # Server error page
├── server.js               # Express server
├── assets/
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   ├── images/             # Images and icons
│   └── lang/               # Language files (EN/AR)
└── package.json            # Dependencies
```

## Available Pages

- **Home**: Main landing page with company overview
- **About**: Company history and team information
- **Services**: Transportation and logistics services
- **Projects**: Portfolio of completed projects
- **Contact**: Contact form and information
- **Privacy Policy**: Privacy and data handling policy
- **Terms of Service**: Terms and conditions

## Environment Variables

No environment variables required for basic deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - See LICENSE file for details

## Contact

MARASSI Transport & Logistics
