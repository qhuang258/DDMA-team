import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { HomePage } from '@/pages/HomePage';
import { OrderWizardPage } from '@/pages/order/OrderWizardPage';
import { RecommendationsPage } from '@/pages/checkout/RecommendationsPage';
import { CheckoutReviewPage } from '@/pages/checkout/CheckoutReviewPage';
import { PaymentPage } from '@/pages/checkout/PaymentPage';
import { OrderConfirmationPage } from '@/pages/checkout/OrderConfirmationPage';
import { TrackingPage } from '@/pages/tracking/TrackingPage';
import { OrderHistoryPage } from '@/pages/history/OrderHistoryPage';
import { OrderDetailPage } from '@/pages/history/OrderDetailPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

/**
 * MVP 路径：/login → /order → /recommendations → /checkout → /checkout/pay →
 * /checkout/confirmation → /orders/:orderId/tracking → /history
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="order" element={<OrderWizardPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="checkout" element={<CheckoutReviewPage />} />
        <Route path="checkout/pay" element={<PaymentPage />} />
        <Route path="checkout/confirmation" element={<OrderConfirmationPage />} />
        <Route path="orders/:orderId/tracking" element={<TrackingPage />} />
        <Route path="orders/:orderId/detail" element={<OrderDetailPage />} />
        <Route path="history" element={<OrderHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
