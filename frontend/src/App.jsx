import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Custom scroll restoration component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import {
  ForgotPassword,
  HomeLayout,
  Landing,
  Login,
  Logout,
  Register,
  ResetPassword,
  NotFoundPage,
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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <HomeLayout />
      </>
    ),
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
            element: <SellerAddBookPage />,
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
    path: "*",
    element: <NotFoundPage />,
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
