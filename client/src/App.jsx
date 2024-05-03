
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Dashboard, HomeLayout, Landing, Login, Logout, Register, UsersList } from "./pages";
import { ToastContainer, toast } from 'react-toastify';
import OrdersList from "./pages/OrdersList";
import ProductsList from "./pages/ProductsList";
import AdminRegistrationPage from "./pages/adminRegistration";
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
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "users",
        element: <UsersList />,
      },
      {
        path: "orders",
        element: <OrdersList />,
      },
      {
        path: "products",
        element: <ProductsList />,
      },
      {
        path: "registratration",
        element: <AdminRegistrationPage />,
      }


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
