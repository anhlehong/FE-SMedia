import { createContext, useContext } from "react";
import useFollowing from "../hooks/useFollowing";

const FollowContext = createContext();

export function FollowProvider({ children }) {
  const followState = useFollowing(20);
  return (
    <FollowContext.Provider value={followState}>
      {children}
    </FollowContext.Provider>
  );
}

export function useSharedFollowing() {
  return useContext(FollowContext);
}
