import { useEffect, ReactNode, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    return (isAuthenticated ? children : null) as ReactElement | null;
};

export default ProtectedRoute;