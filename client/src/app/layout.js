import './globals.css';
import Navbar from '../components/Navbar';
import AuthInitializer from '../components/AuthInitializer';

export const metadata = {
  title: 'CampusIQ — RAG-Based College Information Assistant',
  description:
    'Instant, hallucination-free answers to college questions on admissions, courses, fees, exams, hostel, scholarships, and campus life.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
        <AuthInitializer>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthInitializer>
      </body>
    </html>
  );
}