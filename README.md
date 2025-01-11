# MateMatch

MateMatch is a modern web application designed to help users find compatible roommates and shared housing opportunities. Built with Next.js 14 and Firebase, it provides a seamless experience for connecting people looking for shared living arrangements.

## Features

- 🏠 **Housing Listings**: Browse and manage shared housing opportunities
- 👥 **Roommate Matching**: Find potential roommates based on compatibility
- ⭐ **Saved Listings**: Save your favorite listings for later
- 💬 **Real-time Chat**: Communicate with potential roommates
- 🔔 **Activity Feed**: Stay updated with the latest housing opportunities
- 📱 **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Shadcn/UI, Radix UI, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Data Scraping**: Puppeteer, Cheerio
- **Date Handling**: date-fns
- **State Management**: React Context, Firebase Hooks

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/matematch.git
cd matematch
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
