import { RedirectToSignIn, useUser } from '@clerk/clerk-react';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  // While Clerk is loading user info
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <div className="animate-pulse text-lg">Authenticating...</div>
      </div>
    );
  }

  // If user is not signed in, redirect to sign-in
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
}

