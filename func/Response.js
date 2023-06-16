class Response {
  static unauthorized(res, errors) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "terjadi kesalahan diclient",
      errors: Array.isArray(errors) ? errors : [errors],
      data: [],
    });
  }
  static forbidden(res, errors) {
    return res.status(403).json({
      status: "Forbidden",
      message: "terjadi kesalahan diclient",
      errors: Array.isArray(errors) ? errors : [errors],
      data: [],
    });
  }
  static success(res, message, data = [], user = {}) {
    return res.status(200).json({
      status: "OK",
      message: message,
      errors: [],
      data: data,
      user: user,
    });
  }
  static serverError(res, errors, user = {}) {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "terjadi kesalahan diserver",
      errors: Array.isArray(errors) ? errors : [errors],
      data: [],
      user: user,
    });
  }

  static notFound(res, errors, user = {}) {
    return res.status(404).json({
      status: "Not Found",
      message: "terjadi kesalahan diclient",
      errors: Array.isArray(errors) ? errors : [errors],
      data: [],
      user: user,
    });
  }

  static badRequest(res, errors, user = {}) {
    return res.status(400).json({
      status: "Bad Request",
      message: "terjadi kesalahan diclient",
      errors: Array.isArray(errors) ? errors : [errors],
      data: [],
      user: user,
    });
  }

  static created(res, message, data = [], user = {}) {
    return res.status(201).json({
      status: "Created",
      message: message,
      errors: [],
      data: data,
      user: user,
    });
  }
}

export default Response;
