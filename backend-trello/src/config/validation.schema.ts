 
 
 
import Joi, { ObjectSchema } from 'joi';

// Esquema de validación de variables de entorno
export const validationSchema: ObjectSchema<Record<string, unknown>> =
  Joi.object({
    PORT: Joi.number().default(3000),
    MONGODB_URI: Joi.string().uri().required(),
    N8N_WEBHOOK_URL: Joi.string().uri().required(),
    N8N_TIMEOUT_MS: Joi.number().optional(),
    CORS_ORIGIN: Joi.string().optional(),
  });
