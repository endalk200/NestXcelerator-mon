default:
  just --list

# Get overall server health request
health:
  hurl --from-entry 1 ./http/core.hurl | jq

signup:
  hurl --json --from-entry 1 ./http/auth.hurl | jq -r '.entries[0].captures | map("\(.name)=\(.value)") | .[]' > ./http/auth.env

login:
  hurl --json --from-entry 2 ./http/auth.hurl | jq -r '.entries[0].captures | map("\(.name)=\(.value)") | .[]' > ./http/auth.env

# docker-compose up
docker-up:
  docker-compose up -d
