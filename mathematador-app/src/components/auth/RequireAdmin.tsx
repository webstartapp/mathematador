import { Redirect } from "expo-router";
import { FC, JSX, ReactNode } from "react";
import { useSelector } from "react-redux";

import { selectIsAdmin, selectIsAuthenticated } from "@/redux/selectors/auth";

interface RequireAdminProps {
  children: ReactNode;
}

// An unauthenticated visitor lands on "/", which itself shows AuthStack
// (Login); an authenticated-non-admin visitor lands on "/" and gets
// GameStack back - no separate redirect target is needed for either case.
const RequireAdmin: FC<RequireAdminProps> = ({ children }): JSX.Element => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated || !isAdmin) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
