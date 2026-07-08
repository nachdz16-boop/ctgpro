import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // عرض مؤشر التحميل أثناء التحقق من حالة المصادقة
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مصادقاً، إعادة توجيه إلى صفحة تسجيل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // إذا كانت هناك أدوار مطلوبة ولم يكن دور المستخدم مسموحاً به
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // عرض المحتوى المحمي
  return children;
};

export default ProtectedRoute;