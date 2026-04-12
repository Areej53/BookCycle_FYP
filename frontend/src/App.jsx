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
  BrowseBooksPage,
  CategoryResultsPage,
  SearchResultsPage,
  BookDetailsPage,
  SellerAddBookPage,
  SellerCategoriesPage,
  SellerPublishedPage,
  SellerReviewPage,
  SellerAddNotesPage,
  CartPage,
} from "./pages";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import { SellerProvider } from "./context/SellerContext";

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
        path: "browse",
        element: <BrowseBooksPage />,
      },
      {
        path: "browse/category/:category",
        element: <CategoryResultsPage />,
      },
      {
        path: "browse/search",
        element: <SearchResultsPage />,
      },
      {
        path: "book/:id",
        element: <BookDetailsPage />,
      },

      {
        element: <ProtectedRoute />,
        children: [
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
            path: "cart",
            element: <CartPage />,
          },
        ],
      },
    ],
  },
]);

function App() {


  return (
    <SellerProvider>
        <RouterProvider router={router} />
        <ToastContainer position='top-center' />
    </SellerProvider>
  )
}

export default App
