import type { Response } from 'express'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export function success<T>(res: Response, data: T, message = 'success') {
  const body: ApiResponse<T> = {
    code: 200,
    message,
    data,
  }

  return res.json(body)
}

export function failure(res: Response, message = 'server error', code = 500) {
  return res.status(code).json({
    code,
    message,
    data: null,
  })
}
