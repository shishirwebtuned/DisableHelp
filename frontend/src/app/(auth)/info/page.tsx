import React from 'react';

const Page = async () => {
    const InfoClient = (await import('./InfoClient')).default;
    return (
        <React.Suspense fallback={<div /> }>
            <InfoClient />
        </React.Suspense>
    );
};

export default Page;
