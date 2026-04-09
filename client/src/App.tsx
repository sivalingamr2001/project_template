import { useAuthContext } from "@/features/auth";
import { router } from "@/router/routes";
import { queryClient } from "@/shared/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";

function App() {
    const auth = useAuthContext();

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} context={{ auth, queryClient }} />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
    );
}

export default App