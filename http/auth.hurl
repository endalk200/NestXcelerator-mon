POST http://localhost:3000/api/auth/signup
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "email1@gmail.com",
  "password": "Password$1"
}

# Expect a successful response status code
HTTP 201

[Captures]
userId: jsonpath "$.id"
email: jsonpath "$.email"


# Login
POST http://localhost:3000/api/auth/login
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

{
  "email": "email1@gmail.com",
  "password": "Password$12"
}

