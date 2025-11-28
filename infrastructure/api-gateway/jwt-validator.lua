-- Custom JWT Validator Plugin for Kong
-- This plugin validates JWT tokens issued by the User Service

local JWTValidator = {
  PRIORITY = 1000,
  VERSION = "1.0.0",
}

local jwt = require "resty.jwt"
local cjson = require "cjson"

function JWTValidator:access(conf)
  local auth_header = ngx.req.get_headers()["authorization"]
  
  if not auth_header then
    ngx.status = 401
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({
      message = "Unauthorized",
      error = "Missing Authorization header"
    }))
    ngx.exit(401)
  end

  local token = string.match(auth_header, "^Bearer%s+(.+)")
  if not token then
    ngx.status = 401
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({
      message = "Unauthorized",
      error = "Invalid Authorization header format"
    }))
    ngx.exit(401)
  end

  -- Get JWT secret from environment or config
  local secret = os.getenv("JWT_SECRET") or conf.secret or "dev-secret-change-in-production"
  
  -- Verify JWT token
  local jwt_obj = jwt:verify(secret, token)
  
  if not jwt_obj.valid then
    ngx.status = 401
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({
      message = "Unauthorized",
      error = jwt_obj.reason or "Invalid token"
    }))
    ngx.exit(401)
  end

  -- Add user info to headers for downstream services
  if jwt_obj.payload.sub then
    ngx.req.set_header("X-User-Id", jwt_obj.payload.sub)
  end
  if jwt_obj.payload.email then
    ngx.req.set_header("X-User-Email", jwt_obj.payload.email)
  end
  if jwt_obj.payload.roles then
    ngx.req.set_header("X-User-Roles", table.concat(jwt_obj.payload.roles, ","))
  end
end

return JWTValidator

