import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  ForgotPassword,
  HomeLayout,
  Landing,
  Login,
  Logout,
  Register,
  ResetPassword,
  HomePage,
  ExploreBooksPage,
  CategoryResultsPage,
  SearchResultsPage,
  BookDetailsPage,
  SellerAddBookPage,
  SellerCategoriesPage,
  SellerPublishedPage,
  SellerReviewPage,
  SellerAddNotesPage,
  CartPage,
  CheckoutPage,
  WishlistPage,
  RideDetailsPage,
  ConfirmPaymentPage,
  OrderTrackingPage,
  ExchangeCategoriesPage,
} from "./pages";
import DashboardPage from "./pages/DashboardPage";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import { SellerProvider } from "./context/SellerContext";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerRequestPage from "./pages/SellerRequestPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminSellerRequests from "./pages/admin/AdminSellerRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminSellerListings from "./pages/admin/AdminSellerListings";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminExchange from "./pages/admin/AdminExchange";
import AdminRent from "./pages/admin/AdminRent";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "explore",
        element: <ExploreBooksPage />,
      },
      {
        path: "rent/categories",
        element: <SellerCategoriesPage />,
      },
      {
        path: "exchange/categories",
        element: <ExchangeCategoriesPage />,
      },
      {
        path: "explore/category/:category",
        element: <CategoryResultsPage />,
      },
      {
        path: "explore/search",
        element: <SearchResultsPage />,
      },
      {
        path: "book/:id",
        element: <BookDetailsPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "wishlist",
        element: <WishlistPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "seller",
            element: <SellerCategoriesPage />,
          },
          {
            path: "seller/add",
            element: <SellerRequestPage />,
          },
          {
            path: "seller/categories",
            element: <SellerCategoriesPage />,
          },
          {
            path: "seller/notes/add",
            element: <SellerAddNotesPage />,
          },
          {
            path: "seller/published",
            element: <SellerPublishedPage />,
          },
          {
            path: "seller/review",
            element: <SellerReviewPage />,
          },
          {
            path: "checkout",
            element: <CheckoutPage />,
          },
          {
            path: "seller-ride",
            element: <RideDetailsPage />,
          },
          {
            path: "confirm-payment",
            element: <ConfirmPaymentPage />,
          },
          {
            path: "order-tracking",
            element: <OrderTrackingPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "seller-requests",
        element: <AdminSellerRequests />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "sellers",
        element: <AdminSellers />,
      },
      {
        path: "sellers/:sellerId/listings",
        element: <AdminSellerListings />,
      },
      {
        path: "books",
        element: <AdminBooks />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "rent",
        element: <AdminRent />,
      },
      {
        path: "exchange",
        element: <AdminExchange />,
      },
      {
        path: "payments",
        element: <AdminPayments />,
      },
      {
        path: "deliveries",
        element: <AdminDeliveries />,
      },
      {
        path: "notifications",
        element: <AdminNotifications />,
      },
      {
        path: "reports",
        element: <AdminReports />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
]);

function App() {


  return (
    <SellerProvider>
      <RouterProvider router={router} />
    </SellerProvider>
  )
}

export default App
