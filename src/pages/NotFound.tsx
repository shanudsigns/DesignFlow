import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FilePlus } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-9xl font-bold text-primary-200">404</h1>
      <div className="mt-4">
        <h2 className="text-3xl font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <Link to="/" className="btn btn-primary flex items-center">
          <Home size={18} className="mr-2" /> Back to Dashboard
        </Link>
        <Link to="/weekly" className="btn btn-outline flex items-center">
          <FilePlus size={18} className="mr-2" /> View Schedule
        </Link>
      </div>
    </div>
  );
};

export default NotFound;