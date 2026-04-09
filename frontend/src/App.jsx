import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Dashboard,
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
  CartPage,
} from "./pages";
import { ToastContainer } from "react-toastify";

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
        path: "dashboard",
        element: <Dashboard />,
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
        path: "sell",
        element: <SellerAddBookPage />,
      },
      {
        path: "sell/categories",
        element: <SellerCategoriesPage />,
      },
      {
        path: "sell/published",
        element: <SellerPublishedPage />,
      },
      {
        path: "sell/review",
        element: <SellerReviewPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
    ],
  },
]);

function App() {


  return (
    <>
        <RouterProvider router={router} />
        <ToastContainer position='top-center' />
    </>
  )
}

export default App
