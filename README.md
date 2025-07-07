# Social Network Development (Frontend)

This repository contains the frontend for **Social Network Development**, a dynamic web application designed for seamless social interactions. Built with Next.js and React 18, it provides an intuitive user interface for secure authentication, real-time messaging, group management, and social networking features. The frontend integrates with the .NET 8.0 backend to deliver a responsive and engaging user experience, leveraging modern libraries and tools for performance and scalability.

## Table of Contents
- [Preview](#preview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Related Repositories](#related-repositories)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Preview
Below are key screens from the frontend application:

- **Login Screen**: Secure user authentication interface.  
  ![Login Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862190/Screenshot_2025-07-01_174204_dffcjs.png)

- **Registration Screen**: User-friendly signup form.  
  ![Registration Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862189/Screenshot_2025-07-01_174245_kxwsy9.png)

- **OTP Verification Screen**: Secure account verification via OTP.  
  ![OTP Verification Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862187/Screenshot_2025-07-01_174340_dzr0lk.png)

- **Real-Time Chat Screen**: Interactive messaging interface.  
  ![Real-Time Chat Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862185/Screenshot_2025-07-01_174409_ft1xxr.png)

- **Friend Search Screen**: Efficient friend discovery.  
  ![Friend Search Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862181/Screenshot_2025-07-01_174735_a5rqaa.png)

- **Group Search Screen**: Browse and discover groups.  
  ![Group Search Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862180/Screenshot_2025-07-01_174808_l9jhly.png)

- **Join Group Screen**: Interface for joining groups.  
  ![Join Group Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862182/Screenshot_2025-07-01_174640_tw0hih.png)

- **Create Group Screen**: Form for creating new groups.  
  ![Create Group Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862178/Screenshot_2025-07-01_174842_yw6jkm.png)

- **Admin Report Management Screen**: Tools for managing group reports.  
  ![Admin Report Management Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862177/Screenshot_2025-07-01_174912_y2nrzs.png)

- **Post Approval Screen**: Interface for approving group posts.  
  ![Post Approval Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862177/ph%C3%AA_duy%E1%BB%87t_b%C3%A0i_%C4%91%C4%83ng_trong_nh%C3%B3m_pwllht.png)

- **Member Management Screen**: Admin tools for managing group members.  
  ![Member Management Screen](https://res.cloudinary.com/dapvvdxw7/image/upload/v1751862176/Screenshot_2025-07-01_174935_ul0r8s.png)

## Features
- **Secure Authentication**: User-friendly login and registration screens with OTP verification for enhanced security.
- **Real-Time Messaging**: Interactive chat interface for instant communication, powered by Socket.IO integration.
- **Profile Management**: Seamless interface for updating user profiles, including display names and bios.
- **Group Interactions**: Supports group creation, joining, and management, with features for post moderation and member administration.
- **Search Functionality**: Efficient search for friends and groups, with infinite scroll for smooth browsing.
- **Admin Tools**: Dedicated screens for group admins to manage reports, approve posts, and oversee members.
- **Responsive Design**: Optimized for both desktop and mobile devices using Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14.2.12, React 18
- **State Management**: SWR for efficient data fetching and caching
- **HTTP Client**: Axios for API communication
- **Styling**: Tailwind CSS
- **Icons**: Heroicons, Lucide React
- **File Storage**: Azure Blob Storage for media uploads
- **Date Handling**: date-fns for date formatting
- **Emoji Support**: emoji-picker-react for chat enhancements
- **Infinite Scroll**: react-infinite-scroll-component for dynamic content loading
- **Testing**: Jest, Testing Library for React
- **Linting**: ESLint with Next.js configuration

## Related Repositories
- **Backend**: [https://github.com/anhlehong/SMedia](https://github.com/anhlehong/SMedia) - The .NET 8.0 backend for Social Network Development. Refer to its README for setup instructions.

## Prerequisites
Before setting up the frontend, ensure you have:
- **Node.js**: Version 18.x or higher
- **Git**: For cloning the repository
- **Backend Setup**: The backend repository ([SMedia](https://github.com/anhlehong/SMedia)) must be running and accessible (e.g., at `http://localhost:5000`)
- (Optional) VS Code or another code editor for development

## Setup Instructions
1. **Clone the Frontend Repository**:
   ```bash
   git clone https://github.com/anhlehong/FE-SMedia.git
   cd FE-SMedia
   ```

2. **Install Dependencies**:
   Install the required npm packages:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root of the frontend project (`FE-SMedia`) to configure environment variables. Follow these steps:
   - Create the `.env.local` file:
     ```bash
     touch .env.local
     ```
   - Open `.env.local` in a text editor and add the following configuration:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5000
     NEXT_PUBLIC_AZURE_BLOB_CONNECTION_STRING=your_azure_blob_connection_string
     ```
   - **NEXT_PUBLIC_API_URL**: Set to the backend URL (e.g., `http://localhost:5000` for local development or the deployed backend URL).
   - **NEXT_PUBLIC_AZURE_BLOB_CONNECTION_STRING**: Obtain from your Azure Blob Storage account. Use the format:
     ```env
     DefaultEndpointsProtocol=https;AccountName=<your-account-name>;AccountKey=<your-account-key>;EndpointSuffix=core.windows.net
     ```
     Replace `<your-account-name>` and `<your-account-key>` with your Azure credentials.
   - **Note**: Do not commit the `.env.local` file to Git; ensure it’s listed in `.gitignore`.

## Running the Application
1. Ensure the backend is running (refer to the backend README for instructions).
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:3000` (or the port specified in the project configuration).

   **Note**: Ensure the backend API (`NEXT_PUBLIC_API_URL`) and Azure Blob Storage are accessible before starting the application.

## Testing
Run unit tests to verify the frontend functionality:
```bash
npm run test
```
For continuous testing during development:
```bash
npm run test:watch
```

Run linting to ensure code quality:
```bash
npm run lint
```

## Contributing
Contributions are welcome! Follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
