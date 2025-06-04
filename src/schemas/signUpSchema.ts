import { z } from 'zod'

export const signInSchema = z.object({
  identifierkz: z.string(),
  pasword: z.string(),
})
