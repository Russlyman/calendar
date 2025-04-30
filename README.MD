# Calendar App

## Contents
`/CalendarApi` - Contains the backend code written in C# ASP.NET Core with Minimal Endpoints.
`/frontend` - Contains the frontend code written in TS/JS React.

## Run Instructions for Development

### Backend
Requires .NET 9

    1. Run commands
    ```bash
    dotnet restore
    dotnet ef database update
    dotnet watch
    ```

### Frontend

Requires Node.JS - Tested on v23

1. Run commands
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
2. Open http://localhost:5173/ in browser.