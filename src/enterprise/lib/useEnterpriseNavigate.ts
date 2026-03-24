import { useNavigate, type NavigateOptions } from 'react-router-dom';

export function useEnterpriseNavigate() {
  const navigate = useNavigate();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      navigate(to);
    } else if (to.startsWith('/app-entreprise') || to.startsWith('http')) {
      navigate(to, options);
    } else {
      navigate(`/app-entreprise${to}`, options);
    }
  };
}
