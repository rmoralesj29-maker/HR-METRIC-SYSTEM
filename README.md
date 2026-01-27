# HR Metric System

A local-first HR dashboard for managing employees, tracking tenure and VR rates, and monitoring company-wide sick days.

## Features

- **Employee Management**: Add, edit, and remove employees.
- **Tenure Tracking**: Automatically calculates tenure based on start date.
- **VR Rate**: Explicit VR level tracking (VR0-VR5).
- **Global Sick Days**: Track monthly sick day totals for the company.
- **Dashboard**: Visual analytics for demographics, tenure, and more.
- **Local Persistence**: All data is saved to your browser's LocalStorage.
- **Data Safety**: Export and Import your data to JSON.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

## Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to the local URL (usually http://localhost:5173).

## Data Storage

This application uses **LocalStorage** to persist data. No external database or backend is required.
- **Employees**: `hr_employees`
- **Vacations**: `hr_vacations`
- **Settings**: `hr_settings`

## Development

- **Build**: `npm run build`
- **Preview**: `npm run preview`
