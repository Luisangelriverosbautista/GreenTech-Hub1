import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'donor' as 'donor' | 'creator'
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string[];
    name?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Validar email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido';
      isValid = false;
    }

    // Validar nombre
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
      isValid = false;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors;
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Error during registration:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-8">
          Registro en GreenTech Hub
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {authError && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {authError}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.password && (
                <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                  {errors.password.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Tipo de Usuario
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="donor">Donante</option>
                <option value="creator">Creador de Proyectos</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Registrarse
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 hover:text-green-700"
          >
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;