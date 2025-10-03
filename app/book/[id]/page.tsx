'use client';

import React from 'react';
import TurfDetailsPage from '@/components/booking/TurfDetailsPage';

interface BookPageProps {
  params: {
    id: string;
  };
}

export default function BookPage({ params }: BookPageProps) {
  return <TurfDetailsPage turfId={params.id} />;
}
