# Jia Web Application

Jia is a web application built with Next.js that appears to provide interview assistance, opportunity management, and communication tools. This README provides comprehensive information about the project, how to set it up, run it, and deploy it.

## Tech Stack

- **Frontend**:

  - Next.js 15.x (with App Router)
  - React 19.x
  - SASS/SCSS for styling
  - TypeScript

- **Backend**:

  - Next.js API Routes (serverless functions)
  - MongoDB 6.x for database
  - Firebase 11.x for authentication and storage

- **Key Libraries**:

  - **UI Components**: React Quill (rich text editor), React Tooltip, SweetAlert2
  - **Data Visualization**: Reaviz, UpsetJS Venn.js
  - **Forms & Validation**: React Hook Form patterns, custom validation
  - **File Handling**: React Drag Drop Files, React PDF Renderer
  - **Utilities**: Axios (HTTP client), Moment.js (dates), Fuse.js (fuzzy search)
  - **Notifications**: React Toastify, Mailgun, Nodemailer

- **APIs & Services**:

  - OpenAI API integration (v4.x)
  - Socket.io for real-time communication
  - External Core API for CV processing
  - AWS S3 for file storage
  - Google APIs integration

- **DevOps**:
  - Vercel for deployment
  - Git for version control

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB account (for database connection)
- Firebase account (for authentication)
- OpenAI API key

## Getting Started

### Setting Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in the required environment variables in `.env`:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Firebase
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json

