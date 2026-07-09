export const getRiskColor = (level) => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getRiskBadge = (level) => {
  switch (level) {
    case 'low': return '🟢 Low Risk';
    case 'moderate': return '🟡 Moderate Risk';
    case 'high': return '🔴 High Risk';
    default: return '⚪ Unknown';
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const getErrorMessage = (err) => {
  if (err.response?.data?.errors?.length) {
    return err.response.data.errors[0].msg;
  }
  return err.response?.data?.message || err.message || 'Something went wrong.';
};
