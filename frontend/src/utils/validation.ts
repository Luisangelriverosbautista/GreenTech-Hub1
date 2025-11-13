export const truncateAddress = (address: string, start: number = 6, end: number = 4) => {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && /^\d*\.?\d{0,7}$/.test(amount);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe incluir al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe incluir al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe incluir al menos un número');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Debe incluir al menos un carácter especial (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  if (name.length < 3) {
    return {
      isValid: false,
      error: 'El nombre debe tener al menos 3 caracteres'
    };
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s]{3,}$/.test(name)) {
    return {
      isValid: false,
      error: 'El nombre solo puede contener letras y espacios'
    };
  }
  
  return { isValid: true };
};