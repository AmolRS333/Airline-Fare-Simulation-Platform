// Browser back navigation utility using React Router
// React Router automatically handles browser back button navigation
// through the useNavigate hook. Simply use navigate(-1) to go back.

export const useGoBack = (navigate) => {
  return () => {
    navigate(-1);
  };
};

// Example usage in a component:
// const navigate = useNavigate();
// const goBack = useGoBack(navigate);
// <button onClick={goBack}>Back</button>
