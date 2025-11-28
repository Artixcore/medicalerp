-- Schema definition for JWT Validator plugin
return {
  name = "jwt-validator",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            secret = {
              type = "string",
              required = false,
              default = nil,
              description = "JWT secret key. If not provided, uses JWT_SECRET environment variable."
            }
          },
          {
            skip_validation = {
              type = "boolean",
              required = false,
              default = false,
              description = "Skip JWT validation (for public endpoints)"
            }
          },
          {
            log_success = {
              type = "boolean",
              required = false,
              default = false,
              description = "Log successful JWT validations"
            }
          }
        }
      }
    }
  }
}

