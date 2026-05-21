import React from 'react';
import Head from 'next/head';
import Header from '../components/Header';

const HomePage = () => {
    return (
        <>
            <Head>
                <title>Admin Portal</title>
                <meta name="description" content="Admin portal for managing users and content." />
            </Head>
            <Header />
            <main>
                <h1>Welcome to the Admin Portal</h1>
                <p>Please log in to access the dashboard.</p>
            </main>
        </>
    );
};

export default HomePage;