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

// Para controlar toasts duplicados
const activeToasts = new Set<string>();

// Impede toasts duplicados com a mesma mensagem
const preventDuplicate = (message: string, fn: () => Id): Id | null => {
    if (activeToasts.has(message)) {
        return null;
    }
    
    const id = fn();
    activeToasts.add(message);
    
    // Remove da lista quando o toast for fechado
    setTimeout(() => {
        activeToasts.delete(message);
    }, defaultOptions.autoClose as number + 500); // adiciona um buffer para garantir
    
    return id;
};

// Custom toast functions that ensure consistent usage across the app
export const toastService = {
    /**
     * Show a success toast message
     */
    success: (message: string, options?: ToastOptions): Id => {
        return preventDuplicate(message, () => 
            toast.success(message, { ...defaultOptions, ...options })
        ) || -1 as Id;
    },

    /**
     * Show an error toast message
     */
    error: (message: string, options?: ToastOptions): Id => {
        return preventDuplicate(message, () => 
            toast.error(message, { ...defaultOptions, ...options })
        ) || -1 as Id;
    },

    /**
     * Show an info toast message
     */
    info: (message: string, options?: ToastOptions): Id => {
        return preventDuplicate(message, () => 
            toast.info(message, { ...defaultOptions, ...options })
        ) || -1 as Id;
    },

    /**
     * Show a warning toast message
     */
    warning: (message: string, options?: ToastOptions): Id => {
        return preventDuplicate(message, () => 
            toast.warning(message, { ...defaultOptions, ...options })
        ) || -1 as Id;
    },

    /**
     * Wrap a promise with toast notifications
     */
    promise: <T>(
        promise: Promise<T>,
        messages = defaultPromiseMessages,
        options?: ToastOptions
    ): Promise<T> => {
        // Para promises, não usamos prevenção de duplicação já que geralmente queremos mostrar
        // o progresso de cada operação individual
        return toast.promise(promise, {
            pending: messages.pending,
            success: messages.success,
            error: messages.error,
        }, { ...defaultOptions, ...options }) as Promise<T>;
    },

    /**
     * Dismiss all toasts
     */
    dismiss: () => {
        activeToasts.clear();
        toast.dismiss();
    },

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