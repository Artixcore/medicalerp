-- JWT Validator Plugin for Kong
-- Validates JWT tokens issued by the User Service
-- Version: 1.0.0

local JWTValidator = {
  PRIORITY = 1000,
  VERSION = "1.0.0",
}

local jwt = require "resty.jwt"
local cjson = require "cjson"

-- Helper function to get JWT secret
local function get_jwt_secret(conf)
  -- Priority: config secret > environment variable > default
  return conf.secret or os.getenv("JWT_SECRET") or "dev-secret-change-in-production"
end

-- Helper function to extract token from Authorization header
local function extract_token(auth_header)
  if not auth_header then
    return nil, "Missing Authorization header"
  end
  
  local token = string.match(auth_header, "^Bearer%s+(.+)")
  if not token then
    return nil, "Invalid Authorization header format. Expected: Bearer <token>"
  end
  
  return token, nil
end

-- Helper function to create error response
local function error_response(status, message, error_detail)
  ngx.status = status
  ngx.header.content_type = "application/json"
  ngx.say(cjson.encode({
    success = false,
    error = {
      code = status == 401 and "UNAUTHORIZED" or "FORBIDDEN",
      message = message,
      details = error_detail
    }
  }))
  ngx.exit(status)
end

-- Access phase: Validate JWT token
function JWTValidator:access(conf)
  -- Skip validation for public endpoints
  if conf.skip_validation then
    return
  end
  
  -- Get Authorization header
  local auth_header = ngx.req.get_headers()["authorization"]
  
  if not auth_header then
    error_response(401, "Unauthorized", "Missing Authorization header")
  end
  
  -- Extract token
  local token, err = extract_token(auth_header)
  if err then
    error_response(401, "Unauthorized", err)
  end
  
  -- Get JWT secret
  local secret = get_jwt_secret(conf)
  
  -- Verify JWT token
  local jwt_obj = jwt:verify(secret, token)
  
  if not jwt_obj.valid then
    local reason = jwt_obj.reason or "Invalid token"
    error_response(401, "Unauthorized", reason)
  end
  
  -- Check token expiration
  if jwt_obj.payload.exp then
    local exp = jwt_obj.payload.exp
    local now = ngx.time()
    if exp < now then
      error_response(401, "Unauthorized", "Token has expired")
    end
  end
  
  -- Extract and add user information to headers for downstream services
  if jwt_obj.payload.sub then
    ngx.req.set_header("X-User-Id", jwt_obj.payload.sub)
  end
  
  if jwt_obj.payload.email then
    ngx.req.set_header("X-User-Email", jwt_obj.payload.email)
  end
  
  if jwt_obj.payload.roles then
    if type(jwt_obj.payload.roles) == "table" then
      ngx.req.set_header("X-User-Roles", table.concat(jwt_obj.payload.roles, ","))
    else
      ngx.req.set_header("X-User-Roles", tostring(jwt_obj.payload.roles))
    end
  end
  
  -- Add token expiration time for downstream services
  if jwt_obj.payload.exp then
    ngx.req.set_header("X-Token-Exp", tostring(jwt_obj.payload.exp))
  end
  
  -- Log successful validation (optional, for debugging)
  if conf.log_success then
    ngx.log(ngx.INFO, "JWT validated successfully for user: ", jwt_obj.payload.email or jwt_obj.payload.sub)
  end
end

-- Schema for plugin configuration
function JWTValidator:new()
  return {
    secret = {
      type = "string",
      required = false,
      default = nil,
      description = "JWT secret key. If not provided, uses JWT_SECRET environment variable."
    },
    skip_validation = {
      type = "boolean",
      required = false,
      default = false,
      description = "Skip JWT validation (for public endpoints)"
    },
    log_success = {
      type = "boolean",
      required = false,
      default = false,
      description = "Log successful JWT validations"
    }
  }
end

return JWTValidator

