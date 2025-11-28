FROM kong:3.4

# Copy Kong configuration
COPY kong.conf /etc/kong/kong.conf

# Copy declarative configuration
COPY kong.yml /kong/kong.yml

# Set environment variable for declarative config
ENV KONG_DECLARATIVE_CONFIG=/kong/kong.yml

# Expose ports
EXPOSE 8000 8443 8001 8444 8002

# Use Kong's default entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["kong", "docker-start"]

