import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToLogin: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
       navigate("/login", { replace: true });// redirect to /login
    }, [navigate]);

    return null; // nothing renders
};

export default RedirectToLogin;
