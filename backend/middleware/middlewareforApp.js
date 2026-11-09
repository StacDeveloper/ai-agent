export const middlewareforApp = (err, req, res, next) => {
    if (err.type === 'entity.too.large') err = new HttpError(413, 'Request body is too large')
    if (err.type === 'entity.parse.failed') err = new HttpError(400, 'Body is not valid JSON')
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) log('error', 'request_failed', { method: req.method, path: req.path, error: err.message })
    res.status(status).json({ error: status >= 500 ? 'Something went wrong on out side. Please try again later.' : err.message })
}