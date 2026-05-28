import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import GuestModal from '../components/auth/GuestModal';
import Toast from '../components/ui/Toast';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <GuestModal />
      <Toast />
    </div>
  );
}
