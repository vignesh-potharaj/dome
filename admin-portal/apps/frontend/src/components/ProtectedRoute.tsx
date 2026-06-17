import { useEffect, useState, ReactNode, ReactElement } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, mounted, router]);

    if (!mounted) {
        return null;
    }

    return (isAuthenticated ? children : null) as ReactElement | null;
};

export default ProtectedRoute;