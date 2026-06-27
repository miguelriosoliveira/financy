import { toast } from 'react-toastify';

const AUTH_REDIRECT_TOAST_ID = 'auth-redirect';

export function notifyAuthRedirect() {
	toast.error('Falha de autenticação, redirecionando...', {
		toastId: AUTH_REDIRECT_TOAST_ID,
	});
}