# App Configuration
NEXT_PUBLIC_CORE_API_URL=your_backend_api_url
```

### Installing Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### Running Locally

Development mode with hot reloading (using Turbopack):

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Starting Production Server

```bash
npm run start
# or
yarn start
```

### Additional Scripts

Clean project (removes node_modules, .next, bun.lock, next-env.d.ts):

```bash
npm run clean
# or
yarn clean
```

## Project Structure

```
jia-web-app/
├── .env                                       # Environment variables
├── .env.example                               # Example env configuration
├── .gitignore                                 # Git ignore file
├── next-env.d.ts                              # TS declarations for Next.js
├── package.json                               # Dependencies and scripts
├── public/                                    # Static assets
│   ├── assets/                                # Feature images and icons
│   ├── css/                                   # Global CSS files
│   ├── icons/                                 # SVG icons
│   ├── iconsV3/                               # Latest icon set
│   └── images/                                # Static images
├── src/                                       # Source code
│   ├── app/                                   # Next.js App Router structure
│   │   ├── api/                               # API routes
│   │   │   ├── add-career/                    # Create new career
│   │   │   ├── save-career-draft/             # Save draft careers
│   │   │   ├── update-career/                 # Update existing careers
│   │   │   ├── get-careers/                   # Fetch careers
│   │   │   ├── whitecloak/                    # CV screening APIs
│   │   │   └── job-portal/                    # Job portal APIs
│   │   ├── recruiter-dashboard/               # Recruiter interface
│   │   │   └── careers/
│   │   │       ├── new-career/                # Create new job posting
│   │   │       ├── edit-career/               # Edit existing job
│   │   │       └── manage/                    # Manage job postings
│   │   ├── job-portal/                        # Job seeker interface
│   │   ├── applicant/                         # Applicant tracking
│   │   ├── interview/                         # Interview related pages
│   │   ├── my-interviews/                     # User interviews management
│   │   ├── login/                             # Authentication pages
│   │   ├── talk/                              # Communication features
│   │   ├── layout.tsx                         # Root layout
│   │   └── page.tsx                           # Home page
│   └── lib/                                   # Shared libs and utils
│       ├── components/                        # Reusable UI components
│       │   ├── CareerComponents/              # Job posting components
│       │   │   ├── CareerFormV2.tsx           # New multi-step form
│       │   │   ├── CareerDetailsStep.tsx      # Step 1: Job details
│       │   │   ├── CVScreeningStep.tsx        # Step 2: CV screening
│       │   │   ├── AIInterviewSetupStep.tsx   # Step 3: AI interview
│       │   │   ├── ReviewStep.tsx             # Step 4: Review
│       │   │   ├── SalaryInput.tsx            # Salary input field
│       │   │   ├── AssessmentBadge.tsx        # Assessment badges
│       │   │   ├── TipsBox.tsx                # Tips component
│       │   │   ├── StepIndicator.tsx          # Progress indicator
│       │   │   ├── SubstepContainer.tsx       # Sub-step wrapper
│       │   │   └── FieldErrorMessage.tsx      # Error messages
│       │   ├── Dropdown/                      # Dropdown components
│       │   │   ├── CustomDropdownV2.tsx       # Enhanced dropdown
│       │   │   └── PreScreeningDropdown.tsx   # Pre-screening dropdown
│       │   ├── DataTables/                    # Table components
│       │   └── screens/                       # Screen components
│       │       └── UploadCV.tsx               # CV upload with pre-screening
│       ├── hooks/                             # Custom React hooks
│       │   ├── useCareerFormSubmission.ts     # Form submission
│       │   ├── useCareerDraftAutoSave.ts      # Auto-save drafts
│       │   └── usePreScreeningQuestions.ts    # Pre-screening logic
│       ├── styles/                            # SCSS modules
│       │   ├── screens/
│       │   │   ├── careerForm.module.scss     # Career form styles
│       │   │   ├── salaryInput.module.scss    # Salary input styles
│       │   │   └── uploadCV.module.scss       # CV upload styles
│       │   └── commonV2/
│       │       ├── dropdownV2.module.scss     # Dropdown styles
│       │       └── richTextEditor.module.scss # Editor styles
│       ├── utils/                             # Utility functions
│       │   ├── locations.ts                   # Location utilities
│       │   ├── currency.ts                    # Currency utilities
│       │   ├── sanitize.ts                    # HTML sanitization
│       │   └── constantsV2.ts                 # Constants
│       ├── context/                           # React contexts
│       ├── firebase/                          # Firebase configuration
│       ├── mongoDB/                           # MongoDB utilities
│       ├── Modal/                             # Modal components
│       ├── Loader/                            # Loading UI components
│       ├── PageComponent/                     # Page-specific components
│       ├── VoiceAssistant/                    # Voice interaction features
│       ├── CareerFormUtils.tsx                # Career form utilities
│       ├── Utils.tsx                          # General utilities
│       └── definitions.ts                     # TypeScript definitions
└── tsconfig.json                              # TypeScript configuration
```

## Key Features

- App Router-based routing system
- Authentication with Firebase
- Data storage with MongoDB
- Real-time communication with Socket.io
- AI-powered features using OpenAI

## Deployment with Vercel

### Preparing for Deployment

1. Make sure your project is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

2. Ensure all environment variables are properly set in your local `.env` file.

### Deploying to Vercel

1. Create an account on [Vercel](https://vercel.com) if you don't have one.

2. From the Vercel dashboard, click "New Project".

3. Import your Git repository.

4. Configure project:

   - Set the framework preset to "Next.js"
   - Configure the environment variables (copy from your `.env` file)
   - Add any additional build settings if needed

5. Click "Deploy".

### Updating Environment Variables on Vercel

1. Go to your project on Vercel dashboard.
2. Navigate to "Settings" > "Environment Variables".
3. Add or update your environment variables as needed.
4. Redeploy your application for the changes to take effect.

### Setting up a Custom Domain

1. In your Vercel project, go to "Settings" > "Domains".
2. Add your custom domain and follow the verification steps.

## Contributing

Please follow the existing code style and organization when contributing to the project. Make use of TypeScript for type safety.

## Troubleshooting

- If you encounter issues with the MongoDB connection, verify your connection string and network access settings.
- For Firebase authentication problems, check your Firebase service account credentials.
- For development issues, try running `npm run clean` followed by `npm install` and `npm run dev`.
