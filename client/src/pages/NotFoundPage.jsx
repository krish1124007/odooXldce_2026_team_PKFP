import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-16">
      <EmptyState
        title="404 — Destination Not Found"
        description="The page or itinerary you are looking for does not exist or has been moved."
        icon={Compass}
        action={
          <Link to="/dashboard">
            <Button variant="primary" icon={Home}>Return to Dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
