import { toast, ToastOptions, Id } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

// Default messages for promise toasts
const defaultPromiseMessages = {
    pending: 'Processando...',
    success: 'Operação concluída',
    error: 'Ocorreu um erro',
};

// Custom toast functions that ensure consistent usage across the app
export const toastService = {
    /**
     * Show a success toast message
     */
    success: (message: string, options?: ToastOptions): Id => {
        return toast.success(message, { ...defaultOptions, ...options });
    },

    /**
     * Show an error toast message
     */
    error: (message: string, options?: ToastOptions): Id => {
        return toast.error(message, { ...defaultOptions, ...options });
    },

    /**
     * Show an info toast message
     */
    info: (message: string, options?: ToastOptions): Id => {
        return toast.info(message, { ...defaultOptions, ...options });
    },

    /**
     * Show a warning toast message
     */
    warning: (message: string, options?: ToastOptions): Id => {
        return toast.warning(message, { ...defaultOptions, ...options });
    },

    /**
     * Wrap a promise with toast notifications
     */
    promise: <T>(
        promise: Promise<T>,
        messages = defaultPromiseMessages,
        options?: ToastOptions
    ): Promise<T> => {
        return toast.promise(promise, {
            pending: messages.pending,
            success: messages.success,
            error: messages.error,
        }, { ...defaultOptions, ...options }) as Promise<T>;
    },

    /**
     * Dismiss all toasts
     */
    dismiss: () => toast.dismiss(),

    /**
     * Dismiss a specific toast by ID
     */
    dismissById: (id: Id) => toast.dismiss(id),

    /**
     * Update an existing toast
     */
    update: (id: Id, options: ToastOptions) => toast.update(id, options),
};

export default toastService; 